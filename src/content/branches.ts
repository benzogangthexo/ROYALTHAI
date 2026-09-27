/* Салоны в Петербурге: 27 названий с главной royalthai.ru. Адреса, метро, часы и рейтинги:
   Яндекс Карты (у кого есть yandexId), страница /services/spa-for-two/ и текст заказчика из BRIEF.md.
   Где адреса в источниках нет, address = null: карточка ведёт в поиск Яндекс Карт. */

export type District = "center" | "north" | "south" | "east" | "islands";

export type Branch = {
  id: string;
  name: string;
  district: District;
  address: string | null;
  place?: string;
  metro: string[];
  open: string;
  close: string;
  yandexId?: string;
  rating?: { value: number; reviews: number };
  coords?: [number, number];
  bali?: boolean;
};

export const districts: { id: District; label: string }[] = [
  { id: "center", label: "Центр" },
  { id: "north", label: "Север" },
  { id: "south", label: "Юг" },
  { id: "east", label: "Правый берег" },
  { id: "islands", label: "Острова" },
];

const day = { open: "10:00", close: "22:00" };

export const branches: Branch[] = [
  {
    id: "konyushennaya",
    name: "Конюшенная",
    district: "center",
    address: "Большая Конюшенная ул., 1",
    metro: ["Гостиный двор", "Невский проспект"],
    ...day,
    yandexId: "1193724645",
    rating: { value: 5, reviews: 347 },
    coords: [30.324279, 59.94101],
  },
  {
    id: "stockmann",
    name: "Стокманн",
    district: "center",
    address: "Невский пр., 114-116",
    place: "ТЦ «Невский центр», 6 этаж",
    metro: ["Площадь Восстания", "Маяковская"],
    open: "10:00",
    close: "23:00",
    yandexId: "1463486438",
    rating: { value: 4.9, reviews: 272 },
    coords: [30.359653, 59.932346],
  },
  {
    id: "sovetskaya",
    name: "Советская",
    district: "center",
    address: "9-я Советская ул., 20",
    metro: ["Площадь Восстания", "Чернышевская"],
    ...day,
    yandexId: "173949800191",
    rating: { value: 5, reviews: 112 },
    coords: [30.376841, 59.936917],
  },
  { id: "furshtatskaya", name: "Фурштатская", district: "center", address: "Фурштатская ул., 23", metro: ["Чернышевская"], ...day },
  { id: "pushkinskaya", name: "Пушкинская", district: "center", address: null, metro: ["Пушкинская"], ...day },
  { id: "sennaya", name: "Сенная", district: "center", address: null, metro: ["Сенная площадь"], open: "10:00", close: "21:00" },
  {
    id: "begovaya",
    name: "Беговая",
    district: "north",
    address: "ул. Савушкина, 143, корп. 1",
    metro: ["Беговая"],
    ...day,
    yandexId: "215124691677",
    rating: { value: 4.9, reviews: 177 },
    coords: [30.200728, 59.989755],
  },
  {
    id: "bogatyrsky",
    name: "Богатырский",
    district: "north",
    address: "Богатырский пр., 22, корп. 1",
    metro: ["Комендантский проспект"],
    ...day,
    yandexId: "118127160592",
    rating: { value: 5, reviews: 115 },
    coords: [30.251721, 60.000987],
  },
  {
    id: "svetlanovsky",
    name: "Светлановский",
    district: "north",
    address: "Светлановский пр., 8",
    metro: ["Удельная", "Площадь Мужества"],
    ...day,
    yandexId: "213111733877",
    rating: { value: 5, reviews: 110 },
    coords: [30.336953, 60.007305],
  },
  { id: "komendantsky", name: "Комендантский", district: "north", address: "Комендантский пр., 17, корп. 1", metro: ["Комендантский проспект"], ...day },
  { id: "shuvalovsky", name: "Шуваловский", district: "north", address: "Комендантский пр., 51, корп. 1", metro: [], ...day },
  { id: "ozerki", name: "Озерки", district: "north", address: "Выборгское ш., 5, корп. 1", metro: ["Озерки"], ...day },
  { id: "citymall", name: "Сити Молл", district: "north", address: null, place: "ТЦ «Сити Молл»", metro: [], ...day },
  { id: "butlerova", name: "Bali на Бутлерова", district: "north", address: "ул. Бутлерова, 11, корп. 4", metro: [], ...day, bali: true },
  { id: "murino", name: "Мурино", district: "north", address: null, metro: [], ...day },
  {
    id: "leninsky",
    name: "Ленинский",
    district: "south",
    address: "Ленинский пр., 114",
    metro: ["Ленинский проспект"],
    ...day,
    yandexId: "126760350096",
    rating: { value: 5, reviews: 217 },
    coords: [30.243229, 59.852402],
  },
  { id: "moskovsky", name: "Московский", district: "south", address: "Московский пр., 183-185А", metro: ["Московская"], ...day },
  { id: "varshavskaya", name: "Варшавская", district: "south", address: "Варшавская ул., 23, корп. 3", metro: [], ...day },
  {
    id: "zhemchuzhina",
    name: "Жемчужина",
    district: "south",
    address: "Петергофское ш., 45",
    place: "ЖК «Жемчужная симфония»",
    metro: ["Проспект Ветеранов", "Ленинский проспект"],
    ...day,
  },
  { id: "rio", name: "Bali РИО", district: "south", address: null, place: "ТРЦ «РИО»", metro: [], open: "10:00", close: "21:30", bali: true },
  { id: "pushkin", name: "Пушкин", district: "south", address: null, metro: [], ...day },
  {
    id: "novocherkasskaya",
    name: "Новочеркасская",
    district: "east",
    address: "Новочеркасский пр., 33, корп. 3",
    metro: ["Новочеркасская"],
    ...day,
    yandexId: "180097390474",
    rating: { value: 5, reviews: 176 },
    coords: [30.408022, 59.931425],
  },
  {
    id: "dalnevostochny",
    name: "Дальневосточный",
    district: "east",
    address: "Дальневосточный пр., 35, корп. 1",
    metro: ["Улица Дыбенко"],
    ...day,
    yandexId: "233989024062",
    rating: { value: 5, reviews: 221 },
    coords: [30.46012, 59.896855],
  },
  { id: "dybenko", name: "Дыбенко", district: "east", address: null, metro: ["Улица Дыбенко"], ...day },
  { id: "kudrovo", name: "Кудрово", district: "east", address: null, metro: [], ...day },
  { id: "morskoy", name: "Морской фасад", district: "islands", address: "Капитанская ул., 4", metro: ["Приморская"], ...day },
  { id: "pesochnaya", name: "Песочная", district: "islands", address: "Песочная наб.", metro: [], ...day },
];

export const branchById = (id: string) => branches.find((b) => b.id === id);

/** Ссылка «Маршрут»: карточка организации в Яндекс Картах или поиск по адресу */
export function routeHref(b: Branch) {
  if (b.yandexId) return `https://yandex.ru/maps/org/royal_thai/${b.yandexId}/`;
  const q = `Royal Thai ${b.address ?? b.place ?? b.name}, Санкт-Петербург`;
  return `https://yandex.ru/maps/2/saint-petersburg/search/${encodeURIComponent(q)}/`;
}

/** Сводка по салонам с карточкой на Яндекс Картах */
export const yandexSummary = (() => {
  const rated = branches.filter((b) => b.rating);
  const reviews = rated.reduce((sum, b) => sum + (b.rating?.reviews ?? 0), 0);
  const values = rated.map((b) => b.rating?.value ?? 0);
  return { salons: rated.length, reviews, min: Math.min(...values), max: Math.max(...values) };
})();
