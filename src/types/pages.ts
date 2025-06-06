
export interface PageProps {
  lessonId?: number;
  courseId?: number;
  testId?: number;
}

export interface LessonDetailProps extends PageProps {
  lessonId?: number;
}

export interface TestProps extends PageProps {
  lessonId?: number;
}
