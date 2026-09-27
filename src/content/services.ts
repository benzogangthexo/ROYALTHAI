/* Программы и цены: royalthai.ru/massazh/ и /certificates/services/woman/ (сентябрь 2026).
   Метки «для неё» и «для него» взяты из подборок сертификатов сайта (/certificates/services/woman/ и /man/). */

export type ServiceTag = "her" | "him" | "two" | "spa";
export type ServiceGroup = "body" | "spa" | "two" | "local" | "shape";
export type ServicePhoto = "thai" | "oil" | "spa" | "two" | "local" | "stone" | "barrel";

export type Service = {
  id: string;
  title: string;
  note: string;
  group: ServiceGroup;
  tags: ServiceTag[];
  photo: ServicePhoto;
  prices: { minutes: number; price: number }[];
  /** «В пижаме» на сайте: массаж без масла, в одежде */
  pajamas?: boolean;
  /** только вместе с массажем */
  addon?: boolean;
};

export const serviceGroups: { id: ServiceGroup; label: string }[] = [
  { id: "body", label: "Массаж тела" },
  { id: "spa", label: "СПА" },
  { id: "two", label: "Для двоих" },
  { id: "local", label: "Лицо, спина, ноги" },
  { id: "shape", label: "Коррекция" },
];

const long = (a: number, b: number, c: number) => [
  { minutes: 60, price: a },
  { minutes: 90, price: b },
  { minutes: 120, price: c },
];
const half = (a: number, b?: number) => (b ? [{ minutes: 30, price: a }, { minutes: 60, price: b }] : [{ minutes: 30, price: a }]);

export const services: Service[] = [
  {
    id: "thai",
    title: "Традиционный тайский массаж",
    note: "Глубокая проработка мышц и растяжки. Делается в пижаме, без масла.",
    group: "body",
    tags: ["her", "him"],
    photo: "thai",
    prices: long(4890, 6790, 8690),
    pajamas: true,
  },
  {
    id: "oil",
    title: "Масляный массаж",
    note: "Масло выбираете до сеанса. Мышцы расслабляются, кожа получает уход.",
    group: "body",
    tags: ["her"],
    photo: "oil",
    prices: long(4890, 6790, 8690),
  },
  {
    id: "lomi",
    title: "Массаж «Ломи-ломи»",
    note: "Десятки приёмов: мастер работает пальцами, ладонями, локтями и предплечьями.",
    group: "body",
    tags: ["her", "him"],
    photo: "oil",
    prices: long(4890, 6790, 8690),
  },
  {
    id: "stone",
    title: "Стоун-программа с горячими камнями",
    note: "Массаж горячими камнями вулканических пород, расслабляет всё тело.",
    group: "body",
    tags: ["her", "spa"],
    photo: "stone",
    prices: [{ minutes: 90, price: 7190 }],
  },
  {
    id: "spa-face",
    title: "СПА-программа для лица",
    note: "Час ухода за кожей лица. Можно добавить к масляному массажу.",
    group: "spa",
    tags: ["her", "spa"],
    photo: "spa",
    prices: [{ minutes: 60, price: 5090 }],
  },
  {
    id: "awake",
    title: "СПА «Пробуждение»",
    note: "Короткая программа: масляный массаж и уход за кожей всего тела.",
    group: "spa",
    tags: ["her", "spa"],
    photo: "spa",
    prices: [{ minutes: 90, price: 7590 }],
  },
  {
    id: "choco",
    title: "СПА «Шоколадное блаженство»",
    note: "Арома-массаж с маслом «Шоколад», мягкие скользящие движения.",
    group: "spa",
    tags: ["her", "spa"],
    photo: "oil",
    prices: [{ minutes: 90, price: 7590 }],
  },
  {
    id: "tender",
    title: "СПА «Нежность прикосновений»",
    note: "Пилинг, питательная маска и массаж с ароматическим маслом.",
    group: "spa",
    tags: ["spa"],
    photo: "spa",
    prices: [{ minutes: 120, price: 9090 }],
  },
  {
    id: "harmony",
    title: "СПА «Секрет гармонии»",
    note: "Аромапилинг, масляный массаж всего тела, программа для спины и уход за лицом.",
    group: "spa",
    tags: ["her", "him", "spa"],
    photo: "spa",
    prices: [{ minutes: 150, price: 10390 }],
  },
  {
    id: "spa-day",
    title: "СПА «День СПА»",
    note: "Самая долгая программа сети: три с половиной часа в салоне.",
    group: "spa",
    tags: ["her", "him", "spa"],
    photo: "spa",
    prices: [{ minutes: 210, price: 17790 }],
  },
  {
    id: "two-thai",
    title: "Тайский массаж для двоих",
    note: "Традиционный тайский одновременно для двоих, в одной комнате.",
    group: "two",
    tags: ["two"],
    photo: "two",
    prices: long(9780, 13580, 17380),
    pajamas: true,
  },
  {
    id: "two-oil",
    title: "Масляный массаж для двоих",
    note: "Одновременный масляный массаж для пары, масла на выбор.",
    group: "two",
    tags: ["two"],
    photo: "two",
    prices: long(9780, 13580, 17380),
  },
  {
    id: "two-awake",
    title: "СПА «Пробуждение» для двоих",
    note: "Масляный массаж и уход за кожей. Перед ним салон советует кедровую бочку.",
    group: "two",
    tags: ["two", "spa"],
    photo: "two",
    prices: [{ minutes: 90, price: 15180 }],
  },
  {
    id: "two-tender",
    title: "СПА «Нежность прикосновений» для двоих",
    note: "Пилинг, питательная маска и массаж с ароматическим маслом для обоих.",
    group: "two",
    tags: ["two", "spa"],
    photo: "two",
    prices: [{ minutes: 120, price: 18180 }],
  },
  {
    id: "head",
    title: "Массаж головы, ушей, лица",
    note: "Полчаса, чтобы снять утомление. Делается в пижаме.",
    group: "local",
    tags: ["her", "him"],
    photo: "local",
    prices: half(3390),
    pajamas: true,
  },
  {
    id: "neck-balm",
    title: "Шейно-воротниковая зона с бальзамом",
    note: "Плечи, руки и верх спины. Помогает при напряжении и головной боли.",
    group: "local",
    tags: ["her", "him"],
    photo: "oil",
    prices: half(3390, 4890),
    pajamas: true,
  },
  {
    id: "neck-oil",
    title: "Ойл-массаж шейно-воротниковой зоны",
    note: "Масляный ритуал для тех, кто много часов сидит за компьютером.",
    group: "local",
    tags: [],
    photo: "oil",
    prices: half(3390, 4890),
  },
  {
    id: "back-balm",
    title: "Массаж спины с бальзамом",
    note: "Разогревает и разминает мышцы от затылка до поясницы.",
    group: "local",
    tags: [],
    photo: "oil",
    prices: half(3390, 4890),
  },
  {
    id: "back-oil",
    title: "Ойл-массаж спины",
    note: "Снимает мышечное напряжение и усталость после нагрузок.",
    group: "local",
    tags: [],
    photo: "oil",
    prices: half(3390, 4890),
  },
  {
    id: "face",
    title: "Массаж лица",
    note: "Спокойные полчаса, один из самых расслабляющих массажей.",
    group: "local",
    tags: ["her", "him"],
    photo: "local",
    prices: half(3390),
  },
  {
    id: "lifting",
    title: "Лифтинг-массаж лица",
    note: "Подтягивает овал лица, мимические морщины становятся мягче.",
    group: "local",
    tags: ["her", "him"],
    photo: "local",
    prices: half(4490),
  },
  {
    id: "foot",
    title: "Фут-массаж",
    note: "Быстро приводит в порядок уставшие ноги.",
    group: "local",
    tags: ["her", "him"],
    photo: "local",
    prices: half(3390, 4890),
  },
  {
    id: "anticellulite",
    title: "Антицеллюлитный массаж",
    note: "Косметика работает в глубоких слоях кожи, уходят отёки.",
    group: "shape",
    tags: [],
    photo: "oil",
    prices: [
      { minutes: 60, price: 5690 },
      { minutes: 90, price: 7190 },
    ],
  },
  {
    id: "lymph",
    title: "Лимфодренажный оил-массаж",
    note: "Убирает отёчность, после первой процедуры в теле лёгкость.",
    group: "shape",
    tags: ["her"],
    photo: "oil",
    prices: [
      { minutes: 60, price: 5690 },
      { minutes: 90, price: 7190 },
    ],
  },
  {
    id: "barrel",
    title: "Кедровая бочка",
    note: "Прогрев в кедровой мини-сауне. Только вместе с массажем.",
    group: "spa",
    tags: ["spa"],
    photo: "barrel",
    prices: [{ minutes: 15, price: 1590 }],
    addon: true,
  },
];

