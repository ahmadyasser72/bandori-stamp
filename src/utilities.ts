export const getRandomItem = <T>(array: T[]) =>
  array[Math.floor(Math.random() * array.length)]!;

// https://stackoverflow.com/a/5092846
export const getRandomHexColor = () =>
  "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0");

export const isColorDark = (hex: string) => {
  const startIndex = hex.startsWith("#") ? 1 : 0;

  const red = parseInt(hex.slice(startIndex, startIndex + 2), 16);
  const green = parseInt(hex.slice(startIndex + 2, startIndex + 4), 16);
  const blue = parseInt(hex.slice(startIndex + 4, startIndex + 6), 16);

  // http://24ways.org/2010/calculating-color-contrast
  const yiq = (red * 2126 + green * 7152 + blue * 722) / 10000;
  return yiq < 128;
};
