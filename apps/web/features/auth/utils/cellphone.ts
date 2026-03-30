const BRAZILIAN_CELLPHONE_REGEX = /^(?:55)?[1-9]{2}9\d{8}$/;

export function normalizeCellphone(value: string) {
  return value.replace(/\D/g, '');
}

export function formatCellphone(value: string) {
  const digits = normalizeCellphone(value).slice(0, 11);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 7) {
    return digits.replace(/(\d{2})(\d+)/, '($1) $2');
  }

  return digits.replace(/(\d{2})(\d{5})(\d+)/, '($1) $2-$3');
}

export function isValidCellphone(value: string) {
  return BRAZILIAN_CELLPHONE_REGEX.test(normalizeCellphone(value));
}
