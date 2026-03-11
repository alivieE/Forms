export type QuestionType = 'TEXT' | 'MULTIPLE_CHOICE' | 'CHECKBOX' | 'DATE';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options: string[];
  required: boolean;
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  createdAt: string;
}

export interface Answer {
  questionId: string;
  value: string[];
}

export interface Response {
  id: string;
  formId: string;
  answers: Answer[];
  submittedAt: string;
}

// Inputs для мутацій
export interface QuestionInput {
  text: string;
  type: QuestionType;
  options: string[];
  required: boolean;
}

export interface AnswerInput {
  questionId: string;
  value: string[];
}

// Для конструктора форм (з локальним id для key)
export interface QuestionDraft extends QuestionInput {
  _localId: string;
}