export const serviceFilters: { id: "all" | ServiceTag; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "her", label: "Для неё" },
  { id: "him", label: "Для него" },
  { id: "two", label: "Для двоих" },
  { id: "spa", label: "СПА" },
];

/** 4 ритуала для sticky-stack: карточка + id опции записи (программа-длительность) */
export const rituals = [
  {
    id: "thai",
    index: "I",
    title: "Традиционный тайский",
    text: "Мастер разминает мышцы и растягивает тело. Масла нет, вы в пижаме. Силу нажима выбираете сами.",
    serviceId: "thai",
    photo: "thai",
  },
  {
    id: "oil",
    index: "II",
    title: "Тайский масляный",
    text: "Масло выбираете перед сеансом. Глубокое расслабление мышц и уход за кожей всего тела, без спешки и разговоров.",
    serviceId: "oil",
    photo: "oil",
  },
  {
    id: "spa",
    index: "III",
    title: "СПА-программы",
    text: "Пилинг, маска, массаж с маслом и уход за лицом в одной программе. Самая долгая идёт три с половиной часа.",
    serviceId: "awake",
    photo: "spa",
  },
  {
    id: "two",
    index: "IV",
    title: "Для двоих",
    text: "Два мастера в одной комнате, массаж одновременно. Для свидания или в подарок: сертификат на двоих бывает бумажным и электронным.",
    serviceId: "two-thai",
    photo: "two",
  },
] as const;

export const optionId = (serviceId: string, minutes: number) => `${serviceId}-${minutes}`;
export const minPrice = (s: Service) => Math.min(...s.prices.map((p) => p.price));
export const serviceById = (id: string) => services.find((s) => s.id === id);
