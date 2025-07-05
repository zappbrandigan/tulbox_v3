function generateReactKey(prefix = 'key'): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}`;
}

export default generateReactKey;
