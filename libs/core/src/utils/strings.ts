export function protectString(text: string) {
  if (!text) {
    return text;
  }

  if (text.length <= 4) {
    return text.substring(0, 1) + '***';
  }

  return text.substring(0, 2) + '****' + text.substring(text.length - 2);
}

export function protectEmail(email: string) {
  if (!email) {
    return;
  }
  const splitted = email.split('@');
  return protectString(splitted[0]) + '@' + (splitted[1] ?? '');
}
