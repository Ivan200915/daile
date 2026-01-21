#!/bin/bash

# Navigate to server directory
cd /var/www/daily-discipline/server

# Install dependencies if not installed
if [ ! -d "node_modules" ]; then
    npm install
fi

# Install pm2 if not installed
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# Start server
pm2 start index.js --name "daily-discipline-api"

# Save pm2 list so it restarts on reboot
pm2 save
pm2 startup
