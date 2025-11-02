#!/bin/sh
set -e

# Check if AUTO_UPDATE is enabled
if [ "$AUTO_UPDATE" = "true" ]; then
    echo "AUTO_UPDATE is enabled. Pulling latest code and rebuilding..."
    
    # Navigate to app directory
    cd /app
    
    # Determine git branch (default to main if not specified)
    GIT_BRANCH=${GIT_BRANCH:-main}
    
    # Pull or clone latest code
    if [ -n "$GIT_REPO_URL" ]; then
        # If GIT_REPO_URL is set, clone from the repository
        echo "Cloning code from git repository: $GIT_REPO_URL (branch: $GIT_BRANCH)"
        if [ -d .git ]; then
            # If .git exists, try to update remote and pull
            echo "Git repository exists, updating..."
            git remote set-url origin "$GIT_REPO_URL" 2>/dev/null || git remote add origin "$GIT_REPO_URL"
            git fetch origin
            git checkout "$GIT_BRANCH" 2>/dev/null || git checkout -b "$GIT_BRANCH"
            if git pull origin "$GIT_BRANCH"; then
                echo "Successfully pulled latest code from $GIT_BRANCH"
                # Print current commit info
                COMMIT_SHORT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
                COMMIT_MESSAGE=$(git log -1 --pretty=format:"%s" 2>/dev/null || echo "unknown")
                echo "Updated to commit: $COMMIT_SHORT - $COMMIT_MESSAGE"
            else
                echo "Warning: git pull failed, trying to clone fresh..."
                cd /
                # Clone to temporary directory
                if git clone -b "$GIT_BRANCH" "$GIT_REPO_URL" /tmp/app_clone 2>/dev/null; then
                    echo "Successfully cloned fresh repository"
                    # Print commit info from cloned repo
                    COMMIT_SHORT=$(cd /tmp/app_clone && git rev-parse --short HEAD 2>/dev/null || echo "unknown")
                    COMMIT_MESSAGE=$(cd /tmp/app_clone && git log -1 --pretty=format:"%s" 2>/dev/null || echo "unknown")
                    echo "Cloned commit: $COMMIT_SHORT - $COMMIT_MESSAGE"
                    # Remove old source code files
                    rm -rf /app/.git /app/src /app/public /app/index.html /app/vite.config.ts /app/tsconfig*.json /app/tailwind.config.js /app/postcss.config.js /app/eslint.config.js /app/README.md 2>/dev/null || true
                    
                    # Copy source files from cloned repo (preserve node_modules and dist)
                    cp -r /tmp/app_clone/.git /app/ 2>/dev/null || true
                    cp -r /tmp/app_clone/src /app/ 2>/dev/null || true
                    cp -r /tmp/app_clone/public /app/ 2>/dev/null || true
                    cp -r /tmp/app_clone/index.html /app/ 2>/dev/null || true
                    cp -r /tmp/app_clone/vite.config.ts /app/ 2>/dev/null || true
                    cp -r /tmp/app_clone/tsconfig*.json /app/ 2>/dev/null || true
                    cp -r /tmp/app_clone/tailwind.config.js /app/ 2>/dev/null || true
                    cp -r /tmp/app_clone/postcss.config.js /app/ 2>/dev/null || true
                    cp -r /tmp/app_clone/eslint.config.js /app/ 2>/dev/null || true
                    cp -r /tmp/app_clone/package*.json /app/ 2>/dev/null || true
                    
                    # Clean up temporary clone
                    rm -rf /tmp/app_clone
                else
                    echo "Error: Failed to clone repository, using existing code"
                fi
                cd /app
            fi
        else
            # Clone fresh if .git doesn't exist
            echo "Cloning fresh repository to temporary location..."
            cd /
            
            # Clone to temporary directory
            if git clone -b "$GIT_BRANCH" "$GIT_REPO_URL" /tmp/app_clone 2>/dev/null; then
                echo "Successfully cloned repository"
                # Print commit info from cloned repo
                COMMIT_SHORT=$(cd /tmp/app_clone && git rev-parse --short HEAD 2>/dev/null || echo "unknown")
                COMMIT_MESSAGE=$(cd /tmp/app_clone && git log -1 --pretty=format:"%s" 2>/dev/null || echo "unknown")
                echo "Cloned commit: $COMMIT_SHORT - $COMMIT_MESSAGE"
                # Remove old source code files
                rm -rf /app/.git /app/src /app/public /app/index.html /app/vite.config.ts /app/tsconfig*.json /app/tailwind.config.js /app/postcss.config.js /app/eslint.config.js /app/README.md 2>/dev/null || true
                
                # Copy source files from cloned repo (preserve node_modules and dist)
                cp -r /tmp/app_clone/.git /app/ 2>/dev/null || true
                cp -r /tmp/app_clone/src /app/ 2>/dev/null || true
                cp -r /tmp/app_clone/public /app/ 2>/dev/null || true
                cp -r /tmp/app_clone/index.html /app/ 2>/dev/null || true
                cp -r /tmp/app_clone/vite.config.ts /app/ 2>/dev/null || true
                cp -r /tmp/app_clone/tsconfig*.json /app/ 2>/dev/null || true
                cp -r /tmp/app_clone/tailwind.config.js /app/ 2>/dev/null || true
                cp -r /tmp/app_clone/postcss.config.js /app/ 2>/dev/null || true
                cp -r /tmp/app_clone/eslint.config.js /app/ 2>/dev/null || true
                cp -r /tmp/app_clone/package*.json /app/ 2>/dev/null || true
                
                # Clean up temporary clone
                rm -rf /tmp/app_clone
            else
                echo "Error: Failed to clone repository, using existing code"
            fi
        fi
        cd /app
    elif [ -d .git ]; then
        # If .git exists but no GIT_REPO_URL, try git pull
        echo "Pulling latest code from existing git repository..."
        if git pull; then
            echo "Successfully pulled latest code"
            # Print current commit info
            COMMIT_SHORT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
            COMMIT_MESSAGE=$(git log -1 --pretty=format:"%s" 2>/dev/null || echo "unknown")
            echo "Updated to commit: $COMMIT_SHORT - $COMMIT_MESSAGE"
        else
            echo "Warning: git pull failed, continuing with existing code"
        fi
    else
        echo "Warning: .git directory not found and GIT_REPO_URL not set, using existing code"
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
    
    # Print commit information after build
    cd /app
    if [ -d .git ]; then
        echo "=========================================="
        echo "Current Git Commit Information:"
        echo "=========================================="
        COMMIT_HASH=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
        COMMIT_SHORT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
        COMMIT_MESSAGE=$(git log -1 --pretty=format:"%s" 2>/dev/null || echo "unknown")
        COMMIT_AUTHOR=$(git log -1 --pretty=format:"%an" 2>/dev/null || echo "unknown")
        COMMIT_DATE=$(git log -1 --pretty=format:"%ci" 2>/dev/null || echo "unknown")
        BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
        
        echo "Branch: $BRANCH_NAME"
        echo "Commit: $COMMIT_SHORT ($COMMIT_HASH)"
        echo "Author: $COMMIT_AUTHOR"
        echo "Date: $COMMIT_DATE"
        echo "Message: $COMMIT_MESSAGE"
        echo "=========================================="
    fi
else
    echo "AUTO_UPDATE is disabled. Using pre-built assets."
fi

# Start nginx
echo "Starting nginx..."
exec nginx -g "daemon off;"

