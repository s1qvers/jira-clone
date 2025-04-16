import * as fs from 'fs';
import * as path from 'path';

// Создаем директорию uploads, если она не существует
function ensureUploadsDirectory() {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  
  if (!fs.existsSync(uploadDir)) {
    console.log('Создание директории uploads...');
    fs.mkdirSync(uploadDir, { recursive: true });
  } else {
    console.log('Директория uploads уже существует');
  }
  
  return uploadDir;
}

// Создаем плейсхолдер изображения, если он не существует
function ensurePlaceholderImage() {
  const placeholderPath = path.join(process.cwd(), 'public', 'placeholder.png');
  
  if (!fs.existsSync(placeholderPath)) {
    console.log('Плейсхолдер изображения не найден, создаем...');
    
    // Создаем базовый плейсхолдер (1x1 пиксель PNG)
    const base64Placeholder = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
    const imageBuffer = Buffer.from(base64Placeholder, 'base64');
    
    fs.writeFileSync(placeholderPath, imageBuffer);
    console.log('Плейсхолдер изображения создан:', placeholderPath);
  } else {
    console.log('Плейсхолдер изображения уже существует');
  }
}

// Создаем набор тестовых изображений для проектов
function createTestProjectImages() {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  console.log('Создание тестовых изображений для проектов...');
  
  // Базовые цвета в формате base64 для PNG изображений 64x64
  const colorImages = {
    'project-blue.png': 'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAA+UlEQVR4nO3asQqCUBjG8e9FkWcIDYLmZpvfUYSGpraeoZcRHBriagrqAfR9Be8gcZOTfycz0Dw0nPO7XA73jKSzzvv+B1gAGRflAjKgdh1QAikQ2w4ogdZKvjvqZ+wr4JRmXfatbwGR64AqUAAySrJeT5I1b+pnHAFrYOEyYNz+9mKWZFtz2/CZ+PBXyXcx4L8B/gEAPOkKSKJj1tR6Oc+AFBiAKzAAvSXAHai5/xZUwCYEQGMpHwEEDgO+SvLRHdjbzn8rYAlsHQakwA5YOQzYAwdgHgJADNTcJk0QgBBGgH+Af4B/gH+Af4B/gH+Af8BPAZL2ukYXfZ0rhDlrOaGPf1sBUAAAAABJRU5ErkJggg==',
    'project-red.png': 'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAA+UlEQVR4nO3asQqCUBjG8fcZxEODQ0OTUzQ2NYjk0uJWb9BL1OTQ1NJUmw+gvkJ0B8lh9PxdzADPouGc3+V+4ZyRdIF1PPcLBsAEiJkoM8gMSo8BCxgBseuABbAGMtsBe+DoOP8ZcMt0g/UBsBnguk/QJigFBiBjkfQ6klTwpr7HBVgCU5cB/fbfXiwsZFuz2vCZ+PBXyXcx4L8B/gEEfAFFVMqSQk/nCTAGPsAZ+ACZJcAOSKnvgQTYdAGQWsqPAAcOA75Kct4D2NvOfwuYATuHAWNgD8wdBhyAI9DvAiAEEm6TpguALtwC/AP8A/wD/AP8A/wD/AP8A/wD/qLzVX4BRV4rhDnKeTIAAAAASUVORK5CYII=',
    'project-green.png': 'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAA+UlEQVR4nO3aSwqCUBTG8e9FRMcGx4ZmTl1NEESjVu3QRQSNGjdrGt2A7kK0gsRh9PxdzQDPUDjn+7gcuGck3WBd9/MFC2AORE6UOeQOFR4DFsDIdfwC2ACp64YdcPacDwxIY90g+wBYXfduJkBhkBukApLukXQhA31d5/ELsAbmLgOG7W8vFlWyld9t+Ex8+KvkuxiQb0B+AQR8gVl0ybLMROcJMAY+wA34ALnrhj2QUZ8DW2DdBUDmUj4CHAZ8leS9Pzj4zv9bwALYOwwYA4cqhkOHAUfgBPT+ARACGfVK0wVAF26B/AL+ALZzXPcDnv/+qcY/4BtdWBpTklVNAAAAAABJRU5ErkJggg==',
    'project-purple.png': 'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAA+UlEQVR4nO3asQqCUBSH8e9FpEODQ0NTUzQ3NTTVotvo1hv0EkVELQ01NVTT1AP4LmIdJIfR87+TgeehcM73cjlwz0g6w3nu6wkzYALEXjQxJE5UuAwogJGvgALYAKnvhh1w9J4fGRBHuk72EfCK695sgMqhdEgNJL0j6UoZf9T1eAEswdRnwLD97cWiSrb12w2fiQ9/lXwXA/IN+AIIeAOT6JalqYnPE2AM1MAZqIHCd8MeOFDfAxtg1QVA6lM+Ajw4DPgq6XN/sPed/7eAObB3GDAGDtUzdxhwBE5ArwuAEDhQrzRdAHThFsgv4A9gO8d3PxD47596/AO+AS6BQBMF5D2IAAAAAElFTkSuQmCC',
    'project-orange.png': 'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAA+UlEQVR4nO3asQqCUBTG8e9FUGcHx4aWpqZobGn0adFtdusNeomi0aWppSGbHsDnEL2D5DB6/m5mgGcqnPN9XC7cM5LOMa77/oI5MAVCEeUOuUOFxYA5MLYdsAA2QGK7YQec7Of7BkShbpB9AFzd9W4mQGGQG6QCon6QZCUDfV3msQBWwMxmwLD97cWsTLbyuw2fiQ9/lXwXA/IN+AIIeAPT4JJliYrOE2AEfIAr8AEy2w174EA9B7bAuguAxKZ8CDgc8FXS537g6Dr/bwFzYO8wYAQcqjFzGHAETkCvC4AAyKhXmi4AunAL5BfwB7Ct47of8Pz3Tz3+Ad9k8/NX13IFfQAAAABJRU5ErkJggg==',
  };
  
  // Создаем набор изображений
  for (const [filename, base64Data] of Object.entries(colorImages)) {
    const filePath = path.join(uploadsDir, filename);
    
    if (!fs.existsSync(filePath)) {
      const imageBuffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(filePath, imageBuffer);
      console.log(`Создано тестовое изображение: ${filename}`);
    } else {
      console.log(`Тестовое изображение ${filename} уже существует`);
    }
  }
}

