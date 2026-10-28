/**
 * Starter surf spots: well-known breaks so the surf map isn't empty on day one.
 * Unlike the rails, these are not Gnars installations — the list grows as the crew logs
 * waves at their local spots. Slugs share one namespace with the rail slugs (the EAS log
 * stores just the slug), so keep them distinct.
 */
export interface SurfSpotData {
  slug: string;
  title: string;
  city: string;
  country: string;
  continent: string;
  type: "Beach break" | "Point break" | "Reef break" | "River mouth";
  position: [number, number];
  description: string;
}

export const SURF_SPOTS: SurfSpotData[] = [
  {
    slug: "saquarema",
    title: "Itaúna",
    city: "Saquarema",
    country: "Brazil",
    continent: "South America",
    type: "Beach break",
    position: [-22.934, -42.484],
    description: "The Maracanã of Brazilian surf. Powerful beach break that holds big south swells and hosts the CT.",
  },
  {
    slug: "arpoador",
    title: "Arpoador",
    city: "Rio de Janeiro",
    country: "Brazil",
    continent: "South America",
    type: "Beach break",
    position: [-22.989, -43.192],
    description: "Where surfing in Rio started. A sand-bottom peak in front of the rock, a short walk from the OG Noggles Rail.",
  },
  {
    slug: "joaquina",
    title: "Joaquina",
    city: "Florianópolis",
    country: "Brazil",
    continent: "South America",
    type: "Beach break",
    position: [-27.629, -48.449],
    description: "Floripa's classic contest beach: consistent peaks, dunes behind, crowds on every swell.",
  },
  {
    slug: "itacare",
    title: "Prainha",
    city: "Itacaré",
    country: "Brazil",
    continent: "South America",
    type: "Beach break",
    position: [-14.296, -38.997],
    description: "Jungle-fringed cove in Bahia, reached by a trail. Warm water and fun peaks all year.",
  },
  {
    slug: "pipeline",
    title: "Banzai Pipeline",
    city: "North Shore, Oʻahu",
    country: "USA",
    continent: "North America",
    type: "Reef break",
    position: [21.665, -158.053],
    description: "The most famous barrel in the world, breaking over a shallow lava reef.",
  },
  {
    slug: "malibu",
    title: "Surfrider Beach",
    city: "Malibu",
    country: "USA",
    continent: "North America",
    type: "Point break",
    position: [34.036, -118.678],
    description: "Long, peeling right-hand point. Birthplace of modern longboarding.",
  },
  {
    slug: "puerto-escondido",
    title: "Zicatela",
    city: "Puerto Escondido",
    country: "Mexico",
    continent: "North America",
    type: "Beach break",
    position: [15.853, -97.056],
    description: "The Mexican Pipeline: heavy, hollow beach-break barrels.",
  },
  {
    slug: "nazare",
    title: "Praia do Norte",
    city: "Nazaré",
    country: "Portugal",
    continent: "Europe",
    type: "Beach break",
    position: [39.605, -9.085],
    description: "A submarine canyon focuses the swell into the biggest waves ever ridden.",
  },
  {
    slug: "ericeira",
    title: "Ribeira d'Ilhas",
    city: "Ericeira",
    country: "Portugal",
    continent: "Europe",
    type: "Reef break",
    position: [38.988, -9.42],
    description: "Long right over a rock slab in Europe's only World Surfing Reserve.",
  },
  {
    slug: "hossegor",
    title: "La Gravière",
    city: "Hossegor",
    country: "France",
    continent: "Europe",
    type: "Beach break",
    position: [43.675, -1.443],
    description: "Thick, fast beach-break barrels on the Landes coast.",
  },
  {
    slug: "jeffreys-bay",
    title: "Supertubes",
    city: "Jeffreys Bay",
    country: "South Africa",
    continent: "Africa",
    type: "Point break",
    position: [-34.031, 24.931],
    description: "One of the longest and most perfect right-hand points on the planet.",
  },
  {
    slug: "uluwatu",
    title: "Uluwatu",
    city: "Bali",
    country: "Indonesia",
    continent: "Asia",
    type: "Reef break",
    position: [-8.815, 115.088],
    description: "Lefts under the temple cliffs, paddled out through a cave.",
  },
  {
    slug: "bells-beach",
    title: "Bells Beach",
    city: "Torquay",
    country: "Australia",
    continent: "Oceania",
    type: "Point break",
    position: [-38.372, 144.281],
    description: "Home of the world's longest-running surf contest. Big, open-faced rights for carving.",
  },
  {
    slug: "teahupoo",
    title: "Teahupoʻo",
    city: "Tahiti",
    country: "French Polynesia",
    continent: "Oceania",
    type: "Reef break",
    position: [-17.847, -149.267],
    description: "A thick, terrifying left that breaks below sea level over a live coral reef.",
  },
];
