export function formatNumber(value: number, decimals: number = 0): string {
  if (!Number.isFinite(value)) return '0';
  const fixed = value.toFixed(decimals);
  const [intPart, decPart] = fixed.split('.');
  const sign = intPart.startsWith('-') ? '-' : '';
  const digits = sign ? intPart.slice(1) : intPart;
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decPart ? `${sign}${grouped}.${decPart}` : `${sign}${grouped}`;
}

export function convertCurrency(
  amount: number,
  fromRateUSD: number,
  toRateUSD: number
): number {
  if (fromRateUSD <= 0 || toRateUSD <= 0 || isNaN(amount)) return 0;

  const amountInUSD = amount / fromRateUSD;
  return amountInUSD * toRateUSD;
}

export function getDirectRate(fromRateUSD: number, toRateUSD: number): number {
  if (fromRateUSD <= 0) return 0;
  return toRateUSD / fromRateUSD;
}

export function formatCurrencyValue(
  value: number,
  currencyCode: string,
  symbol: string
): string {
  if (isNaN(value)) return `${symbol} 0.00`;

  let decimals = 2;
  if (['CLP', 'COP', 'JPY', 'ARS'].includes(currencyCode) && Math.abs(value) >= 100) {
    decimals = 0;
  } else if (currencyCode === 'CRC' && Math.abs(value) >= 1000) {
    decimals = 0;
  } else if (Math.abs(value) < 0.01 && value > 0) {
    decimals = 4;
  }

  return `${symbol} ${formatNumber(value, decimals)}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}