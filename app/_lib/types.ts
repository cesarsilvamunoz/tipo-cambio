export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  country: string;
  rateVsUSD: number;
  category: 'LatAm' | 'Popular' | 'Global';
}

export interface ExchangeRatesData {
  base: string;
  date: string;
  timestamp: number;
  rates: Record<string, number>;
  source: string;
}

export interface ConversionHistoryItem {
  id: string;
  timestamp: string;
  fromCode: string;
  fromAmount: number;
  toCode: string;
  toAmount: number;
  rate: number;
}

export type ActiveTab = 'converter' | 'cheatsheet';