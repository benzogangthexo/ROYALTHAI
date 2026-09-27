/* Факты сети: только из royalthai.ru (/about/, /masters/, /promo/, /contacts/, /certificates/deposits/) и Яндекс Карт */

export const site = {
  name: "ROYAL THAI",
  legalTagline: "Сеть салонов тайского и балийского массажа",
  city: "Санкт-Петербург",
  phone: "+7 (812) 242-13-13",
  phoneHours: "с 10:00 до 22:00 без выходных",
  email: "info@royalthai.ru",
  feedbackEmail: "feedback@royalthai.ru",
  salesEmail: "sales@royalthai.ru",
  officialSite: "https://royalthai.ru",
  certificatesUrl: "https://royalthai.ru/certificates/",
  socials: [
    { id: "vk", label: "ВКонтакте", href: "https://vk.ru/royalthai_spa" },
    { id: "tg", label: "Telegram", href: "https://t.me/royalthai_spa" },
  ],
  founded: 2007,
  firstSalon: "Песочная набережная",
  mastersInCity: 78,
  salonsInCity: 27,
  /** /promo/: «в будние дни с 10 до 16 скидка 20% на программы от 90 мин.» */
  happyHours: { days: "по будням", from: "10:00", to: "16:00", discount: 20, minMinutes: 90 },
  /** /promo/: скидка 20% имениннику на программы от 60 минут, в день рождения и две недели после */
  birthday: { discount: 20, minMinutes: 60 },
  /** /certificates/deposits/ */
  deposits: [5000, 7000, 10000, 15000, 20000, 25000, 50000],
  /** /about/: премия «Хорошее место 2025» от Яндекс Карт */
  award: "«Хорошее место 2025» от Яндекс Карт",
} as const;

export const nav = [
  { href: "#rituals", label: "Ритуалы" },
  { href: "#prices", label: "Цены" },
  { href: "#salons", label: "Салоны" },
  { href: "#gift", label: "Сертификаты" },
  { href: "#reviews", label: "Отзывы" },
] as const;
