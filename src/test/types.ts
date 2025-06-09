
export interface TestUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface TestSetupOptions {
  user?: TestUser;
  theme?: 'light' | 'dark';
  mockN8N?: boolean;
  mockTelegram?: boolean;
}

export interface RenderWithProvidersOptions extends TestSetupOptions {
  initialEntries?: string[];
}
