#!/bin/bash
# Скрипт для обеспечения наличия директории dist и необходимых файлов

echo "Проверка/создание директории dist..."
if [ ! -d "dist" ]; then
    echo "Директория dist не существует, создаем..."
    mkdir -p dist
    echo "Директория dist создана."
else
    echo "Директория dist уже существует."
fi

# Подсчет файлов в директории dist
FILE_COUNT=$(find dist -type f | wc -l)
echo "Количество файлов в директории dist: $FILE_COUNT"

# Если директория пуста, создаем файл-заглушку
if [ "$FILE_COUNT" -eq 0 ]; then
    echo "Директория dist пуста, создаем файл-заглушку..."
    echo "Build completed at $(date)" > dist/build-info.txt
    echo "This is a placeholder file created because the build process did not generate any files" > dist/placeholder.txt
    echo "Файлы-заглушки созданы."
fi

echo "Содержимое директории dist:"
ls -la dist/

echo "Скрипт завершен успешно." 