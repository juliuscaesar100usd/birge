import type { Category } from "@/lib/types";

export const categories: Category[] = [
  { id: "electronics", nameRu: "Электроника", nameKk: "Электроника", nameEn: "Electronics", icon: "📱", iconName: "elec", tint: "#EAF2FE", ink: "#1668E3" },
  { id: "fashion", nameRu: "Одежда и обувь", nameKk: "Киім және аяқ киім", nameEn: "Fashion", icon: "👟", iconName: "fashion", tint: "#FCEAF3", ink: "#C2186B" },
  { id: "home", nameRu: "Дом и сад", nameKk: "Үй және бақша", nameEn: "Home & Garden", icon: "🏠", iconName: "homecat", tint: "#E9F7EF", ink: "#0E7E45" },
  { id: "beauty", nameRu: "Красота", nameKk: "Сұлулық", nameEn: "Beauty", icon: "💄", iconName: "beauty", tint: "#FFF0F0", ink: "#D6455B" },
  { id: "kids", nameRu: "Детям", nameKk: "Балаларға", nameEn: "Kids", icon: "🧸", iconName: "kids", tint: "#FFF6E0", ink: "#B07A00" },
  { id: "sports", nameRu: "Спорт", nameKk: "Спорт", nameEn: "Sports", icon: "⚽", iconName: "sports", tint: "#E8F4FD", ink: "#0B6BB8" },
  { id: "appliances", nameRu: "Бытовая техника", nameKk: "Тұрмыстық техника", nameEn: "Appliances", icon: "🔌", iconName: "appliances", tint: "#F0EDFB", ink: "#5B43C4" },
  { id: "accessories", nameRu: "Аксессуары", nameKk: "Аксессуарлар", nameEn: "Accessories", icon: "🎒", iconName: "accessories", tint: "#FFEFE6", ink: "#C75218" },
];

export const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]));
