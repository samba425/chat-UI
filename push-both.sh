#!/bin/bash

# Push to both repositories script
echo "🚀 Pushing to both repositories..."

echo "📤 Pushing to Cisco repo (origin)..."
git push origin master

echo "📤 Pushing to Personal GitHub (personal)..."
git push personal master

echo "✅ Successfully pushed to both repositories!"
