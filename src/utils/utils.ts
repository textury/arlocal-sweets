export const atob = (a: string): string => {
  return Buffer.from(a, "base64").toString();
};
