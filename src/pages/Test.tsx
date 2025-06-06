
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Clock, ArrowLeft, Award } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Test = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lessonId = searchParams.get('lesson');
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1200); // 20 минут в секундах
  const [isActive, setIsActive] = useState(true);

  // Тестовые данные для разных типов вопросов
  const testData = {
    1: {
      title: "Тест: Введение в коучинг",
      questions: [
        {
          id: 1,
          type: "radio",
          question: "Что является основной целью коучинга?",
          options: [
            "Дать советы клиенту",
            "Помочь клиенту найти собственные решения",
            "Решить проблемы за клиента",
            "Научить клиента правильно жить"
          ],
          correct: 1
        },
        {
          id: 2,
          type: "text",
          question: "Опишите своими словами, чем коучинг отличается от консультирования?",
          correct: "коучинг помогает клиенту найти собственные решения"
        },
        {
          id: 3,
          type: "radio",
          question: "Какой принцип НЕ относится к коучингу?",
          options: [
            "Клиент сам знает ответы на свои вопросы",
            "Коуч не дает советов",
            "Коуч всегда знает лучше клиента",
            "Фокус на будущем, а не на прошлом"
          ],
          correct: 2
        }
      ]
    },
    4: {
      title: "Тест: Работа с целями",
      questions: [
        {
          id: 1,
          type: "radio",
          question: "Что означает аббревиатура SMART в постановке целей?",
          options: [
            "Specific, Measurable, Achievable, Relevant, Time-bound",
            "Simple, Modern, Accurate, Real, Timely",
            "Smart, Modern, Advanced, Reliable, Tested",
            "Special, Measured, Active, Ready, Timed"
          ],
          correct: 0
        },
        {
          id: 2,
          type: "text",
          question: "Приведите пример SMART-цели для личного развития:",
          correct: "конкретная измеримая достижимая цель с временными рамками"
        }
      ]
    }
  };

  const currentTest = testData[lessonId] || testData[1];

  // Таймер
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0 && !showResults) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSubmitTest();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, showResults]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < currentTest.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmitTest();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitTest = () => {
    setIsActive(false);
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    currentTest.questions.forEach(question => {
      const userAnswer = answers[question.id];
      if (question.type === 'radio') {
        if (userAnswer === question.correct) correct++;
      } else if (question.type === 'text') {
        if (userAnswer && userAnswer.toLowerCase().includes(question.correct.toLowerCase())) {
          correct++;
        }
      }
    });
    return Math.round((correct / currentTest.questions.length) * 100);
  };

  const getResultMessage = (score) => {
    if (score >= 90) return { message: "Отлично! Вы прекрасно усвоили материал!", color: "text-green-600", icon: Award };
    if (score >= 70) return { message: "Хорошо! Есть небольшие пробелы, но в целом материал усвоен.", color: "text-blue-600", icon: CheckCircle };
    if (score >= 50) return { message: "Удовлетворительно. Рекомендуем повторить материал.", color: "text-yellow-600", icon: Clock };
    return { message: "Необходимо лучше изучить материал. Пересдайте тест после повторения урока.", color: "text-red-600", icon: XCircle };
  };

  if (showResults) {
    const score = calculateScore();
    const result = getResultMessage(score);
    const ResultIcon = result.icon;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <ResultIcon className={`h-16 w-16 ${result.color}`} />
              </div>
              <CardTitle className="text-2xl">Результаты теста</CardTitle>
              <p className="text-muted-foreground">{currentTest.title}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {score}%
                </div>
                <p className={`text-lg ${result.color}`}>{result.message}</p>
                
                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">
                      {currentTest.questions.filter(q => {
                        const userAnswer = answers[q.id];
                        if (q.type === 'radio') return userAnswer === q.correct;
                        if (q.type === 'text') return userAnswer && userAnswer.toLowerCase().includes(q.correct.toLowerCase());
                        return false;
                      }).length}
                    </div>
                    <div className="text-sm text-gray-600">Правильных</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">{currentTest.questions.length}</div>
                    <div className="text-sm text-gray-600">Всего вопросов</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Детальные результаты:</h3>
                {currentTest.questions.map((question, index) => {
                  const userAnswer = answers[question.id];
                  let isCorrect = false;
                  
                  if (question.type === 'radio') {
                    isCorrect = userAnswer === question.correct;
                  } else if (question.type === 'text') {
                    isCorrect = userAnswer && userAnswer.toLowerCase().includes(question.correct.toLowerCase());
                  }

                  return (
                    <div key={question.id} className="p-3 border rounded-lg">
                      <div className="flex items-start gap-2">
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">Вопрос {index + 1}: {question.question}</p>
                          {question.type === 'radio' && (
                            <>
                              <p className="text-sm text-gray-600 mt-1">
                                Ваш ответ: {userAnswer !== undefined ? question.options[userAnswer] : "Не отвечено"}
                              </p>
                              {!isCorrect && (
                                <p className="text-sm text-green-600 mt-1">
                                  Правильный ответ: {question.options[question.correct]}
                                </p>
                              )}
                            </>
                          )}
                          {question.type === 'text' && (
                            <p className="text-sm text-gray-600 mt-1">
                              Ваш ответ: {userAnswer || "Не отвечено"}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => {
                    setCurrentQuestion(0);
                    setAnswers({});
                    setShowResults(false);
                    setTimeLeft(1200);
                    setIsActive(true);
                  }}
                  variant="outline"
                >
                  Пересдать тест
                </Button>
                <Button
                  onClick={() => navigate('/lessons')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Вернуться к урокам
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQ = currentTest.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / currentTest.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate('/lessons')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад
          </Button>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-600" />
            <span className={`font-mono ${timeLeft < 300 ? 'text-red-600' : 'text-gray-600'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Progress */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{currentTest.title}</span>
                <span>Вопрос {currentQuestion + 1} из {currentTest.questions.length}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Question */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">{currentQ.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentQ.type === 'radio' && (
              <RadioGroup
                value={answers[currentQ.id]?.toString() || ""}
                onValueChange={(value) => handleAnswerChange(currentQ.id, parseInt(value))}
              >
                {currentQ.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQ.type === 'text' && (
              <Textarea
                placeholder="Введите ваш ответ..."
                value={answers[currentQ.id] || ""}
                onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                className="min-h-32"
              />
            )}

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                Назад
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!answers[currentQ.id] && currentQ.type === 'radio'}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {currentQuestion === currentTest.questions.length - 1 ? 'Завершить тест' : 'Далее'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Test;
