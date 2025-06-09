
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
          content: 'Менторинг - это процесс передачи знаний и опыта от более опытного специалиста к менее опытному. Международные определения менторинга подчеркивают важность взаимоотношений, основанных на доверии и взаимном уважении.',
          questions: [
            {
              question_id: 'q1_1',
              text: 'Что является ключевым в менторинге?',
              correct_answer: 'Передача опыта',
              options: ['Передача опыта', 'Контроль', 'Оценка', 'Критика']
            }
          ]
        },
        {
          lesson_id: 2,
          title: 'Отличие ментора от коуча',
          content: 'Ментор отличается от коуча тем, что делится своим личным опытом и знаниями в конкретной области. В отличие от линейного руководителя, ментор не имеет административной власти над менти.',
          questions: [
            {
              question_id: 'q2_1',
              text: 'Может ли руководитель быть 100% ментором для своих сотрудников?',
              correct_answer: 'Нет',
              options: ['Да', 'Нет']
            }
          ]
        },
        {
          lesson_id: 3,
          title: 'Структура работы с менти',
          content: 'Эффективная структура менторинга включает в себя этапы знакомства, постановки целей, регулярных встреч и оценки прогресса. Важно установить четкие границы и ожидания с самого начала.',
          questions: [
            {
              question_id: 'q3_1',
              text: 'Какой первый этап в структуре менторинга?',
              correct_answer: 'Знакомство',
              options: ['Знакомство', 'Постановка целей', 'Оценка', 'Обратная связь']
            }
          ]
        },
        {
          lesson_id: 4,
          title: 'Позиция ментора',
          content: 'Позиция ментора включает три составляющих: директивность/недирективность, поддержка и вызов, личный пример. Важно найти баланс между предоставлением советов и позволением менти самостоятельно находить решения.',
          questions: [
            {
              question_id: 'q4_1',
              text: 'Сколько составляющих в позиции ментора?',
              correct_answer: 'Три',
              options: ['Две', 'Три', 'Четыре', 'Пять']
            }
          ]
        },
        {
          lesson_id: 5,
          title: 'Эффективная подготовка к менторингу',
          content: 'Перед началом менторинга важно подготовиться: определить свои границы, понять, что готов и не готов делать как ментор, подготовить организационные вопросы.',
          questions: [
            {
              question_id: 'q5_1',
              text: 'Что важно определить перед началом менторинга?',
              correct_answer: 'Свои границы',
              options: ['Свои границы', 'Зарплату менти', 'Расписание', 'Местоположение']
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
