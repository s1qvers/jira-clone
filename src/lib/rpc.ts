import { hc } from "hono/client";
import { AppType } from "@/app/api/[[...route]]/route";

// Используем явно указанный URL или localhost:3001 в случае, если переменная окружения не определена
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
console.log("API базовый URL:", baseUrl);

// Создаем обертку для логирования запросов
const client = hc<AppType>(baseUrl);

// Добавляем интерцептор для логирования всех запросов
const originalFetch = globalThis.fetch;
globalThis.fetch = function(input, init) {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  console.log(`[API Request] ${init?.method || 'GET'} ${url}`);
  return originalFetch(input, init).then(response => {
    console.log(`[API Response] ${response.status} ${response.statusText} for ${url}`);
    return response;
  }).catch(error => {
    console.error(`[API Error] ${error.message} for ${url}`, error);
    throw error;
  });
};

export { client };