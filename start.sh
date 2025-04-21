#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting FIBA 3x3 Application...${NC}"

# Check if Node.js is installed
if ! [ -x "$(command -v node)" ]; then
  echo -e "${RED}Error: Node.js is not installed.${NC}" >&2
  exit 1
fi

# Check if npm is installed
if ! [ -x "$(command -v npm)" ]; then
  echo -e "${RED}Error: npm is not installed.${NC}" >&2
  exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installing dependencies...${NC}"
  npm install
fi

# Start the application
echo -e "${GREEN}Starting development server...${NC}"
npm start 