
import { MockDataSet } from './MockDataTypes';

export class MockDataFactory {
  static createDefaultDataSet(): MockDataSet {
    return {
      version: '1.0.0',
      users: [
        {
          user_id: '12345',
          username: 'anna_petrova',
          full_name: 'Анна Петрова',
          course_status: 'in_progress',
          current_lesson: 3,
          last_activity: new Date().toISOString(),
          score: 85,
          subscription_status: 'premium',
          registration_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          user_id: '67890',
          username: 'ivan_dev',
          full_name: 'Иван Разработчик',
          course_status: 'completed',
          current_lesson: 6,
          last_activity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          score: 95,
          subscription_status: 'vip',
          registration_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      lessons: [
        {
          lesson_id: 1,
          title: 'Что такое менторинг',
          content: 'Менторинг - это процесс передачи знаний и опыта...',
          questions: [
            {
              question_id: 'q1_1',
              text: 'Что является ключевым в менторинге?',
              correct_answer: 'Передача опыта',
              options: ['Передача опыта', 'Контроль', 'Оценка', 'Критика']
            }
          ]
        }
      ],
      settings: {
        webhook_url: 'https://demo-n8n.example.com/webhook',
        automation_enabled: true,
        notifications_enabled: true
      }
    };
  }
}
