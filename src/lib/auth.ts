import "server-only";
import { cookies } from "next/headers";
import { z } from "zod";
import * as bcrypt from "bcrypt";
import { prisma } from "./prisma";
import { PrismaClient } from "@prisma/client";
import { AUTH_COOKIE } from "@/features/auth/constants";
import { loginSchema, registerSchema } from "@/features/auth/schemas";

// Тип User из Prisma
type User = {
  id: string;
  email: string;
  name: string;
  password: string;
}

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

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