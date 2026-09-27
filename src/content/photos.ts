import type { StaticImageData } from "next/image";

import certBox from "@/assets/photos/cert-box.jpg";
import certTray from "@/assets/photos/cert-tray.jpg";
import coupleMasters from "@/assets/photos/couple-masters.jpg";
import headMassage from "@/assets/photos/head-massage.jpg";
import hero from "@/assets/photos/hero.jpg";
import ritualOil from "@/assets/photos/ritual-oil.jpg";
import ritualSpa from "@/assets/photos/ritual-spa.jpg";
import ritualThai from "@/assets/photos/ritual-thai.jpg";
import ritualTwo from "@/assets/photos/ritual-two.jpg";
import roomBath from "@/assets/photos/room-bath.jpg";
import roomElephants from "@/assets/photos/room-elephants.jpg";
import teaDetail from "@/assets/photos/tea-detail.jpg";
import team from "@/assets/photos/team.jpg";
import type { ServicePhoto } from "@/content/services";

/* Фото сети: профессиональная съёмка с карточек салонов на Яндекс Картах и royalthai.ru (см. PHOTOS.md) */

export type Photo = { src: StaticImageData; alt: string };

export const photos = {
  hero: { src: hero, alt: "Чайник и пиалы на подносе, орхидея и золотые подушки в чайной зоне салона" },
  ritualThai: { src: ritualThai, alt: "Мастер в красной форме делает гостье растяжку тайского массажа на мате" },
  ritualOil: { src: ritualOil, alt: "Руки двух мастеров на спине гостьи во время масляного массажа" },
  ritualSpa: { src: ritualSpa, alt: "Мастер наносит скраб на спину гостьи, та улыбается с закрытыми глазами" },
  ritualTwo: { src: ritualTwo, alt: "Два мастера делают массаж паре на соседних кушетках с красными покрывалами" },
  headMassage: { src: headMassage, alt: "Мастер массирует голову гостю в тёплом свете бра" },
  roomBath: { src: roomBath, alt: "Комната с ванной, кушеткой под золотым покрывалом и свечами на столике" },
  roomElephants: { src: roomElephants, alt: "Комната для двоих с гобеленом со слонами и двумя халатами" },
  teaDetail: { src: teaDetail, alt: "Деревянная лягушка, керамические пиалы и чайник на столике" },
  coupleMasters: { src: coupleMasters, alt: "Два мастера делают массаж плеч паре, которая сидит на мате" },
  certBox: { src: certBox, alt: "Подарочный сертификат ROYAL THAI в открытой коробке в руках" },
  certTray: { src: certTray, alt: "Подарочный сертификат на резном подносе с орхидеями" },
  team: { src: team, alt: "Мастера сети в национальной одежде, общее фото в салоне" },
} satisfies Record<string, Photo>;

export const servicePhotos: Record<ServicePhoto, Photo> = {
  thai: photos.ritualThai,
  oil: photos.ritualOil,
  spa: photos.ritualSpa,
  two: photos.ritualTwo,
  local: photos.headMassage,
  stone: photos.ritualOil,
  barrel: photos.roomBath,
};
