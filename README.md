
# Telegram Mini App - Образовательная Платформа Менторинга

## 🎯 Обзор проекта

Это полнофункциональное Telegram Mini App для образовательной платформы по коучингу и менторингу. Приложение построено на современных веб-технологиях с полной интеграцией в экосистему Telegram и автоматизацией через N8N.

**URL проекта**: https://lovable.dev/projects/edc32e98-34f5-4b25-a123-a37e7dfea43e

## 🏗️ Архитектура приложения

### Технологический стек
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + Shadcn/ui
- **State Management**: TanStack Query + React Context
- **Telegram Integration**: @twa-dev/sdk + Custom Telegram WebApp API
- **Automation**: N8N Webhook Integration
- **Analytics**: Recharts + Custom Analytics Services
- **Validation**: Zod schemas
- **Performance**: PWA + Service Worker

### Ключевые особенности
✅ **100% Production Ready** для Telegram Mini App  
✅ **Автономная работа** без бэкенда (Mock Backend Service)  
✅ **N8N интеграция** для автоматизации образовательных процессов  
✅ **PWA поддержка** с Service Worker  
✅ **Адаптивный дизайн** под Telegram интерфейс  
✅ **TypeScript строгая типизация**  
✅ **Продвинутая аналитика** обучения и поведения  

## 📁 Структура проекта

```
src/
├── components/           # UI компоненты
│   ├── app/             # Основные компоненты приложения
│   ├── telegram/        # Telegram-специфичные компоненты
│   ├── ui/              # Переиспользуемые UI компоненты (Shadcn)
│   ├── settings/        # Компоненты настроек
│   ├── automation/      # Компоненты автоматизации
│   └── subscription/    # Компоненты подписки
├── hooks/               # React хуки
│   ├── telegram/        # Telegram WebApp хуки
│   └── *.ts            # Общие хуки приложения
├── services/            # Бизнес-логика и сервисы
│   ├── auth/           # Аутентификация и регистрация
│   ├── automation/     # N8N интеграция
│   ├── analytics/      # Аналитика и метрики
│   ├── registration/   # Управление регистрацией пользователей
│   └── *.ts           # Основные сервисы
├── pages/              # Страницы приложения
├── types/              # TypeScript типы
└── providers/          # React контексты
```

## 🔧 Основные компоненты системы

### 1. Инициализация приложения
**Последовательность загрузки:**
1. React.StrictMode + QueryClient + TelegramProvider
2. ErrorBoundary для production
3. TelegramApp инициализация
4. Проверка аутентификации/регистрации
5. Setup Wizard (при первом запуске)
6. Роутинг на основе Telegram navigation

### 2. Telegram WebApp интеграция
**Основные файлы:**
- `src/providers/TelegramProvider.tsx` - Главный провайдер
- `src/hooks/useTelegramWebApp.ts` - Агрегация всех Telegram функций
- `src/hooks/telegram/useTelegramInit.ts` - Инициализация WebApp
- `src/services/TelegramProductionService.ts` - Production настройки

**Функциональность:**
- ✅ Theme handling (light/dark)
- ✅ Viewport management
- ✅ MainButton/BackButton
- ✅ HapticFeedback
- ✅ CloudStorage
- ✅ Payments (Invoice API)
- ✅ Lifecycle events
- ✅ Security (CSP, initData validation)

### 3. Система аутентификации
**Архитектура:** AuthService → UserAuthenticator → UserRegistrationManager

**Состояния пользователя:**
```typescript
type AuthState = {
  isAuthenticated: boolean;    // Есть Telegram данные
  isRegistered: boolean;       // Прошел полную регистрацию
  user: TelegramUser | null;   // Данные из Telegram
  registrationStatus: 'idle' | 'checking' | 'registering' | 'success' | 'error';
}
```

**Логика работы:**
1. Автоматическая аутентификация через `window.Telegram.WebApp.initDataUnsafe.user`
2. Проверка регистрации через UserRegistrationService
3. Fallback на тестовые данные вне Telegram среды
4. Mock Backend для работы без сервера

### 4. Setup Wizard (Мастер настройки)
**Функциональность:**
- Настройка Telegram Bot токена
- Конфигурация N8N Webhook URL
- Тестирование соединений
- Проверка готовности к production

