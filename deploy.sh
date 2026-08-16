#!/bin/bash
set -e

# Configuration - CHANGE THESE!
VPS_USER="fahimimam"         # Your VPS username
VPS_HOST="103.42.5.178"           # Your VPS IP
VPS_PATH="/var/www/portfolio"     # Deployment path

echo "🔨 Building Hugo site..."
hugo --minify

echo ""
echo "📊 Build stats:"
du -sh public/
echo "Files: $(find public -type f | wc -l)"
echo ""

read -p "Deploy to VPS? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "🚀 Deploying to VPS..."

    rsync -avz --delete \
        --exclude='.DS_Store' \
        --exclude='.git' \
        --progress \
        public/ $VPS_USER@$VPS_HOST:$VPS_PATH/

    echo ""
    echo "✅ Deployment complete!"
    echo "🌐 Visit: http://$VPS_HOST"
    echo "🌐 Or: http://fahimimam.pro.bd (once DNS propagates)"
else
    echo "❌ Deployment cancelled"
fi
