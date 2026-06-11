export interface City {
  id: string;
  nameRu: string;
  nameKk: string;
  nameEn: string;
}

export const cities: City[] = [
  { id: "almaty", nameRu: "Алматы", nameKk: "Алматы", nameEn: "Almaty" },
  { id: "astana", nameRu: "Астана", nameKk: "Астана", nameEn: "Astana" },
  { id: "shymkent", nameRu: "Шымкент", nameKk: "Шымкент", nameEn: "Shymkent" },
  { id: "karaganda", nameRu: "Караганда", nameKk: "Қарағанды", nameEn: "Karaganda" },
  { id: "aktobe", nameRu: "Актобе", nameKk: "Ақтөбе", nameEn: "Aktobe" },
  { id: "taraz", nameRu: "Тараз", nameKk: "Тараз", nameEn: "Taraz" },
  { id: "pavlodar", nameRu: "Павлодар", nameKk: "Павлодар", nameEn: "Pavlodar" },
  { id: "atyrau", nameRu: "Атырау", nameKk: "Атырау", nameEn: "Atyrau" },
];

export const cityById = Object.fromEntries(cities.map((c) => [c.id, c]));
