// Simulated participant pool (TRD §15)
export const simulatedNames = [
  "Айгерим",
  "Даулет",
  "Мадина",
  "Алихан",
  "Аружан",
  "Нурсултан",
  "Дана",
  "Тимур",
  "Жанель",
  "Ерлан",
  "Сауле",
  "Бекзат",
  "Камила",
  "Арман",
  "Инкар",
  "Санжар",
];

export function pickSimulatedName(taken: string[]): string {
  const free = simulatedNames.filter((n) => !taken.includes(n));
  const pool = free.length > 0 ? free : simulatedNames;
  return pool[taken.length % pool.length];
}