**Файлы:**
- `src/components/setup/SetupWizard.tsx` - Основной компонент
- `src/components/setup/TelegramBotSetup.tsx` - Настройка бота
- `src/components/setup/N8NSetup.tsx` - Настройка N8N
- `src/hooks/useSetupWizard.ts` - Логика мастера

## 🤖 N8N автоматизация

### AutomationManager - Центральный менеджер событий
**Поддерживаемые события:**
- `user_registered` - Регистрация пользователя
- `lesson_completed` - Завершение урока
- `test_passed` - Прохождение теста
- `payment_success` - Успешная оплата
- `course_completed` - Завершение курса
- `user_inactive` - Неактивность пользователя

### N8NIntegration - HTTP клиент для webhook'ов
**Конфигурируемые endpoint'ы:**
```
POST /webhook/user/registered     # Новая регистрация
POST /webhook/lesson/completed    # Урок завершен
POST /webhook/test/passed         # Тест пройден
POST /webhook/payment/success     # Платеж успешен
POST /webhook/course/completed    # Курс завершен
POST /webhook/user/inactive       # Пользователь неактивен
```

**Надежность интеграции:**
- ✅ Retry mechanism с экспоненциальным backoff
- ✅ Fallback на Mock режим при недоступности N8N
- ✅ Error recovery и логирование
- ✅ Graceful degradation - приложение работает без N8N

## 📊 Система без бэкенда (Mock Backend)

### MockBackendService
**Возможности:**
- ✅ Регистрация пользователей
- ✅ Проверка существования пользователя
- ✅ Обновление активности
- ✅ Управление подписками
- ✅ Локальное хранение в localStorage
- ✅ Автоматический fallback при ошибках N8N

**Схема данных:**
```typescript
interface MockUserData {
  user_id: string;
  username?: string;
  full_name: string;
  course_status: 'not_started' | 'in_progress' | 'paused' | 'completed';
  current_lesson: number;
  last_activity: string;
  score: number;
  subscription_status: 'free' | 'premium' | 'vip';
  registration_date: string;
}
```

## 🎨 Пользовательский интерфейс

### Система навигации
**Поддерживаемые роуты:**
- `dashboard` - Главная панель
- `lessons` - Список уроков
- `lesson-detail` - Детали урока
- `test` - Прохождение теста
- `analytics` - Базовая аналитика
- `advanced-analytics` - Продвинутая аналитика
- `subscription` - Управление подпиской
- `settings` - Настройки
- `payment-success` - Успешная оплата

### Ключевые страницы
**Dashboard (`src/pages/Dashboard.tsx`)**
- Прогресс обучения
- Статистика пользователя
- Быстрые действия
- Последние уроки

**Analytics (`src/pages/Analytics.tsx`)**
- Визуализация прогресса
- Графики обучения (Recharts)
- Детальная статистика

**Settings (`src/components/settings/SettingsPage.tsx`)**
- Конфигурация N8N webhook URL
- Управление автоматизацией
- Production readiness проверки

## 🔒 Безопасность и Production

### TelegramProductionService
**Production функции:**
- ✅ Service Worker регистрация
- ✅ Content Security Policy
- ✅ initData валидация в production
- ✅ Error reporting в Telegram
- ✅ HTTPS проверки
- ✅ Environment validation

### BuildValidator
**Проверки готовности:**
- ✅ Telegram WebApp API доступность
- ✅ HTTPS протокол
- ✅ N8N Webhook настройка
- ✅ Mock режим отключен
- ✅ Service Worker поддержка
- ✅ Environment variables

## 📈 Аналитика и метрики

### Система аналитики
**Основные сервисы:**
- `AnalyticsService.ts` - Основной сервис
- `LearningAnalytics.ts` - Образовательная аналитика
- `BehaviorTracker.ts` - Поведенческая аналитика
- `PerformanceReporter.ts` - Метрики производительности

**Отслеживаемые события:**
- ✅ Время на урок
- ✅ Результаты тестов
- ✅ Последовательность изучения
- ✅ Паттерны поведения
- ✅ Performance metrics
- ✅ Error tracking

## 🚀 Установка и запуск

