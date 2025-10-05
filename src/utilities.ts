export const getRandomItem = <T>(array: T[]) =>
  array[Math.floor(Math.random() * array.length)]!;
