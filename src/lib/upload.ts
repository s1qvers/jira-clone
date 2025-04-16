import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import path from 'path';
import { MAX_FILE_SIZE, ACCEPTED_IMAGE_TYPES } from '@/config';
import { promisify } from 'util';

// Создаем синхронные версии некоторых функций файловой системы
const fsExists = (path: string): boolean => {
  try {
    fs.accessSync(path, fs.constants.F_OK);
    return true;
  } catch (e) {
    return false;
  }
};

// Переводим в промисы для большей надежности асинхронных операций
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

// Настройка Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dummy',
  api_key: process.env.CLOUDINARY_API_KEY || 'dummy',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'dummy',
  secure: true,
});

/**
 * Загружает изображение локально
 * @param file Файл изображения для загрузки
 * @param folder Папка для сохранения (опционально)
 * @returns URL загруженного изображения
 */
export async function uploadImage(file: File, folder = 'jira_clone'): Promise<string> {
  try {
    // Проверяем размер файла
    if (file.size > MAX_FILE_SIZE) {
      console.warn(`Файл слишком большой: ${file.size} байт. Максимальный размер: ${MAX_FILE_SIZE} байт`);
      throw new Error(`Файл слишком большой. Максимальный размер: ${MAX_FILE_SIZE / (1024 * 1024)} MB`);
    }

    // Проверяем тип файла
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      console.warn(`Неподдерживаемый тип файла: ${file.type}. Разрешены только: ${ACCEPTED_IMAGE_TYPES.join(', ')}`);
      throw new Error('Неподдерживаемый тип файла. Разрешены только: JPEG, PNG, SVG');
    }

    // Генерируем уникальное имя для файла
    const randomId = Math.random().toString(36).substring(2, 15);
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_'); // Безопасное имя файла
    const extension = safeName.split('.').pop() || 'jpg';
    const fileName = `${randomId}-${timestamp}.${extension}`;
    
    // Определяем папки для хранения
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const uploadPath = path.join(uploadDir, fileName);
    
    console.log("Загрузка изображения:", {
      fileName,
      uploadDir,
      uploadPath,
      fileSize: file.size,
      fileType: file.type,
      exists: fsExists(uploadDir)
    });
    
    // Создаем директорию, если она не существует (используем синхронную версию)
    if (!fsExists(uploadDir)) {
      console.log("Директория uploads не существует, создаем...");
      try {
        // Создаем рекурсивно все необходимые директории
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log("Директория успешно создана:", uploadDir);
      } catch (dirError) {
        console.error("Ошибка при создании директории:", dirError);
        throw new Error(`Не удалось создать директорию: ${dirError.message}`);
      }
    }
    
    // Преобразуем File в буфер
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Сохраняем файл (используем синхронную версию для гарантии записи)
    try {
      // Сначала пишем во временный файл с расширением .tmp
      const tempPath = `${uploadPath}.tmp`;
      fs.writeFileSync(tempPath, buffer);
      
      // Проверяем, что временный файл был успешно создан
      if (!fsExists(tempPath)) {
        throw new Error("Не удалось создать временный файл");
      }
      
      // Переименовываем временный файл в целевой
      fs.renameSync(tempPath, uploadPath);
      
      console.log("Файл успешно сохранен:", uploadPath);
      
      // Дополнительная проверка, что файл действительно существует
      if (!fsExists(uploadPath)) {
        throw new Error("Файл был сохранен, но не обнаружен при проверке");
      }
    } catch (writeError) {
      console.error("Ошибка при записи файла:", writeError);
      throw new Error(`Не удалось сохранить файл: ${writeError.message}`);
    }
    
    // Возвращаем относительный путь к файлу
    const relativePath = `/uploads/${fileName}`;
    const publicPath = path.join(process.cwd(), 'public', relativePath);
    
    // Проверяем, что файл был успешно создан
    if (!fsExists(publicPath)) {
      console.error("Файл не был создан по пути:", publicPath);
      throw new Error("Файл не был создан");
    } else {
      console.log("Проверка файла успешна, файл доступен по пути:", publicPath);
    }
    
    // Финальная проверка доступности файла через HTTP
    const fileUrl = relativePath;
    console.log("URL загруженного файла:", fileUrl);
    
    return fileUrl;
  } catch (error) {
    console.error('Ошибка при загрузке изображения:', error);
    // Возвращаем плейсхолдер в случае ошибки
    return '/placeholder.png';
  }
}

/**
 * Удаляет изображение
 * @param imagePath Путь к изображению
 * @returns Результат удаления
 */
export async function deleteImage(imagePath: string): Promise<boolean> {
  try {
    // Если это плейсхолдер, пропускаем удаление
    if (imagePath.startsWith('/placeholder')) {
      return true;
    }
    
    // Получаем полный путь к файлу
    const fullPath = path.join(process.cwd(), 'public', imagePath);
    
    // Проверяем существование файла
    if (fsExists(fullPath)) {
      try {
        // Используем синхронный метод для гарантированного удаления
        fs.unlinkSync(fullPath);
        console.log(`Файл успешно удален: ${fullPath}`);
      } catch (unlinkError) {
        console.error(`Ошибка при удалении файла ${fullPath}:`, unlinkError);
      }
    } else {
      console.warn(`Файл для удаления не найден: ${fullPath}`);
    }
    
    return true;
  } catch (error) {
    console.error('Ошибка при удалении изображения:', error);
    return false;
  }
}

/**
 * Извлекает имя файла из URL
 * @param url URL изображения
 * @returns Имя файла
 */
export function getPublicIdFromUrl(url: string): string | null {
  try {
    // Для плейсхолдеров возвращаем сам URL
    if (!url || url.startsWith('/placeholder')) {
      return url;
    }
    
    // Извлекаем имя файла из URL
    const fileName = url.split('/').pop();
    return fileName || null;
  } catch (error) {
    return null;
  }
} 