// Citation registry for the Methodology docs section.
// Single source of truth for all question-level references.
// Consumed by MethodologySectionQuestions.vue (getRefNums) and
// MethodologySectionReferences.vue (globalRefs).
import { SECTIONS, questionRegistry } from "@/data/registry";

export interface MethodologyRef {
  label: string;
  url?: string;
}

// questionId → ordered list of { label, url? } references.
// label is the dedup key — labels must be exactly consistent across entries.
const QUESTION_SOURCES: Record<string, MethodologyRef[]> = {
  // ── Transport ──────────────────────────────────────────────────────────────
  commute_mode: [
    {
      label: "IPCC AR6, Working Group III, Ch. 10 (Transport), 2022",
      url: "https://doi.org/10.1017/9781009157926.012",
    },
    {
      label: "Ritchie, H. (2023). Travel Carbon Footprint. Our World in Data",
      url: "https://ourworldindata.org/travel-carbon-footprint",
    },
  ],
  commute_distance: [
    {
      label: "IPCC AR6, Working Group III, Ch. 10 (Transport), 2022",
      url: "https://doi.org/10.1017/9781009157926.012",
    },
    // FIX: was vol. 87 / 102185 / doi trd.2020.102185 — all wrong; corrected to vol. 93 / 102764 / doi trd.2021.102764
    {
      label: "Brand, C. et al. (2021). Transportation Research Part D, 93, 102764",
      url: "https://doi.org/10.1016/j.trd.2021.102764",
    },
  ],
  commute_frequency: [
    {
      label: "IPCC AR6, Working Group III, Ch. 10 (Transport), 2022",
      url: "https://doi.org/10.1017/9781009157926.012",
    },
  ],
  short_trips: [
    {
      label: "U.S. Department of Energy. Fuel Economy in Cold Weather",
      url: "https://www.fueleconomy.gov/feg/coldweather.shtml",
    },
    {
      label: "Creutzig, F. et al. (2015). Science, 350(6263), 911–912",
      url: "https://doi.org/10.1126/science.aac8033",
    },
  ],
  discretionary_mode: [
    // FIX: was vol. 87 / 102185 / doi trd.2020.102185 — all wrong; corrected to vol. 93 / 102764 / doi trd.2021.102764
    {
      label: "Brand, C. et al. (2021). Transportation Research Part D, 93, 102764",
      url: "https://doi.org/10.1016/j.trd.2021.102764",
    },
    {
      label: "IPCC AR6, Working Group III, Ch. 10 (Transport), 2022",
      url: "https://doi.org/10.1017/9781009157926.012",
    },
  ],

  // ── Food ──────────────────────────────────────────────────────────────────
  diet_type: [
    {
      label: "Poore, J. & Nemecek, T. (2018). Science, 360(6392), 987–992",
      url: "https://doi.org/10.1126/science.aaq0216",
    },
  ],
  plate_waste: [
    // FIX: FAO moved from /3/ to /4/ path; updated to canonical redirect target
    {
      label: "FAO (2011). Global Food Losses and Food Waste. Food and Agriculture Organization",
      url: "https://www.fao.org/4/mb060e/mb060e00.htm",
    },
    { label: "FAO (2013). Food Wastage Footprint: Impacts on Natural Resources. FAO, Rome" },
  ],
  leftovers: [
    // FIX: FAO moved from /3/ to /4/ path; updated to canonical redirect target
    {
      label: "FAO (2011). Global Food Losses and Food Waste. Food and Agriculture Organization",
      url: "https://www.fao.org/4/mb060e/mb060e00.htm",
    },
  ],
  packaged_food: [
    {
      label: "Poore, J. & Nemecek, T. (2018). Science, 360(6392), 987–992",
      url: "https://doi.org/10.1126/science.aaq0216",
    },
  ],
  local_food: [
    {
      label: "Poore, J. & Nemecek, T. (2018). Science, 360(6392), 987–992",
      url: "https://doi.org/10.1126/science.aaq0216",
    },
  ],

  // ── Energy ────────────────────────────────────────────────────────────────
  lights_off: [
    {
      label: "IPCC AR6, Working Group III, Ch. 9 (Buildings), 2022",
      url: "https://doi.org/10.1017/9781009157926.011",
    },
    { label: "Bureau of Energy Efficiency (BEE) India", url: "https://beeindia.gov.in" },
  ],
  standby_power: [
    { label: "IEA. Standby Power. International Energy Agency", url: "https://www.iea.org" },
    {
      label: "Lawrence Berkeley National Laboratory. Standby Power Summary Table",
      url: "https://standby.lbl.gov",
    },
  ],
  natural_light: [
    {
      label: "IPCC AR6, Working Group III, Ch. 9 (Buildings), 2022",
      url: "https://doi.org/10.1017/9781009157926.011",
    },
    { label: "Bureau of Energy Efficiency (BEE) India", url: "https://beeindia.gov.in" },
  ],
  shared_space_energy: [
    {
      label: "IPCC AR6, Working Group III, Ch. 9 (Buildings), 2022",
      url: "https://doi.org/10.1017/9781009157926.011",
    },
    { label: "Bureau of Energy Efficiency (BEE) India", url: "https://beeindia.gov.in" },
  ],
  power_saving_mode: [
    {
      label: "IPCC AR6, Working Group III, Ch. 9 (Buildings), 2022",
      url: "https://doi.org/10.1017/9781009157926.011",
    },
    { label: "Bureau of Energy Efficiency (BEE) India", url: "https://beeindia.gov.in" },
  ],

  // ── Consumption ───────────────────────────────────────────────────────────
  printing_habits: [
    { label: "ecoinvent Database v3", url: "https://ecoinvent.org" },
    { label: "Two Sides & Sappi. Lifecycle assessment studies for paper products" },
  ],
  clothing_purchases: [
    { label: "WRAP (2017). Valuing Our Clothes: The Cost of UK Fashion", url: "https://wrap.ngo" },
    {
      label: "Ellen MacArthur Foundation (2017). A New Textiles Economy",
      url: "https://ellenmacarthurfoundation.org",
    },
  ],
  device_longevity: [
    {
      label: "Apple Inc. iPhone Product Environmental Reports (annual)",
      url: "https://www.apple.com/environment",
    },
  ],
  circular_economy: [
    {
      label: "Ellen MacArthur Foundation (2013). Towards a Circular Economy",
      url: "https://ellenmacarthurfoundation.org",
    },
    { label: "WRAP (2017). Valuing Our Clothes: The Cost of UK Fashion", url: "https://wrap.ngo" },
  ],

  // ── Water ─────────────────────────────────────────────────────────────────
  bathing_method: [
    {
      label:
        "Hoekstra, A.Y. et al. (2011). The Water Footprint Assessment Manual. Earthscan, London",
    },
    {
      label: "CPCB. Domestic water use benchmarks. Central Pollution Control Board, India",
      url: "https://cpcb.nic.in",
    },
  ],
  tap_behaviour: [
    { label: "WaterWise (2021). Water Efficiency in the Home", url: "https://waterwise.org.uk" },
  ],
  dishwashing_method: [
    { label: "WaterWise (2021). Water Efficiency in the Home", url: "https://waterwise.org.uk" },
    {
      label:
        "Hoekstra, A.Y. et al. (2011). The Water Footprint Assessment Manual. Earthscan, London",
    },
  ],
  laundry_method: [
    { label: "Bureau of Energy Efficiency (BEE) India", url: "https://beeindia.gov.in" },
  ],
  drinking_water_source: [
    {
      label: "Gleick, P.H. & Cooley, H. (2009). Environmental Research Letters, 4(1), 014009",
      url: "https://doi.org/10.1088/1748-9326/4/1/014009",
    },
    { label: "Pacific Institute (2007). Bottled Water and Energy: A Fact Sheet" },
    { label: "BIS IS 10500:2012. Drinking Water — Specification. Bureau of Indian Standards" },
  ],
  leak_reporting: [
    {
      label:
        "Central Ground Water Board (2020). Master Plan for Artificial Recharge to Ground Water in India",
      url: "https://cgwb.gov.in",
    },
    { label: "WaterWise (2021). Water Efficiency in the Home", url: "https://waterwise.org.uk" },
  ],

  // ── Waste ─────────────────────────────────────────────────────────────────
  plastic_bottles: [
    { label: "MoEFCC. Plastic Waste Management (Amendment) Rules, 2021" },
    // FIX: first author was listed as "Kumar, R." — actual lead author is Hossain, R.
    {
      label: "Hossain, R. et al. (2022). Sustainability, 14(8), 4425",
      url: "https://doi.org/10.3390/su14084425",
    },
  ],
  waste_segregation: [
    { label: "Solid Waste Management Rules, 2016. MoEFCC, India" },
    {
      label:
        "Ahluwalia, I.J. & Kapur, A. (2022). Solid Waste Management. ICRIER Environment, Energy and Economics Research",
    },
  ],
  disposable_cutlery: [
    { label: "MoEFCC. Plastic Waste Management (Amendment) Rules, 2021" },
    {
      label: "CPCB (2022). Guidance on banned single-use plastic items",
      url: "https://cpcb.nic.in",
    },
  ],
  reusable_bag: [
    {
      label:
        "Danish Environmental Protection Agency (2018). LCA of Grocery Carrier Bags. Environmental Project No. 1985",
    },
    { label: "MoEFCC. Plastic Waste Management (Amendment) Rules, 2021" },
  ],
  ewaste: [
    { label: "E-Waste (Management) Rules, 2016 (amended 2022). MoEFCC, India" },
    { label: "Global E-Waste Monitor 2024. UNITAR/ITU" },
  ],
  organic_waste: [
    { label: "IPCC AR6, Working Group I, Ch. 7 (The Earth's Energy Budget), 2021" },
    { label: "Solid Waste Management Rules, 2016. MoEFCC, India" },
  ],
  food_waste: [
    { label: "UNEP Food Waste Index Report, 2021. United Nations Environment Programme" },
    { label: "FAO (2013). Food Wastage Footprint: Impacts on Natural Resources. FAO, Rome" },
  ],

  // ── Digital ───────────────────────────────────────────────────────────────
  streaming_habits: [
    {
      label: "Shift Project (2021). Lean ICT: Towards Digital Sobriety",
      url: "https://theshiftproject.org",
    },
    {
      label: "IEA (2022). Data Centres and Data Transmission Networks",
      url: "https://www.iea.org",
    },
  ],
  cloud_hygiene: [
    {
      label: "IEA (2022). Data Centres and Data Transmission Networks",
      url: "https://www.iea.org",
    },
    {
      label:
        "ADEME (2019). Modélisation et évaluation du poids carbone des équipements numériques en France",
    },
  ],
  email_hygiene: [
    {
      label:
        "ADEME (2019). Modélisation et évaluation du poids carbone des équipements numériques en France",
    },
    {
      label: "IEA (2022). Data Centres and Data Transmission Networks",
      url: "https://www.iea.org",
    },
  ],
  intentional_use: [
    // FIX: was misattributed to Nature Climate Change 7:660–665 with doi nclimate3382 (a fish-biology paper);
    // correct journal is Environmental Research Letters, vol. 12(7), 074024
    {
      label: "Wynes, S. & Nicholas, K.A. (2017). Environmental Research Letters, 12(7), 074024",
      url: "https://doi.org/10.1088/1748-9326/aa7541",
    },
    {
      label: "Shift Project (2021). Lean ICT: Towards Digital Sobriety",
      url: "https://theshiftproject.org",
    },
  ],
  device_repair: [
    {
      label: "Apple Inc. iPhone Product Environmental Reports (annual)",
      url: "https://www.apple.com/environment",
    },
    {
      label: "European Environment Agency (2021). Towards a circular economy for electronics",
      url: "https://eea.europa.eu",
    },
  ],
};

// Populated by iterating SECTIONS → questionRegistry in order.
// Unique refs in order of first appearance. 1-indexed for display.
export const globalRefs: MethodologyRef[] = [];
const _refIndex = new Map<string, number>();

for (const section of SECTIONS) {
  for (const question of questionRegistry[section.id] ?? []) {
    for (const ref of QUESTION_SOURCES[question.id] ?? []) {
      if (!_refIndex.has(ref.label)) {
        _refIndex.set(ref.label, globalRefs.length + 1);
        globalRefs.push(ref);
      }
    }
  }
}

// Returns 1-based ref numbers for a given question id.
// Returns [] if the question has no sources defined.
export function getRefNums(questionId: string): number[] {
  return (QUESTION_SOURCES[questionId] ?? []).map((r) => _refIndex.get(r.label)!);
}
