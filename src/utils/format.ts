export function money(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 0 });
}
