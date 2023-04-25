import shuffle from 'lodash/shuffle';

const LETTER_REGEX = /^[A-Za-z]*$/;

export function isLetter(letter: string): boolean {
  return letter.length === 1 && LETTER_REGEX.test(letter);
}

const WORDS = [
  'apple',
  'function',
  'timeout',
  'task',
  'application',
  'data',
  'tragedy',
  'sun',
  'symbol',
  'button',
  'software',
];

export function getWords(count: number): string[] {
  return shuffle([...WORDS]).slice(0, count);
}
