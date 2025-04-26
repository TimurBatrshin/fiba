#!/usr/bin/env node

/**
 * Скрипт для проверки и обновления зависимостей проекта
 * Запуск: node scripts/check-dependencies.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Логирование с цветом
const log = {
  info: (msg) => console.log(`${colors.cyan}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.magenta}${msg}${colors.reset}\n`)
};

// Пакеты, которые могут вызвать проблемы совместимости при обновлении
const SENSITIVE_PACKAGES = [
  'react',
  'react-dom',
  '@types/react',
  '@types/react-dom',
  'typescript',
  '@reduxjs/toolkit',
  'react-redux'
];

// Получение текущей версии пакета
function getCurrentVersion(packageName) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8'));
    const { dependencies, devDependencies } = packageJson;
    
    if (dependencies && dependencies[packageName]) {
      return dependencies[packageName].replace('^', '');
    }
    
    if (devDependencies && devDependencies[packageName]) {
      return devDependencies[packageName].replace('^', '');
    }
    
    return null;
  } catch (error) {
    log.error(`Ошибка при чтении package.json: ${error.message}`);
    return null;
  }
}

// Получение последней версии пакета из npm
function getLatestVersion(packageName) {
  try {
    const output = execSync(`npm view ${packageName} version`).toString().trim();
    return output;
  } catch (error) {
    log.error(`Ошибка при получении последней версии ${packageName}: ${error.message}`);
    return null;
  }
}

// Проверка устаревших пакетов
function checkOutdatedPackages() {
  log.title('Проверка устаревших пакетов');
  try {
    execSync('npm outdated', { stdio: 'inherit' });
    log.success('Проверка завершена');
  } catch (error) {
    // npm outdated возвращает ненулевой код при наличии устаревших пакетов
    log.warning('Найдены устаревшие пакеты. Чтобы обновить их, запустите скрипт с флагом --update');
  }
}

// Обновление всех пакетов
function updateAllPackages() {
  log.title('Обновление всех пакетов');
  
  log.info('Получение списка устаревших пакетов...');
  const outdatedJson = execSync('npm outdated --json').toString();
  let outdated;
  
  try {
    outdated = JSON.parse(outdatedJson);
  } catch (error) {
    log.success('Нет устаревших пакетов');
    return;
  }
  
  const packagesToUpdate = [];
  const sensitivePackagesToUpdate = [];
  
  // Разделяем пакеты на обычные и чувствительные
  Object.keys(outdated).forEach(packageName => {
    const current = outdated[packageName].current;
    const latest = outdated[packageName].latest;
    
    if (SENSITIVE_PACKAGES.includes(packageName)) {
      sensitivePackagesToUpdate.push({ packageName, current, latest });
    } else {
      packagesToUpdate.push({ packageName, current, latest });
    }
  });
  
  // Обновляем обычные пакеты
  if (packagesToUpdate.length > 0) {
    log.info(`Обновление ${packagesToUpdate.length} пакетов...`);
    
    for (const { packageName, current, latest } of packagesToUpdate) {
      log.info(`Обновление ${packageName} с версии ${current} до ${latest}...`);
      try {
        execSync(`npm install ${packageName}@latest --save-exact`, { stdio: 'inherit' });
        log.success(`${packageName} обновлен до версии ${latest}`);
      } catch (error) {
        log.error(`Ошибка при обновлении ${packageName}: ${error.message}`);
      }
    }
  }
  
  // Показываем информацию о чувствительных пакетах
  if (sensitivePackagesToUpdate.length > 0) {
    log.warning(`\nНайдено ${sensitivePackagesToUpdate.length} чувствительных пакетов, которые требуют ручного обновления:`);
    
    for (const { packageName, current, latest } of sensitivePackagesToUpdate) {
      console.log(`- ${colors.yellow}${packageName}${colors.reset}: ${current} -> ${latest}`);
    }
    
    log.info('\nДля обновления этих пакетов запустите:');
    console.log('\nnpm install ' + sensitivePackagesToUpdate.map(p => `${p.packageName}@${p.latest}`).join(' ') + ' --save-exact\n');
    log.warning('Обратите внимание: обновление этих пакетов может потребовать дополнительных изменений в коде!');
  }
  
  log.success('Обновление пакетов завершено');
}

// Проверка уязвимостей
function checkVulnerabilities() {
  log.title('Проверка уязвимостей');
  try {
    execSync('npm audit', { stdio: 'inherit' });
    log.success('Проверка завершена');
  } catch (error) {
    log.warning('Найдены уязвимости. Запустите npm audit fix для их исправления');
  }
}

// Проверка типов
function checkTypes() {
  log.title('Проверка типов TypeScript');
  try {
    execSync('npx tsc --noEmit', { stdio: 'inherit' });
    log.success('Проверка типов TypeScript успешно завершена');
  } catch (error) {
    log.error('Найдены ошибки типов TypeScript');
  }
}

// Основная функция
function main() {
  const args = process.argv.slice(2);
  const shouldUpdate = args.includes('--update');
  
  log.title('Проверка зависимостей проекта');
  
  if (shouldUpdate) {
    updateAllPackages();
  } else {
    checkOutdatedPackages();
  }
  
  checkVulnerabilities();
  
  if (shouldUpdate) {
    checkTypes();
  }
  
  log.info('\nДля обновления пакетов запустите:');
  console.log('\nnode scripts/check-dependencies.js --update\n');
}

main(); 