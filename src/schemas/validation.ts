
import { z } from 'zod';

// Схемы для Telegram данных
export const TelegramUserSchema = z.object({
  id: z.number().positive(),
  first_name: z.string().min(1).max(256),
  last_name: z.string().max(256).optional(),
  username: z.string().max(32).optional(),
  language_code: z.string().max(10).optional(),
  is_premium: z.boolean().optional(),
  photo_url: z.string().url().optional(),
});

export const TelegramInitDataSchema = z.object({
  user: TelegramUserSchema.optional(),
  auth_date: z.number(),
  hash: z.string().min(1),
  query_id: z.string().optional(),
  start_param: z.string().optional(),
});

// Схемы для платежей
export const PaymentDataSchema = z.object({
  user_id: z.string().min(1),
  plan_id: z.string().min(1),
  amount: z.number().positive(),
  currency: z.enum(['RUB', 'USD', 'EUR']),
  provider: z.enum(['youkassa', 'robocasa', 'telegram']),
  return_url: z.string().url().optional(),
});

export const PaymentResponseSchema = z.object({
  success: z.boolean(),
  payment_id: z.string().optional(),
  payment_url: z.string().url().optional(),
  message: z.string().optional(),
  error: z.string().optional(),
});

export const SubscriptionStatusSchema = z.object({
  is_active: z.boolean(),
  plan_id: z.string(),
  expires_at: z.string().datetime(),
  provider: z.enum(['youkassa', 'robocasa', 'telegram']),
  auto_renew: z.boolean(),
});

export const SubscriptionPlanSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  price: z.number().min(0),
  currency: z.enum(['RUB', 'USD', 'EUR']),
  duration: z.number().positive(),
  features: z.array(z.string()),
  popular: z.boolean().optional(),
});

// Схемы для пользовательских данных
export const UserRegistrationDataSchema = z.object({
  user_id: z.string().min(1),
  username: z.string().optional(),
  full_name: z.string().min(2).max(500),
  course_status: z.enum(['not_started', 'in_progress', 'paused', 'completed']),
  current_lesson: z.number().min(0),
  last_activity: z.string().datetime(),
  score: z.number().min(0),
  telegram_data: TelegramUserSchema,
});

// Схемы для API ответов
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
});

// Схемы для Telegram платежей
export const TelegramPaymentDataSchema = z.object({
  invoice_payload: z.string(),
  total_amount: z.number().positive(),
  currency: z.string(),
  telegram_payment_charge_id: z.string().optional(),
  provider_payment_charge_id: z.string().optional(),
});

// Валидационные функции
export const validateTelegramUser = (data: unknown) => {
  return TelegramUserSchema.safeParse(data);
};

export const validatePaymentData = (data: unknown) => {
  return PaymentDataSchema.safeParse(data);
};

export const validateSubscriptionStatus = (data: unknown) => {
  return SubscriptionStatusSchema.safeParse(data);
};

export const validateUserRegistration = (data: unknown) => {
  return UserRegistrationDataSchema.safeParse(data);
};

export const validateTelegramPayment = (data: unknown) => {
  return TelegramPaymentDataSchema.safeParse(data);
};

// Типы для TypeScript
export type TelegramUser = z.infer<typeof TelegramUserSchema>;
export type TelegramInitData = z.infer<typeof TelegramInitDataSchema>;
export type PaymentData = z.infer<typeof PaymentDataSchema>;
export type PaymentResponse = z.infer<typeof PaymentResponseSchema>;
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;
export type SubscriptionPlan = z.infer<typeof SubscriptionPlanSchema>;
export type UserRegistrationData = z.infer<typeof UserRegistrationDataSchema>;
export type ApiResponse = z.infer<typeof ApiResponseSchema>;
export type TelegramPaymentData = z.infer<typeof TelegramPaymentDataSchema>;
