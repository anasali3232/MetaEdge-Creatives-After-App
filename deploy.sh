#!/bin/bash
echo "=== MetaEdge Deploy Script ==="
echo ""
echo "Step 1: Installing dependencies..."
npm install
echo ""
echo "Step 2: Applying database changes..."
npx drizzle-kit push --force
echo ""
echo "Step 3: Building the app..."
npm run build
echo ""
echo "Step 4: Restarting the app..."
pm2 restart all
echo ""
echo "=== Deploy complete! ==="
echo "Run 'pm2 logs --lines 30' to check for errors"
