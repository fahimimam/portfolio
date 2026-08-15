---
title: "Atomic writes in Go: temp file, fsync, rename"
date: 2026-08-15
draft: false
summary: "Every write to data.json in lunch-tracker goes through a temp file in the same directory, an explicit fsync, then a rename. Three lines of reasoning turn that into correctness."
tags: ["Go", "Persistence", "Linux", "POSIX"]
categories: ["Blog", "Go"]
series: ""
series_part: 0
cover: { image: "", alt: "" }
ShowToc: false
hideFromSearch: false
---

The [lunch-tracker](/projects/lunch-tracker/) backend persists one JSON file per write. Every record is small. The file is rewritten on every clock-in, every clock-out, every prune. The naive implementation — `os.WriteFile(path, buf, 0644)` — is "correct" until the process crashes, the VPS loses power, or someone `kill -9`s it mid-write. Then it's a 50/50 whether the file on disk is the previous version, the new version, or a half-written JSON that won't parse.

The fix is the standard POSIX dance: write to a temp file, `fsync`, then `rename`. It fits in 30 lines and gives you a real durability guarantee.

## The function

```go
// flushLocked writes the in-memory map atomically: encode to a
// temp file in the same directory and rename over the destination.
// Caller must hold writeMu.
func (s *Store) flushLocked() error {
    s.mu.RLock()
    buf, err := json.MarshalIndent(s.records, "", "  ")
    s.mu.RUnlock()
    if err != nil {
        return fmt.Errorf("encode %s: %w", s.path, err)
    }

    dir := filepath.Dir(s.path)
    tmp, err := os.CreateTemp(dir, "data-*.json.tmp")
    if err != nil {
        return fmt.Errorf("create temp: %w", err)
    }
    tmpName := tmp.Name()
    cleanup := func() { _ = os.Remove(tmpName) }

    if _, err := tmp.Write(buf); err != nil {
        _ = tmp.Close()
        cleanup()
        return fmt.Errorf("write temp: %w", err)
    }
    if err := tmp.Sync(); err != nil {        // <- fsync
        _ = tmp.Close()
        cleanup()
        return fmt.Errorf("sync temp: %w", err)
    }
    if err := tmp.Close(); err != nil {
        cleanup()
        return fmt.Errorf("close temp: %w", err)
    }
    if err := os.Rename(tmpName, s.path); err != nil {
        cleanup()
        return fmt.Errorf("rename: %w", err)
    }
    return nil
}
```

Three properties fall out of this pattern.

## 1. The temp file lives in the same directory as the destination

`os.CreateTemp(dir, "data-*.json.tmp")` — the `dir` is `filepath.Dir(s.path)`, not `os.TempDir()`. This matters because of the next property.

## 2. `rename(2)` is atomic on POSIX — but only on the same filesystem

A `rename` syscall within one filesystem is atomic: at any instant, a reader either sees the old path or the new path, never a half-state. This is the kernel guarantee the pattern is built on.

But "atomic within one filesystem" is a real constraint. If the temp file lives in `/tmp` (often tmpfs) and the destination lives in `/var/lib/lunch-tracker/data.json` (likely ext4), then `rename` falls back to copy + delete, which is not atomic. Creating the temp in the **same directory** keeps the two paths on the same filesystem, so the rename is atomic.

## 3. `tmp.Sync()` is `fsync(2)`, and it's the part most people skip

`os.File.Write` returns as soon as the data is in the kernel's page cache. Without `Sync`, a power loss between `Write` returning and the kernel flushing the page cache to disk leaves you with an empty or partial file — even if `rename` was atomic.

`Sync` calls `fsync(2)` on the file, which blocks until the data and metadata are on the platter (or SSD). It's slow — a `Sync` per write is enough to make this unsuitable for hot-path databases — but for a configuration-style write at maybe one per minute, the cost is invisible and the safety is real.

After `rename`, the file is durable. A crash anywhere before that point leaves either the previous version of the file or a partial temp file — never a partial destination file.

## The cleanup pattern

Every error path calls `cleanup()`, which is `_ = os.Remove(tmpName)`. Without that, every crash leaks a `data-*.json.tmp` file in the data directory. Over months, you accumulate hundreds of them. With it, the directory stays clean.

`_ = os.Remove(...)` deliberately ignores the error: if the file is already gone (e.g. another goroutine cleaned it up first), that's fine. The cleanup function is best-effort.

## The lock naming convention

`flushLocked` and `pruneOldRecordsLocked` both end in `Locked`. That's the convention I borrowed from the Go standard library: the `Locked` suffix is a contract — "the caller must hold the lock." There's no enforcement; it's just a name. But the comment block above the function states it explicitly, and that makes a code review catch missing-lock bugs at a glance.

## When to use this pattern

Any time a single process writes a small file that humans (or you, debugging at 2 AM) will read back:

- **JSON config files** — yes, use this.
- **SQLite databases** — the SQLite library does this internally; you don't need to.
- **Write-ahead logs** — yes, this is the same pattern under a different name.
- **Bulk data files** (GBs) — no. The `Sync` per write is too expensive.

The whole pattern is twenty lines. It's the kind of code you write once, copy forever, and never have to think about again — except on the days when you do, and then it saves you.