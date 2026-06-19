export const generateDateList = (startDate: string, days: number): string[] => {
  const result: string[] = [];
  const start = new Date(startDate);
  for (let i = 0; i < days; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    result.push(date.toISOString().split('T')[0]);
  }
  return result;
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getWeekday = (dateStr: string): number => {
  return new Date(dateStr).getDay();
};

export const getWeekdayName = (weekday: number): string => {
  const names = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return names[weekday];
};

export const getDaysDiff = (dateStr1: string, dateStr2: string): number => {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  return Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
};

export const today = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const addDays = (dateStr: string, days: number): string => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

export const isSameMonth = (date1: string, date2: string): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
};

export const getMonthDays = (year: number, month: number): string[] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekday = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  
  const result: string[] = [];
  for (let i = 0; i < startWeekday; i++) {
    const d = new Date(year, month, -startWeekday + i + 1);
    result.push(d.toISOString().split('T')[0]);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    result.push(d.toISOString().split('T')[0]);
  }
  const remaining = 42 - result.length;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    result.push(d.toISOString().split('T')[0]);
  }
  return result;
};
