import shuffle from 'lodash/shuffle';
import { getWords } from '../tools';

export interface IQuestion {
  word: string;
  errors: number;
  answer: string[];
  letters: string[];
}

interface IStats {
  [key: string]: any;

  errorsCount: number;
  wordsWithoutErrors: number;
  questionWithMaxErrors: IQuestion;
}

export enum ResultCode {
  QUESTION_SUCCESS,
  LETTER_SUCCESS,
  QUESTION_FAIL,
  LETTER_FAIL,

  TRAINING_COMPLETE,
}

class Game {
  QUESTIONS_COUNT: number;

  questions: IQuestion[];
  currentQuestionIndex: number;

  constructor() {
    this.QUESTIONS_COUNT = 6;

    this.questions = this.generateQuestions();
    this.currentQuestionIndex = 0;
  }

  generateQuestions(): IQuestion[] {
    return getWords(this.QUESTIONS_COUNT).map((word) => {
      return {
        word,
        errors: 0,
        answer: [],
        letters: shuffle([...word]),
      };
    });
  }

  get isTrainingComplete() {
    return this.currentQuestionIndex === this.QUESTIONS_COUNT;
  }

  getCurrentQuestion() {
    return this.questions[this.currentQuestionIndex];
  }

  selectLetter(letter: string): ResultCode {
    if (this.isTrainingComplete) {
      return ResultCode.TRAINING_COMPLETE;
    }

    const question = this.getCurrentQuestion();

    const nextAnswer = [...question.answer, letter];

    if (question.word.startsWith(nextAnswer.join(''))) {
      question.answer = nextAnswer;
      question.letters.splice(question.letters.indexOf(letter), 1);

      if (question.word.length === question.answer.length) {
        this.currentQuestionIndex += 1;

        return ResultCode.QUESTION_SUCCESS;
      }

      return ResultCode.LETTER_SUCCESS;
    } else {
      question.errors += 1;

      if (question.errors === 3) {
        this.currentQuestionIndex += 1;

        return ResultCode.QUESTION_FAIL;
      }

      return ResultCode.LETTER_FAIL;
    }
  }

  getStats(): IStats {
    const errorsCount = this.questions.reduce((acc, q) => (acc += q.errors), 0);
    const wordsWithoutErrors = this.questions.filter(
      (q) => q.errors === 0
    ).length;
    const questionWithMaxErrors = this.questions.reduce((acc, q) => {
      return q.errors > acc.errors ? q : acc;
    });

    return {
      errorsCount,
      wordsWithoutErrors,
      questionWithMaxErrors,
    };
  }
}

export default Game;
