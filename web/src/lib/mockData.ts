export const mockServices = [
  { _id: "1", title: "3D-печать на заказ", description: "Печать ваших моделей на профессиональном оборудовании. PLA, ABS, PETG, TPU.", icon: "printer", order: 0 },
  { _id: "2", title: "Моделирование", description: "Создание 3D-моделей по вашим эскизам и чертежам.", icon: "modeling", order: 1 },
  { _id: "3", title: "Прототипирование", description: "Быстрое изготовление прототипов для тестирования идей.", icon: "prototype", order: 2 },
  { _id: "4", title: "Консультации", description: "Помощь в выборе материала, технологии и оптимизации модели.", icon: "consult", order: 3 },
];

export const mockPortfolio = Array.from({ length: 10 }, (_, i) => ({
  _id: `p${i + 1}`,
  title: `Работа ${i + 1}`,
  description: `Описание выполненной работы №${i + 1}`,
  image: null,
  imageUrl: `https://picsum.photos/seed/${i + 100}/600/400`,
  tags: ["3D-печать", "прототип"],
  order: i,
}));

export const mockReviews = [
  { _id: "1", authorName: "Алексей М.", text: "Отличное качество печати, быстрые сроки. Рекомендую!", rating: 5, date: "2024-01-15", approved: true },
  { _id: "2", authorName: "Мария К.", text: "Заказывала фигурку для подарка — получилось лучше, чем ожидала.", rating: 5, date: "2024-01-10", approved: true },
  { _id: "3", authorName: "Дмитрий В.", text: "Профессиональный подход, помогли с моделью. Спасибо!", rating: 5, date: "2024-01-05", approved: true },
];

export const mockProducts = [
  { _id: "1", title: "Фигурка персонажа", slug: { current: "figurine-1" }, description: "Детализированная фигурка", price: 1500, category: "figurines", material: "pla", imageUrl: "https://picsum.photos/seed/201/400/400" },
  { _id: "2", title: "Прототип корпуса", slug: { current: "prototype-1" }, description: "Корпус для электроники", price: 2500, category: "prototypes", material: "abs", imageUrl: "https://picsum.photos/seed/202/400/400" },
  { _id: "3", title: "Органайзер для стола", slug: { current: "organizer" }, description: "Практичный органайзер", price: 800, category: "utilities", material: "pla", imageUrl: "https://picsum.photos/seed/203/400/400" },
  { _id: "4", title: "Сувенирная модель", slug: { current: "souvenir" }, description: "Памятный сувенир", price: 1200, category: "souvenirs", material: "pla", imageUrl: "https://picsum.photos/seed/204/400/400" },
];

export const mockBlogPosts = [
  { _id: "1", title: "Введение в 3D-печать", slug: { current: "intro-3d-print" }, excerpt: "Рассказываем о возможностях технологии", publishedAt: "2024-01-15", coverImage: null },
  { _id: "2", title: "Выбор материала для печати", slug: { current: "material-choice" }, excerpt: "PLA, ABS, PETG — что выбрать?", publishedAt: "2024-01-10", coverImage: null },
];

export const mockFaq = [
  { _id: "1", question: "Какие материалы вы используете?", answer: "Мы работаем с PLA, ABS, PETG, TPU и другими современными материалами для 3D-печати.", order: 0 },
  { _id: "2", question: "Как долго изготавливается заказ?", answer: "Сроки зависят от сложности и объёма. Обычно 2-5 рабочих дней.", order: 1 },
  { _id: "3", question: "Нужна ли своя 3D-модель?", answer: "Модель может быть вашей или мы поможем её создать по вашим эскизам.", order: 2 },
];

export const mockSiteSettings = {
  title: "2G Tech Lab",
  heroTitle: "Мастерская 3D-печати",
  heroSubtitle: "Услуги печати на заказ, готовые изделия, сотрудничество с дизайнерами. Современные технологии для ваших идей.",
  phone: "+7 (999) 123-45-67",
  email: "info@2gtechlab.ru",
  address: "г. Москва, ул. Примерная, д. 1",
};
