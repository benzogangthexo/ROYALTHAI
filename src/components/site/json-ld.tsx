import { branches, routeHref } from "@/content/branches";
import { services } from "@/content/services";
import { site } from "@/content/site";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/** JSON-LD: сеть (Organization) + салоны с адресом (DaySpa: адрес, телефон, часы, рейтинг Яндекса) */
export function JsonLd() {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3101").replace(/\/$/, "");
  const prices = services.flatMap((s) => s.prices.map((p) => p.price));
  const org = {
    "@type": "Organization",
    "@id": `${base}/#org`,
    name: site.name,
    description: `${site.legalTagline} в Санкт-Петербурге`,
    url: site.officialSite,
    telephone: "+78122421313",
    email: site.email,
    foundingDate: String(site.founded),
    sameAs: site.socials.map((s) => s.href),
  };
  const salons = branches
    .filter((b) => b.address)
    .map((b) => ({
      "@type": "DaySpa",
      "@id": `${base}/#salon-${b.id}`,
      name: `${site.name} ${b.name}`,
      parentOrganization: { "@id": `${base}/#org` },
      telephone: "+78122421313",
      priceRange: `${Math.min(...prices)}-${Math.max(...prices)} RUB`,
      currenciesAccepted: "RUB",
      address: {
        "@type": "PostalAddress",
        streetAddress: b.place ? `${b.address}, ${b.place}` : b.address,
        addressLocality: "Санкт-Петербург",
        addressCountry: "RU",
      },
      ...(b.coords ? { geo: { "@type": "GeoCoordinates", latitude: b.coords[1], longitude: b.coords[0] } } : {}),
      hasMap: routeHref(b),
      openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: DAYS, opens: b.open, closes: b.close }],
      ...(b.rating
        ? { aggregateRating: { "@type": "AggregateRating", ratingValue: b.rating.value, reviewCount: b.rating.reviews, bestRating: 5 } }
        : {}),
    }));
  const data = { "@context": "https://schema.org", "@graph": [org, ...salons] };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />
  );
}
