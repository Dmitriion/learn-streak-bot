
import LoggingService from '../LoggingService';
import { MockDataSet, MockUserData } from './MockDataTypes';

export class MockDataManager {
  private logger: LoggingService;
  private currentDataSet: MockDataSet;

  constructor(initialDataSet: MockDataSet) {
    this.logger = LoggingService.getInstance();
    this.currentDataSet = initialDataSet;
  }

  getUsers(): MockUserData[] {
    return [...this.currentDataSet.users];
  }

  getLessons() {
    return [...this.currentDataSet.lessons];
  }

  getSettings() {
    return { ...this.currentDataSet.settings };
  }

  addUser(userData: Partial<MockUserData>): MockUserData {
    const newUser: MockUserData = {
      user_id: userData.user_id || `mock_${Date.now()}`,
      username: userData.username,
      full_name: userData.full_name || 'Тестовый пользователь',
      course_status: userData.course_status || 'not_started',
      current_lesson: userData.current_lesson || 0,
      last_activity: userData.last_activity || new Date().toISOString(),
      score: userData.score || 0,
      subscription_status: userData.subscription_status || 'free',
      registration_date: userData.registration_date || new Date().toISOString()
    };

    this.currentDataSet.users.push(newUser);
    this.logger.debug('MockDataManager: добавлен mock пользователь', { userId: newUser.user_id });
    
    return newUser;
  }

  updateUser(userId: string, updates: Partial<MockUserData>): MockUserData | null {
    const userIndex = this.currentDataSet.users.findIndex(u => u.user_id === userId);
    if (userIndex === -1) {
      return null;
    }

    this.currentDataSet.users[userIndex] = {
      ...this.currentDataSet.users[userIndex],
      ...updates,
      last_activity: new Date().toISOString()
    };

    this.logger.debug('MockDataManager: обновлен mock пользователь', { userId, updates });
    return this.currentDataSet.users[userIndex];
  }

  resetData(newDataSet: MockDataSet) {
    this.currentDataSet = newDataSet;
    this.logger.info('MockDataManager: данные сброшены');
  }

  getVersion(): string {
    return this.currentDataSet.version;
  }

  exportData(): MockDataSet {
    return JSON.parse(JSON.stringify(this.currentDataSet));
  }

  importData(dataSet: MockDataSet) {
    this.currentDataSet = dataSet;
    this.logger.info('MockDataManager: данные импортированы', { version: dataSet.version });
  }
}
