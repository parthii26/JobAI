#!/bin/bash

# Check if node is available in any standard location
if command -v node &> /dev/null; then
    echo "Node.js found: $(node --version)"
    npm run dev
elif [ -f "/opt/nodejs/bin/node" ]; then
    echo "Using Node.js from /opt/nodejs"
    export PATH="/opt/nodejs/bin:$PATH"
    npm run dev
elif [ -f "./node_modules/.bin/tsx" ]; then
    echo "Using tsx directly"
    export PATH="./node_modules/.bin:$PATH"
    # Try to find node in system
    for path in /usr/local/bin/node /usr/bin/node /bin/node; do
        if [ -f "$path" ]; then
            export NODE_PATH="$path"
            break
        fi
    done
    NODE_ENV=development tsx server/index.ts
else
    echo "Error: Node.js runtime not found"
    echo "Please ensure Node.js is properly installed"
    exit 1
fi