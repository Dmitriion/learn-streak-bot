
export interface CloudStorageData {
  userProgress: {
    currentLesson: number;
    completedLessons: number[];
    score: number;
    lastActivity: string;
  };
  userPreferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    language: string;
  };
  offlineCache: {
    lessonsData: any[];
    lastSync: string;
  };
}

export interface StorageOperationResult {
  success: boolean;
  error?: string;
}

export interface CloudStorageInterface {
  setItem(key: string, value: any): Promise<boolean>;
  getItem(key: string): Promise<any>;
  removeItem(key: string): Promise<boolean>;
  getKeys(): Promise<string[]>;
}
