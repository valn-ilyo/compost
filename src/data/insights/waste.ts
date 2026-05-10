import type { QuestionInsight } from "@/types/app";

export const WASTE_INSIGHTS: QuestionInsight[] = [
  // plastic_bottles
  {
    sectionId: "waste",
    questionId: "plastic_bottles",
    score: 5,
    icon: "mdi-bottle-soda",
    text: "Zero single-use bottles per week means no plastic waste from drinking water. The reusable bottle habit is complete and consistent.",
  },
  {
    sectionId: "waste",
    questionId: "plastic_bottles",
    score: 4,
    icon: "mdi-bottle-soda",
    text: "One to two occasional bottles means the habit is strong but not complete. The gap is forgetting your bottle: keep it next to your keys so it leaves with you automatically.",
  },
  {
    sectionId: "waste",
    questionId: "plastic_bottles",
    score: 3,
    icon: "mdi-bottle-soda",
    text: "Three to four bottles per week is a frequent pattern. Fill a reusable bottle and put it in your bag every morning before anything else. Three bottles per week is over 150 pieces of plastic per year.",
  },
  {
    sectionId: "waste",
    questionId: "plastic_bottles",
    score: 2,
    icon: "mdi-bottle-soda",
    text: "Five to six bottles per week means single-use bottles are a daily default. Start carrying a reusable bottle tomorrow. Aim to replace three of your usual five to six this week.",
  },
  {
    sectionId: "waste",
    questionId: "plastic_bottles",
    score: 1,
    icon: "mdi-bottle-soda",
    text: "Seven or more bottles per week is over 365 pieces of plastic per year from one person. Get a reusable bottle, any bottle you own, and fill it from the tap today.",
  },

  // waste_segregation
  {
    sectionId: "waste",
    questionId: "waste_segregation",
    score: 5,
    icon: "mdi-trash-can",
    text: "Consistently separating all three waste categories, wet, dry, and hazardous, means your waste is correctly routed for recycling, composting, and safe disposal.",
  },
  {
    sectionId: "waste",
    questionId: "waste_segregation",
    score: 4,
    icon: "mdi-trash-can",
    text: "Separating wet and dry is the essential step. The gap is hazardous: set up a small clearly labelled container for batteries, medicines, and chemical packaging next to your other bins.",
  },
  {
    sectionId: "waste",
    questionId: "waste_segregation",
    score: 3,
    icon: "mdi-trash-can",
    text: "Sometimes separating means the bins exist but the habit is inconsistent. Every time you throw something away this week, pause for two seconds: wet, dry, or hazardous, then place.",
  },
  {
    sectionId: "waste",
    questionId: "waste_segregation",
    score: 2,
    icon: "mdi-trash-can",
    text: "Rarely separating means most waste goes to landfill regardless of its recyclability. Get two containers and label them WET and DRY today. That physical setup is the prerequisite for everything else.",
  },
  {
    sectionId: "waste",
    questionId: "waste_segregation",
    score: 1,
    icon: "mdi-trash-can",
    text: "Everything in one bin means recyclable and compostable material is sent to landfill. Put the next food scrap or vegetable peel in a separate container. That one separation is the beginning.",
  },

  // disposable_cutlery
  {
    sectionId: "waste",
    questionId: "disposable_cutlery",
    score: 5,
    icon: "mdi-silverware",
    text: "Never using disposables means no single-use items enter your waste stream from meals or drinks. One reusable set used every day prevents hundreds of disposable items per year.",
  },
  {
    sectionId: "waste",
    questionId: "disposable_cutlery",
    score: 4,
    icon: "mdi-silverware",
    text: "Rarely using disposables is close to complete. The gap is unavoidable situations: carry a small foldable cup and one spoon so you always have your own, even at events.",
  },
  {
    sectionId: "waste",
    questionId: "disposable_cutlery",
    score: 3,
    icon: "mdi-silverware",
    text: "A few disposables per week means the reusable set isn't yet in your bag consistently. Add a cup and cutlery to your bag every morning before leaving. Make packing them as automatic as locking the door.",
  },
  {
    sectionId: "waste",
    questionId: "disposable_cutlery",
    score: 2,
    icon: "mdi-silverware",
    text: "Almost daily disposable use means reusables are not the default. Start with one swap per day this week: use your own cup or plate for one meal. By the end of the week it becomes the natural reach.",
  },
  {
    sectionId: "waste",
    questionId: "disposable_cutlery",
    score: 1,
    icon: "mdi-silverware",
    text: "Disposables at almost every meal means more than 1,000 single-use items per year from one person. Use one thing you already own, whether a mug, a plate, or a spoon, at your next meal. Wash it. Repeat tomorrow.",
  },

  // reusable_bag
  {
    sectionId: "waste",
    questionId: "reusable_bag",
    score: 5,
    icon: "mdi-bag-personal-outline",
    text: "Always carrying a reusable bag and never accepting plastic means no single-use bags enter your waste stream from shopping.",
  },
  {
    sectionId: "waste",
    questionId: "reusable_bag",
    score: 4,
    icon: "mdi-bag-personal-outline",
    text: "Usually carrying a reusable bag is close to complete. The gap is the occasions you forget. Keep a foldable bag permanently inside your everyday bag so it is always there.",
  },
  {
    sectionId: "waste",
    questionId: "reusable_bag",
    score: 3,
    icon: "mdi-bag-personal-outline",
    text: "Sometimes carrying a bag means the bag isn't yet part of the leaving routine. Keep it next to your keys: before picking one up, pick up the other. That association is the habit.",
  },
  {
    sectionId: "waste",
    questionId: "reusable_bag",
    score: 2,
    icon: "mdi-bag-personal-outline",
    text: "Rarely carrying a bag means plastic bags are the regular default. Place a foldable bag on top of wherever you keep your keys or wallet. When you pick one up, the bag comes with it.",
  },
  {
    sectionId: "waste",
    questionId: "reusable_bag",
    score: 1,
    icon: "mdi-bag-personal-outline",
    text: "Never carrying a reusable bag means dozens of plastic bags per month. Take any bag you own, a backpack or a tote, on your next market trip and refuse the plastic bag.",
  },

  // ewaste
  {
    sectionId: "waste",
    questionId: "ewaste",
    score: 5,
    icon: "mdi-recycle",
    text: "Taking electronics to authorised collection points prevents lead, mercury, and cadmium from reaching landfill soil and groundwater. That outcome depends on the drop-off actually happening.",
  },
  {
    sectionId: "waste",
    questionId: "ewaste",
    score: 4,
    icon: "mdi-recycle",
    text: "Using an authorised scrap dealer or recycler is a responsible path. The distinction from score 5 is authorisation: confirm that your dealer is certified to handle electronics before the next drop-off.",
  },
  {
    sectionId: "waste",
    questionId: "ewaste",
    score: 3,
    icon: "mdi-recycle",
    text: "Storing at home until you find proper disposal is responsible in intent. The gap is acting on it. Find your nearest e-waste facility now and save the address: that removes the main reason for delay.",
  },
  {
    sectionId: "waste",
    questionId: "ewaste",
    score: 2,
    icon: "mdi-recycle",
    text: "Putting electronics in the regular bin sends toxic materials to landfill. Find your nearest e-waste collection point this week and save the location. Use it for your next discarded item.",
  },
  {
    sectionId: "waste",
    questionId: "ewaste",
    score: 1,
    icon: "mdi-recycle",
    text: "Burning or discarding electronics outdoors releases toxic chemicals directly into the air and soil. Find a safe collection point in your area, collection is usually free, and use it immediately.",
  },

  // organic_waste
  {
    sectionId: "waste",
    questionId: "organic_waste",
    score: 5,
    icon: "mdi-compost",
    text: "Composting at home or feeding scraps to animals closes the nutrient loop and keeps organic matter out of landfill where it generates methane.",
  },
  {
    sectionId: "waste",
    questionId: "organic_waste",
    score: 4,
    icon: "mdi-compost",
    text: "Separating wet waste for municipal composting is correct practice. Keep the wet bin within arm's reach of the cooking area so scraps go directly in during preparation, not after.",
  },
  {
    sectionId: "waste",
    questionId: "organic_waste",
    score: 3,
    icon: "mdi-compost",
    text: "Putting food waste in the bin without separation means it contaminates dry waste and prevents composting. Place a dedicated container for scraps next to your cooking area today, before your next meal.",
  },
  {
    sectionId: "waste",
    questionId: "organic_waste",
    score: 2,
    icon: "mdi-compost",
    text: "Mixing food with all other waste means compostable material cannot be processed correctly. One separate container for food scraps only: start with that before anything else.",
  },
  {
    sectionId: "waste",
    questionId: "organic_waste",
    score: 1,
    icon: "mdi-compost",
    text: "Throwing food outside or in open areas creates odour, attracts pests, and still generates methane. Use any covered container inside your home for food waste starting today.",
  },

  // food_waste
  {
    sectionId: "waste",
    questionId: "food_waste",
    score: 5,
    icon: "mdi-food-off",
    text: "Planning meals and using everything you buy means food waste from your household is near zero. Every item purchased is consumed.",
  },
  {
    sectionId: "waste",
    questionId: "food_waste",
    score: 4,
    icon: "mdi-food-off",
    text: "Very occasional waste is a strong position. The gap is the items that slip through. Check the fridge before every shopping trip and build the list around what is already there.",
  },
  {
    sectionId: "waste",
    questionId: "food_waste",
    score: 3,
    icon: "mdi-food-off",
    text: "Discarding food a few times a week means the shopping and planning habit isn't yet closing the gap. Spend two minutes checking the fridge before every grocery trip and plan three meals around what you find.",
  },
  {
    sectionId: "waste",
    questionId: "food_waste",
    score: 2,
    icon: "mdi-food-off",
    text: "Regularly throwing out food means more food is bought than is used. Buy less per trip and shop more frequently. Write three meal ideas before the next trip and buy only what those meals need.",
  },
  {
    sectionId: "waste",
    questionId: "food_waste",
    score: 1,
    icon: "mdi-food-off",
    text: "Frequently discarding food means the full production cost of a significant portion of what you buy is wasted. Write three meals you will eat this week and list only those ingredients before your next trip to buy food.",
  },
];
