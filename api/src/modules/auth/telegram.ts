import crypto from "crypto";

/**
 * Проверка подписи данных от Telegram Login Widget.
 * @see https://core.telegram.org/widgets/login#checking-authorization
 */
export interface TelegramAuthPayload {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export function validateTelegramAuth(
  payload: TelegramAuthPayload,
  botToken: string
): boolean {
  const { hash, ...rest } = payload;
  const dataCheckString = Object.keys(rest)
    .sort()
    .map((key) => `${key}=${(rest as Record<string, unknown>)[key]}`)
    .join("\n");

  const secretKey = crypto.createHash("sha256").update(botToken).digest();
  const computedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  return computedHash === hash;
}

/** Проверка, что auth_date не старше 24 часов (защита от повторного использования). */
export function isTelegramAuthDateValid(authDate: number, maxAgeSeconds = 86400): boolean {
  return Math.floor(Date.now() / 1000) - authDate <= maxAgeSeconds;
}
