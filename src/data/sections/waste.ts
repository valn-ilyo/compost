// Section meta and question definitions for the waste section
import type { Question, SectionMeta } from "../../types/app.types";

export const wasteMeta: SectionMeta = {
  id: "waste",
  label: "Waste",
  icon: "mdi-trash-can-outline",
  description:
    "Most of what we buy is designed to be thrown away. How you sort, reduce, and redirect that waste determines how much of it actually avoids the landfill.",
  maxRaw: 35,
  scaledMax: 35,
};

export const wasteQuestions: Question[] = [
  {
    id: "plastic_bottles",
    text: "How many single-use plastic bottles (water, soft drinks) do you buy in a typical week?",
    whyItMatters:
      "Plastic bottles are among the most littered items on the planet. Globally, over 500 billion are sold every year. A reusable bottle eliminates hundreds of single-use items per person annually.",
    options: [
      { label: "Zero. I always carry a reusable bottle", points: 5 },
      { label: "1–2 occasionally", points: 4 },
      { label: "3–4 bottles per week", points: 3 },
      { label: "5–6 bottles per week", points: 2 },
      { label: "7 or more per week", points: 1 },
    ],
  },
  {
    id: "waste_segregation",
    text: "Do you separate wet waste, dry waste, and hazardous waste before disposal?",
    whyItMatters:
      "Source segregation is the single most important factor in whether waste is recycled or composted. When everything goes into one bin, recyclables and compostables get contaminated and end up landfilled. Only a fraction of plastic waste globally is ever recycled.",
    options: [
      { label: "Always. All three categories", points: 5 },
      { label: "Usually. Wet and dry at minimum", points: 4 },
      { label: "Sometimes", points: 3 },
      { label: "Rarely", points: 2 },
      { label: "Never. Everything in one bin", points: 1 },
    ],
  },
  {
    id: "disposable_cutlery",
    text: "How often do you use disposable cups, plates, or plastic cutlery?",
    whyItMatters:
      "Disposable plastic cutlery and plates have use-lives of minutes but persist in the environment for centuries. Single-use plastics are now found in every ocean, in drinking water, and in human tissue.",
    options: [
      { label: "Never. I use my own reusable items", points: 5 },
      { label: "Rarely. Only at events or unavoidable situations", points: 4 },
      { label: "Sometimes. A few times a week", points: 3 },
      { label: "Often. Almost daily", points: 2 },
      { label: "Almost every meal", points: 1 },
    ],
  },
  {
    id: "reusable_bag",
    text: "Do you carry a reusable bag when shopping or going to the market?",
    whyItMatters:
      "A cloth bag's environmental impact is lower than single-use plastic after about 130 uses. Single-use bags are among the most common items recovered from coastlines and waterways worldwide.",
    options: [
      { label: "Always. I never accept plastic bags", points: 5 },
      { label: "Usually", points: 4 },
      { label: "Sometimes", points: 3 },
      { label: "Rarely", points: 2 },
      { label: "Never", points: 1 },
    ],
  },
  {
    id: "ewaste",
    text: "What do you do with old phones, batteries, or broken electronic items?",
    whyItMatters:
      "E-waste is the fastest-growing waste stream globally, exceeding 53 million tonnes per year. It contains lead, mercury, and cadmium. When improperly discarded, these toxins leach into soil and groundwater. Authorised recyclers recover materials safely.",
    options: [
      { label: "Take to an authorised e-waste collection point", points: 5 },
      { label: "Give to an authorised scrap dealer or recycler", points: 4 },
      { label: "Store at home until I find proper disposal", points: 3 },
      { label: "Throw in regular bin", points: 2 },
      { label: "Throw outside or burn", points: 1 },
    ],
  },
  {
    id: "organic_waste",
    text: "What do you do with food scraps, vegetable peels, or leftover cooked food at home?",
    whyItMatters:
      "Organic waste makes up roughly half of household rubbish by weight. When it enters a mixed landfill it decomposes anaerobically, releasing methane, a greenhouse gas 25–28× more potent than CO₂ over 100 years. Composting keeps that carbon in the soil.",
    options: [
      { label: "Compost at home or give to animals", points: 5 },
      { label: "Separate wet waste bin for municipal composting", points: 4 },
      { label: "Put in bin but not separated from dry waste", points: 3 },
      { label: "Mix with all other waste", points: 2 },
      { label: "Throw outside or in open area", points: 1 },
    ],
  },
  {
    id: "food_waste",
    text: "How often do you throw away uneaten food or let groceries go to waste?",
    whyItMatters:
      "Roughly one-third of all food produced globally is lost or wasted. Wasted food embeds all the water, energy, and land used to produce it. Reducing waste at source is more impactful than composting it after the fact.",
    options: [
      { label: "Never. I plan meals and use everything", points: 5 },
      { label: "Rarely. Waste is very occasional", points: 4 },
      { label: "Sometimes. A few times a week I discard food", points: 3 },
      { label: "Often. I regularly throw out uneaten food", points: 2 },
      { label: "Almost always. I frequently discard food", points: 1 },
    ],
  },
];
