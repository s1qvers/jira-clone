import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { MAX_FILE_SIZE, ACCEPTED_IMAGE_TYPES } from '@/config';

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
      throw new Error('Файл слишком большой. Максимальный размер: 1 MB');
    }

    // Проверяем тип файла
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      throw new Error('Неподдерживаемый тип файла. Разрешены только: JPEG, PNG, SVG');
    }

    // Генерируем уникальное имя для файла
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileName = `${randomId}-${Date.now()}.${file.name.split('.').pop()}`;
    const uploadPath = path.join(process.cwd(), 'public', 'uploads', fileName);
    
    // Преобразуем File в буфер
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Сохраняем файл
    await fs.promises.writeFile(uploadPath, buffer);
    
    // Возвращаем относительный путь к файлу
    return `/uploads/${fileName}`;
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
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
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
    if (url.startsWith('/placeholder')) {
      return url;
    }
    
    // Извлекаем имя файла из URL
    const fileName = url.split('/').pop();
    return fileName || null;
  } catch (error) {
    return null;
  }
} 