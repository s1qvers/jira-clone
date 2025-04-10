import { v2 as cloudinary } from 'cloudinary';

// Настройка Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dummy',
  api_key: process.env.CLOUDINARY_API_KEY || 'dummy',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'dummy',
  secure: true,
});

/**
 * Загружает изображение в Cloudinary
 * @param file Файл изображения для загрузки
 * @param folder Папка в Cloudinary для сохранения (опционально)
 * @returns URL загруженного изображения
 */
export async function uploadImage(file: File, folder = 'jira_clone'): Promise<string> {
  try {
    // В режиме разработки используем локальный путь для изображения
    if (process.env.NODE_ENV !== 'production') {
      // Генерируем уникальное имя для файла
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileName = `${randomId}-${Date.now()}.${file.name.split('.').pop()}`;
      
      console.log(`Использую локальный плейсхолдер вместо Cloudinary: ${fileName}`);
      
      // В тестовом режиме возвращаем плейсхолдер
      // В реальном проекте здесь можно было бы сохранить файл в папку public
      return `/placeholder-${randomId}.png`;
    }
    
    // Реальная загрузка в Cloudinary для продакшена
    // Преобразуем File в буфер для загрузки
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Создаем base64 строку для загрузки
    const base64Data = `data:${file.type};base64,${buffer.toString('base64')}`;
    
    // Загружаем изображение в Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload(
        base64Data,
        { folder, resource_type: 'image' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });
    
    // Возвращаем URL загруженного изображения
    return result.secure_url;
  } catch (error) {
    console.error('Ошибка при загрузке изображения:', error);
    
    // Возвращаем плейсхолдер в случае ошибки
    const randomId = Math.random().toString(36).substring(2, 15);
    return `/placeholder-${randomId}.png`;
  }
}

/**
 * Удаляет изображение из Cloudinary
 * @param publicId Публичный ID изображения
 * @returns Результат удаления
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    // В режиме разработки пропускаем удаление
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Псевдо-удаление изображения: ${publicId}`);
      return true;
    }
    
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
    
    return result.result === 'ok';
  } catch (error) {
    console.error('Ошибка при удалении изображения:', error);
    return false;
  }
}

/**
 * Извлекает publicId из URL Cloudinary
 * @param url URL изображения Cloudinary
 * @returns Public ID изображения
 */
export function getPublicIdFromUrl(url: string): string | null {
  try {
    // Для локальных URL возвращаем сам URL
    if (url.startsWith('/placeholder')) {
      return url;
    }
    
    // URL будет иметь формат: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.jpg
    const regex = /\/v\d+\/(.+)\.\w+$/;
    const match = url.match(regex);
    
    if (match && match[1]) {
      return match[1];
    }
    
    return null;
  } catch (error) {
    return null;
  }
} 