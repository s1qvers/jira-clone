"use server";

import { Resend } from 'resend';

// Инициализация Resend с API ключом
const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_BvoDw8iv_4yCPTEqFWvnbvRcmsdZQcwN3';
console.log('Используемый API ключ Resend (первые 10 символов):', RESEND_API_KEY.substring(0, 10) + '...');

const resend = new Resend(RESEND_API_KEY);

/**
 * Отправляет электронное письмо для восстановления пароля
 * 
 * @param email Email адрес получателя
 * @param resetToken Токен для сброса пароля
 * @param resetUrl URL для сброса пароля с токеном
 * @returns Результат отправки письма
 */
export async function sendPasswordResetEmail(email: string, resetToken: string, resetUrl: string) {
  console.log('Начата отправка письма для восстановления пароля на:', email);
  console.log('URL сброса пароля:', resetUrl);
  
  // Формируем HTML шаблон письма
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #0052cc; margin-bottom: 20px;">Восстановление пароля</h2>
      <p>Вы запросили восстановление пароля в Jira Clone. Для сброса пароля нажмите на кнопку ниже:</p>
      <div style="margin: 25px 0;">
        <a href="${resetUrl}" style="background-color: #0052cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 3px; display: inline-block;">Сбросить пароль</a>
      </div>
      <p>Если кнопка не работает, скопируйте и вставьте следующую ссылку в адресную строку браузера:</p>
      <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 3px;">${resetUrl}</p>
      <p>Ваш токен для сброса пароля: <strong>${resetToken}</strong></p>
      <p>Ссылка и токен действительны в течение 1 часа.</p>
      <p>Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо.</p>
      <p style="margin-top: 30px; font-size: 12px; color: #6b778c;">С уважением,<br>Команда Jira Clone</p>
    </div>
  `;
  
  // Формируем текстовую версию письма
  const textContent = `
Восстановление пароля - Jira Clone

Вы запросили восстановление пароля в Jira Clone. 
Для сброса пароля перейдите по ссылке: ${resetUrl}

Ваш токен для сброса пароля: ${resetToken}

Ссылка и токен действительны в течение 1 часа.

Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо.

С уважением,
Команда Jira Clone
  `;
  
  try {
    console.log('Отправка письма через Resend API...');
    
    // Используем проверенный емейл для отправки, т.к. в Resend нужна верификация домена
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev', // Верифицированный домен Resend по умолчанию
      to: email,
      subject: 'Восстановление пароля - Jira Clone',
      html: htmlContent,
      text: textContent,
      headers: {
        'X-Entity-Ref-ID': resetToken.substring(0, 10), // Добавляем уникальный ID для отслеживания
      }
    });

    console.log('Письмо для восстановления пароля успешно отправлено. Ответ:', result);
    console.log('Проверьте папку "Входящие" или "Спам" в вашей почте.');
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Ошибка при отправке письма для восстановления пароля:', error);
    
    // Более подробное логирование ошибки
    if (error instanceof Error) {
      console.error('Сообщение ошибки:', error.message);
      console.error('Стек вызова:', error.stack);
    }
    
    return { success: false, error };
  }
} 