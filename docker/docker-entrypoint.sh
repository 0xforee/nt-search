#!/bin/sh
set -e

# Check if AUTO_UPDATE is enabled
if [ "$AUTO_UPDATE" = "true" ]; then
    echo "AUTO_UPDATE is enabled. Pulling latest code and rebuilding..."
    
    # Navigate to app directory
    cd /app
    
    # Pull latest code (if git is available and repo exists)
    if [ -d .git ]; then
        echo "Pulling latest code from git..."
        if git pull; then
            echo "Successfully pulled latest code"
        else
            echo "Warning: git pull failed, continuing with existing code"
        fi
    else
        echo "Warning: .git directory not found, skipping git pull"
    fi
    
    # Install dependencies
    echo "Installing dependencies..."
    npm ci
    
    # Build the application
    echo "Building application..."
    npm run build
    
    # Copy built assets to nginx directory
    echo "Copying built assets to nginx directory..."
    rm -rf /usr/share/nginx/html/*
    cp -r dist/* /usr/share/nginx/html/
    
    echo "Build completed successfully!"
else
    echo "AUTO_UPDATE is disabled. Using pre-built assets."
fi

# Start nginx
echo "Starting nginx..."
exec nginx -g "daemon off;"