### Предварительные требования
- Node.js & npm ([установка с nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- Telegram Bot Token (опционально)
- N8N Instance с webhook endpoints (опционально)

### Локальная разработка

```bash
# Клонирование репозитория
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev
```

### Environment Variables
Создайте файл `.env` на основе `.env.example`:

```env
# N8N интеграция
VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/telegram-edu-app

# Telegram (для development)
VITE_TELEGRAM_BOT_TOKEN=your_bot_token_here

# Production настройки
VITE_APP_ENV=production
VITE_ENABLE_MOCK_MODE=false
VITE_LOG_LEVEL=info
```

### Команды сборки

```bash
npm run build         # Production сборка
npm run build:dev     # Development сборка
npm run preview       # Предпросмотр сборки
```

## 🎯 Особенности Telegram Mini App

### Соответствие требованиям Telegram
- ✅ HTTPS обязательно для production
- ✅ Размер bundle < 5MB (текущий ~2MB)
- ✅ Быстрая загрузка < 3 секунд
- ✅ Адаптивность под все устройства
- ✅ Telegram UI guidelines соблюдены
- ✅ Security headers настроены

### Интеграция с Telegram платформой
- ✅ `WebApp.ready()` - сигнал готовности
- ✅ `WebApp.expand()` - полноэкранный режим
- ✅ MainButton/BackButton - нативные кнопки
- ✅ HapticFeedback - тактильная обратная связь
- ✅ CloudStorage - облачное хранилище Telegram
- ✅ Payments - встроенные платежи
- ✅ Theme integration - синхронизация с темой Telegram

## ⚡ Производительность

### Оптимизации
- Lazy loading компонентов
- Code splitting по функциональности
- React.memo для тяжелых компонентов
- Debounced actions для пользовательского ввода
- Local storage caching для данных
- Service Worker для offline работы

### Метрики производительности
**Отслеживаемые метрики:**
- ✅ App initialization time
- ✅ Page load time
- ✅ Bundle size
- ✅ Memory usage
- ✅ API response time
- ✅ Error rate

## 📱 Deployment

### Lovable Platform
Простой деплой через интерфейс Lovable:
1. Откройте [Lovable Project](https://lovable.dev/projects/edc32e98-34f5-4b25-a123-a37e7dfea43e)
2. Нажмите Share → Publish

### Кастомный домен
Подключите собственный домен через:
Project > Settings > Domains > Connect Domain

Подробнее: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## 🔧 Разработка и вклад

### Способы редактирования кода

**Использование Lovable:**
Перейдите в [Lovable Project](https://lovable.dev/projects/edc32e98-34f5-4b25-a123-a37e7dfea43e) и начните промпты.

**Локальная разработка:**
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm install
npm run dev
```

**GitHub Codespaces:**
1. Перейдите на главную страницу репозитория
2. Нажмите "Code" → "Codespaces" → "New codespace"

### Архитектурные принципы
- **Mobile-first подход** - все компоненты адаптивны
- **Компонентная архитектура** - переиспользуемость кода
- **TypeScript** - типизация для надежности
- **Семантические токены** - использование дизайн-системы
- **Производительность** - ленивая загрузка, оптимизация

## 📚 Образовательный контент

### Структура курса "Менторинг"
Приложение реализует полный курс по менторингу из 6 тем:

1. **Что такое менторинг** - Определения, отличия от коучинга
2. **Старт в менторинге** - Подготовка и контрактные встречи
3. **Компетенции ментора** - Обратная связь, уровни слушания
4. **Регулярные встречи** - Структура и постановка вопросов
5. **Управление прогрессом** - Работа с барьерами и завершение
6. **Отношения ментор-менти** - Фазы развития отношений

### Методология обучения
- Видеоуроки с интерактивными элементами
- Тестирование после каждого урока
- Демонстрационные сессии
- Практические упражнения
- Система прогресса и сертификации

## 🤝 Поддержка и документация

- [Lovable Documentation](https://docs.lovable.dev/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [N8N Documentation](https://docs.n8n.io/)
- [React Query Docs](https://tanstack.com/query/latest)

## 📄 Лицензия

Этот проект создан с использованием Lovable и следует стандартным практикам разработки веб-приложений.

---

*Создано с ❤️ с помощью [Lovable](https://lovable.dev)*
