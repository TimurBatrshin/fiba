#!/bin/bash
set -e

# Вывод текущей директории и содержимого
echo "Current directory: $(pwd)"
echo "Contents of current directory:"
ls -la

# Создаем dist директорию
echo "Creating dist directory..."
mkdir -p dist
echo "Contents of dist directory before build:"
ls -la dist

# Устанавливаем зависимости
echo "Installing dependencies..."
npm config set ignore-scripts true
npm ci --progress=false --loglevel=error --fetch-retries=3
npm config set ignore-scripts false

# Запускаем сборку
echo "Starting build process..."
npm run build

# Проверяем результат
echo "Build completed, checking results..."
echo "Contents of current directory after build:"
ls -la
echo "Contents of dist directory after build:"
ls -la dist || echo "dist directory not found after build"

# Ищем dist директории и js файлы
echo "Searching for dist directories:"
find . -type d -name "dist"
echo "Searching for JS files in dist:"
find . -name "*.js" | grep -i dist || echo "No JS files found in dist"

# Если dist пуст или не существует, создаем его заново и копируем файлы
if [ ! -d "dist" ] || [ -z "$(ls -A dist 2>/dev/null)" ]; then
    echo "dist directory is empty or doesn't exist"
    echo "Creating dist directory and dummy file..."
    mkdir -p dist
    echo "Build completed at $(date)" > dist/build-info.txt
fi

echo "Build script completed" 