
export const base64 = (word: string) => {
  return Buffer.from(word).toString('base64');
}

