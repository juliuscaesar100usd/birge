import type { Category } from "@/lib/types";

export const categories: Category[] = [
  { id: "electronics", nameRu: "Электроника", nameKk: "Электроника", nameEn: "Electronics", icon: "📱" },
  { id: "fashion", nameRu: "Одежда и обувь", nameKk: "Киім және аяқ киім", nameEn: "Fashion", icon: "👟" },
  { id: "home", nameRu: "Дом и сад", nameKk: "Үй және бақша", nameEn: "Home & Garden", icon: "🏠" },
  { id: "beauty", nameRu: "Красота", nameKk: "Сұлулық", nameEn: "Beauty", icon: "💄" },
  { id: "kids", nameRu: "Детям", nameKk: "Балаларға", nameEn: "Kids", icon: "🧸" },
  { id: "sports", nameRu: "Спорт", nameKk: "Спорт", nameEn: "Sports", icon: "⚽" },
  { id: "appliances", nameRu: "Бытовая техника", nameKk: "Тұрмыстық техника", nameEn: "Appliances", icon: "🔌" },
  { id: "accessories", nameRu: "Аксессуары", nameKk: "Аксессуарлар", nameEn: "Accessories", icon: "🎒" },
];

export const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]));
