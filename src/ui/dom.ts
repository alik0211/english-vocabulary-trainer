import Game, { ResultCode, IQuestion } from '../modules/game';
import { isLetter } from '../tools';

enum LetterType {
  Success = 'success',
  Failure = 'danger',
}

class DOM {
  game: Game;

  DEFAULT_DELAY_MS: number;

  answerContainer: HTMLElement;
  lettersContainer: HTMLElement;
  trainerContainer: HTMLElement;
  resultsContainer: HTMLElement;
  currentQuestionContainer: HTMLElement;

  constructor() {
    this.game = new Game();

    this.DEFAULT_DELAY_MS = 500;

    const answerContainer = document.getElementById('answer');
    const lettersContainer = document.getElementById('letters');
    const trainerContainer = document.getElementById('trainer');
    const resultsContainer = document.getElementById('results');
    const currentQuestionContainer =
      document.getElementById('current_question');

    if (
      !answerContainer ||
      !lettersContainer ||
      !trainerContainer ||
      !resultsContainer ||
      !currentQuestionContainer
    ) {
      throw new Error('UI DOM init fail');
    }

    this.answerContainer = answerContainer;
    this.lettersContainer = lettersContainer;
    this.trainerContainer = trainerContainer;
    this.resultsContainer = resultsContainer;
    this.currentQuestionContainer = currentQuestionContainer;
  }

  private clearAnswer() {
    this.answerContainer.replaceChildren();
  }

  private clearLetters() {
    this.lettersContainer.replaceChildren();
  }

  private renderAnswerLetter(letter: string, type: LetterType) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `btn btn-${type} mr-1 ml-1`;
    button.textContent = letter;

    this.answerContainer.appendChild(button);
  }

  private renderFailedAnswer(question: IQuestion) {
    const letters = question.word.split('');

    letters.forEach((letter) => {
      this.renderAnswerLetter(letter, LetterType.Failure);
    });

    if (this.game.isTrainingComplete) {
      setTimeout(() => {
        this.renderResults();
      }, this.DEFAULT_DELAY_MS);
    } else {
      setTimeout(() => {
        this.renderQuestion();
      }, this.DEFAULT_DELAY_MS);
    }
  }

  private renderResults() {
    this.trainerContainer.classList.remove('d-flex');
    this.trainerContainer.classList.add('d-none');

    this.resultsContainer.classList.remove('d-none');
    this.resultsContainer.classList.add('d-flex');

    const stats = this.game.getStats();

    for (const metricName in stats) {
      const element = document.getElementById(`metric-${metricName}`);

      if (!element) {
        throw new Error(`Element for metric ${metricName} not found`);
      }

      if (metricName === 'questionWithMaxErrors') {
        if (stats.errorsCount === 0) {
          element.parentElement?.remove();
        } else {
          element.textContent = stats[metricName].word;
        }
      } else {
        element.textContent = `${stats[metricName]}`;
      }
    }
  }

  private renderQuestion() {
    this.currentQuestionContainer.textContent = `${
      this.game.currentQuestionIndex + 1
    }`;

    this.clearAnswer();

    const question = this.game.getCurrentQuestion();

    question.letters.forEach((letter) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn btn-primary mr-1 ml-1';
      button.dataset.letter = letter;
      button.textContent = letter;

      button.addEventListener('click', () => {
        const resultCode = this.game.selectLetter(letter);

        switch (resultCode) {
          case ResultCode.LETTER_SUCCESS:
            button.remove();
            this.renderAnswerLetter(letter, LetterType.Success);
            break;

          case ResultCode.QUESTION_SUCCESS:
            button.remove();
            this.renderAnswerLetter(letter, LetterType.Success);

            if (this.game.isTrainingComplete) {
              this.renderResults();
            } else {
              this.renderQuestion();
            }
            break;

          case ResultCode.LETTER_FAIL:
            button.classList.add('btn-danger');
            setTimeout(() => {
              button.classList.remove('btn-danger');
            }, this.DEFAULT_DELAY_MS);
            break;

          case ResultCode.QUESTION_FAIL:
            this.clearAnswer();
            this.clearLetters();

            this.renderFailedAnswer(question);
            break;

          default:
            break;
        }
      });

      this.lettersContainer.appendChild(button);
    });
  }

  private handleKeydown(event: KeyboardEvent) {
    if (!isLetter(event.key)) {
      return;
    }

    const key = event.key.toLowerCase();

    const button = this.lettersContainer.querySelector(
      `[data-letter="${key}"]`
    );

    if (button instanceof HTMLButtonElement) {
      button.click();
    } else {
      const question = this.game.getCurrentQuestion();

      const resultCode = this.game.selectLetter('-');

      if (resultCode === ResultCode.QUESTION_FAIL) {
        this.clearAnswer();
        this.clearLetters();

        this.renderFailedAnswer(question);
      }
    }
  }

  public render(): void {
    this.renderQuestion();

    document.addEventListener('keydown', this.handleKeydown.bind(this), false);
  }
}

export default DOM;
