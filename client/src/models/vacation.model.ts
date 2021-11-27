export type VacationModel = {
  id: number;
  title: string;
  description: string;
  fromDate: string;
  toDate: string;
  price: number;
  url: string;
  follows?: number;
};

export type VacationStat = { id: number; title: string; follows: number };
