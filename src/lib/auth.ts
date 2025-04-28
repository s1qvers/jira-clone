import "server-only";
import { cookies } from "next/headers";
import { z } from "zod";
import * as bcrypt from "bcrypt";
import { prisma } from "./prisma";
import { PrismaClient } from "@prisma/client";
import { AUTH_COOKIE } from "@/features/auth/constants";
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from "@/features/auth/schemas";
import { randomBytes } from "crypto";

// Тип User из Prisma
type User = {
  id: string;
  email: string;
  name: string;
  password: string;
}

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;
type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

// Функции аутентификации
export async function registerUser(data: RegisterData): Promise<User> {
  const { email, password, name } = data;

  // Проверка, что пользователь не существует
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("Пользователь с такой почтой уже существует");
  }

  // Хеширование пароля
  const hashedPassword = await bcrypt.hash(password, 10);

  // Создание пользователя
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
    },
  });

  return user;
}

export async function loginUser({ email, password }: LoginData): Promise<User> {
  // Поиск пользователя
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("Неверная почта или пароль");
  }

  // Проверка пароля
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Неверная почта или пароль");
  }

  return user;
}

export async function getCurrentUser() {
  const session = cookies().get(AUTH_COOKIE);
  
  if (!session || !session.value) {
    return null;
  }
  
  try {
    // Декодируем сессию из куки и получаем userId
    const sessionData = JSON.parse(Buffer.from(session.value, 'base64').toString());
    
    if (!sessionData.userId) {
      return null;
    }
    
    // Находим пользователя
    const user = await prisma.user.findUnique({
      where: { id: sessionData.userId },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
    
    return user;
  } catch (error) {
    return null;
  }
}

// Создание токена для сброса пароля
export async function createPasswordResetToken(data: ForgotPasswordData): Promise<{ user: User; resetToken: string }> {
  const { email } = data;

  // Поиск пользователя
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("Пользователь с таким email не найден");
  }

  // Генерация случайного токена
  const resetToken = randomBytes(32).toString('hex');
  const resetTokenExpires = new Date(Date.now() + 3600000); // 1 час

  try {
    // Используем update вместо $executeRaw
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpires
      }
    });
    
    return { user, resetToken };
  } catch (error) {
    console.error("Ошибка при обновлении пользователя:", error);
    throw new Error(`Ошибка при создании токена сброса: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Проверка токена и сброс пароля
export async function resetPassword(data: ResetPasswordData): Promise<User> {
  const { token, password } = data;

  try {
    // Поиск пользователя с указанным токеном
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      throw new Error("Недействительный или истекший токен сброса пароля");
    }

    // Хеширование нового пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Обновление пароля и удаление токена сброса
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null
      }
    });

    return updatedUser;
  } catch (error) {
    console.error("Ошибка при сбросе пароля:", error);
    throw new Error(`Ошибка при сбросе пароля: ${error instanceof Error ? error.message : String(error)}`);
  }
} 