// Копируем изображения из assets в uploads, если они существуют
function copyAssetsToUploads() {
  const assetsDir = path.join(process.cwd(), 'public', 'assets');
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  
  if (fs.existsSync(assetsDir)) {
    console.log('Копирование изображений из assets в uploads...');
    
    const imageFiles = fs.readdirSync(assetsDir).filter(file => 
      file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png') || file.endsWith('.svg')
    );
    
    if (imageFiles.length === 0) {
      console.log('В директории assets не найдено изображений');
      return;
    }
    
    for (const file of imageFiles) {
      const sourcePath = path.join(assetsDir, file);
      const destinationPath = path.join(uploadsDir, file);
      
      if (!fs.existsSync(destinationPath)) {
        fs.copyFileSync(sourcePath, destinationPath);
        console.log(`Скопировано: ${file}`);
      } else {
        console.log(`Файл ${file} уже существует в uploads, пропуск`);
      }
    }
  } else {
    console.log('Директория assets не найдена, пропуск копирования');
  }
}

// Проверяем права доступа к директории uploads
function checkPermissions(dir: string) {
  try {
    // Создаем временный файл для проверки прав на запись
    const testFile = path.join(dir, 'test-permissions.txt');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    console.log('Проверка прав доступа: OK (есть права на запись)');
  } catch (error) {
    console.error('Ошибка проверки прав доступа:', error);
    console.error('ВНИМАНИЕ: у приложения может не быть прав на запись в директорию uploads');
  }
}

function main() {
  console.log('Настройка директории uploads и проверка системы хранения изображений...');
  
  // Проверяем и создаем директорию uploads
  const uploadsDir = ensureUploadsDirectory();
  
  // Проверяем и создаем плейсхолдер изображения
  ensurePlaceholderImage();
  
  // Создаем тестовые изображения для проектов
  createTestProjectImages();
  
  // Копируем изображения из assets, если они существуют
  copyAssetsToUploads();
  
  // Проверяем права доступа
  checkPermissions(uploadsDir);
  
  console.log('Настройка системы хранения изображений завершена');
}

main(); 