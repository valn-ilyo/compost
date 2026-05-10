import type { HabitTemplate } from "../types/app";

export const HABIT_TEMPLATES: HabitTemplate[] = [
  {
    id: "shared_or_active_travel",
    covers: [
      { sectionId: "transport", questionId: "commute_mode" },
      { sectionId: "transport", questionId: "commute_frequency" },
      { sectionId: "transport", questionId: "discretionary_mode" },
    ],
    sectionId: "transport",
    name: "Shared or active travel",
    icon: "mdi-map-marker-path",
    iconOutline: "mdi-map-marker-path", // no-outline
    prompt: "Did you walk, cycle, or use shared transport for every trip today?",
    when: "Every morning before leaving, and before every local trip",
    instruction:
      "Walk any trip under 2 km. Use shared transport for everything else. Reserve a private vehicle only when no alternative exists.",
  },

  {
    id: "walk_short_trips",
    covers: [{ sectionId: "transport", questionId: "short_trips" }],
    sectionId: "transport",
    name: "Walk short trips",
    icon: "mdi-walk",
    iconOutline: "mdi-walk", // no-outline
    prompt: "Did you walk every trip under 2 km today?",
    when: "Before any short local errand or visit",
    instruction:
      "Under 2 km means walk, no exceptions. At that distance walking is usually as fast as waiting for transport.",
  },

  {
    id: "one_plant_based_meal",
    covers: [{ sectionId: "food", questionId: "diet_type" }],
    sectionId: "food",
    name: "One plant-based meal",
    icon: "mdi-food-apple",
    iconOutline: "mdi-food-apple-outline",
    prompt: "Did you eat at least one fully plant-based meal today?",
    when: "At lunchtime every day",
    instruction:
      "Make lunch your plant-based meal every day. Lentils, legumes, grains, or vegetables, no meat or dairy.",
  },

  // served. Serving a right-sized portion and boxing the rest are the same motion.
  {
    id: "box_leftovers_first",
    covers: [
      { sectionId: "food", questionId: "leftovers" },
      { sectionId: "food", questionId: "plate_waste" },
    ],
    sectionId: "food",
    name: "Box leftovers first",
    icon: "mdi-fridge",
    iconOutline: "mdi-fridge-outline",
    prompt: "Did you store your leftovers immediately after cooking today?",
    when: "Every time you finish cooking a meal",
    instruction:
      "Box the leftover portion before serving your plate. Food stored immediately gets eaten. Food left in the pot rarely does.",
  },

  {
    id: "pack_a_home_snack",
    covers: [{ sectionId: "food", questionId: "packaged_food" }],
    sectionId: "food",
    name: "Pack a home snack",
    icon: "mdi-bag-personal",
    iconOutline: "mdi-bag-personal-outline",
    prompt: "Did you bring a home-prepared snack or drink instead of buying packaged food today?",
    when: "Every morning before leaving the house",
    instruction:
      "Pack a snack before you leave: fruit, home food, or a filled bottle. Hunger away from home is what drives packaged purchases.",
  },

  {
    id: "local_or_unpackaged_food",
    covers: [{ sectionId: "food", questionId: "local_food" }],
    sectionId: "food",
    name: "Local or unpackaged food",
    icon: "mdi-basket",
    iconOutline: "mdi-basket-outline",
    prompt: "Did you choose at least one local, seasonal, or unpackaged item today?",
    when: "Every time you buy food",
    instruction:
      "At every shopping trip, choose at least one item that is local, seasonal, or unpackaged. Start with the most available option near you.",
  },

  {
    id: "lights_off_on_exit",
    covers: [
      { sectionId: "energy", questionId: "lights_off" },
      { sectionId: "energy", questionId: "shared_space_energy" },
    ],
    sectionId: "energy",
    name: "Lights off on exit",
    icon: "mdi-lightbulb-off",
    iconOutline: "mdi-lightbulb-off-outline",
    prompt: "Did you switch off every fan and light each time you left any room today?",
    when: "Every time you leave any room, your own or shared",
    instruction:
      "One glance back before stepping out. If anything is running and the room will be empty, switch it off. This applies to every room regardless of whose it is.",
  },

  {
    id: "unplug_when_charged",
    covers: [{ sectionId: "energy", questionId: "standby_power" }],
    sectionId: "energy",
    name: "Unplug when charged",
    icon: "mdi-power-plug-off",
    iconOutline: "mdi-power-plug-off-outline",
    prompt: "Did you unplug your charger as soon as your device finished charging today?",
    when: "Every time your device reaches full charge",
    instruction:
      "Device full means charger out. Before sleeping, sweep the room and unplug every charger not actively charging something.",
  },

  {
    id: "daylight_first",
    covers: [{ sectionId: "energy", questionId: "natural_light" }],
    sectionId: "energy",
    name: "Daylight first",
    icon: "mdi-sun-angle",
    iconOutline: "mdi-sun-angle-outline",
    prompt: "Did you use natural daylight instead of electric lights for all daytime tasks today?",
    when: "Every morning when you sit down to work or study",
    instruction:
      "Open curtains before touching any switch. Move your work spot near a window. Turn on electric light only when daylight is genuinely insufficient.",
  },

  {
    id: "power_saving_mode_on",
    covers: [{ sectionId: "energy", questionId: "power_saving_mode" }],
    sectionId: "energy",
    name: "Power-saving mode on",
    icon: "mdi-battery-heart",
    iconOutline: "mdi-battery-heart-outline",
    prompt: "Were power-saving and auto-brightness active on all your devices today?",
    when: "Right now. Open settings once and set it permanently.",
    instruction:
      "Enable power-saving mode and auto-brightness on every device. This is a one-time action that reduces device energy draw every hour with no further effort.",
  },

  // ── WATER + WASTE — SHARED HABIT ─────────────────────────────────────────
  // Water Q5 (drinking_water_source) + Waste Q1 (plastic_bottles) → merged
  {
    id: "reusable_bottle_daily",
    covers: [
      { sectionId: "water", questionId: "drinking_water_source" },
      { sectionId: "waste", questionId: "plastic_bottles" },
    ],
    sectionId: "water",
    name: "Reusable bottle daily",
    icon: "mdi-bottle-soda",
    iconOutline: "mdi-bottle-soda-outline",
    prompt: "Did you carry a filled reusable bottle instead of buying one today?",
    when: "Every morning before leaving home",
    instruction:
      "Fill your bottle from the tap or filter before stepping out. Keep it next to your keys. A filled bottle removes the need for any single-use purchase. This habit covers both your water and waste sections.",
  },

  {
    id: "bucket_bath",
    covers: [{ sectionId: "water", questionId: "bathing_method" }],
    sectionId: "water",
    name: "Bucket bath",
    icon: "mdi-bucket",
    iconOutline: "mdi-bucket-outline",
    prompt: "Did you use a bucket for your bath today?",
    when: "Every time you prepare to bathe",
    instruction:
      "Fill your bucket before entering the bathroom. Use only what is in it. A bucket bath uses 15-20 litres. A 10-minute shower uses 60-80.",
  },

  // turning it off is the same attentiveness as noticing a dripping tap and reporting it.
  {
    id: "tap_off_while_soaping",
    covers: [
      { sectionId: "water", questionId: "tap_behaviour" },
      { sectionId: "water", questionId: "leak_reporting" },
    ],
    sectionId: "water",
    name: "Tap off while soaping",
    icon: "mdi-water-off",
    iconOutline: "mdi-water-off-outline",
    prompt: "Did you keep the tap off every time you were brushing or lathering today?",
    when: "The moment your hand touches the soap or toothbrush",
    instruction:
      "Soap or brush in hand means tap is off. Turn it on only to rinse. A running tap wastes 6 litres per idle minute.",
  },

  {
    id: "basin_for_dishes",
    covers: [{ sectionId: "water", questionId: "dishwashing_method" }],
    sectionId: "water",
    name: "Basin for dishes",
    icon: "mdi-bowl",
    iconOutline: "mdi-bowl-outline",
    prompt: "Did you wash dishes from a filled basin today?",
    when: "Before you touch any dish at the sink",
    instruction:
      "Fill the basin before starting. Wash everything in it. Use the running tap only for a final rinse. A filled basin uses 5-10 litres versus up to 30 with a running tap.",
  },

  {
    id: "full_machine_load_only",
    covers: [{ sectionId: "water", questionId: "laundry_method" }],
    sectionId: "water",
    name: "Full machine load only",
    icon: "mdi-washing-machine",
    iconOutline: "mdi-washing-machine", // no-outline
    prompt: "Did you run the washing machine only when it was full today?",
    when: "Every time you are about to start a machine wash",
    instruction:
      "Check the drum is full before pressing start. If not, close it and wait. A half-load uses the same water and electricity as a full one.",
  },
  {
    id: "one_bucket_hand_wash",
    covers: [{ sectionId: "water", questionId: "laundry_method" }],
    sectionId: "water",
    name: "One bucket hand wash",
    icon: "mdi-bucket",
    iconOutline: "mdi-bucket-outline",
    prompt: "Did you wash all your laundry in a single filled bucket today?",
    when: "Every time you hand-wash clothes",
    instruction:
      "Fill one bucket with soapy water before starting. Wash everything in it. Use a second bucket for rinsing only if needed. Don't run water continuously.",
  },

  // ── WASTE + WASTE — SHARED HABIT ─────────────────────────────────────────
  {
    id: "food_scraps_in_wet_bin",
    covers: [
      { sectionId: "waste", questionId: "waste_segregation" },
      { sectionId: "waste", questionId: "organic_waste" },
    ],
    sectionId: "waste",
    name: "Food scraps in wet bin",
    icon: "mdi-sprout",
    iconOutline: "mdi-sprout-outline",
    prompt: "Did you put all food scraps and waste into the correct bin today?",
    when: "Every time you have food scraps, peels, or anything to throw away",
    instruction:
      "Food scraps are wet waste. One container next to the cooking area covers both questions. Every peel and scrap goes there, everything else in the dry bin.",
  },

  {
    id: "own_cup_and_cutlery",
    covers: [{ sectionId: "waste", questionId: "disposable_cutlery" }],
    sectionId: "waste",
    name: "Own cup and cutlery",
    icon: "mdi-cup",
    iconOutline: "mdi-cup-outline",
    prompt: "Did you avoid all disposable cups, plates, and cutlery today?",
    when: "Every morning before leaving the house",
    instruction:
      "Pack a reusable cup and one set of cutlery in your bag before stepping out. Having your own removes the need to accept a disposable at any point.",
  },

  {
    id: "cloth_bag_every_trip",
    covers: [{ sectionId: "waste", questionId: "reusable_bag" }],
    sectionId: "waste",
    name: "Cloth bag every trip",
    icon: "mdi-shopping",
    iconOutline: "mdi-shopping-outline",
    prompt: "Did you carry a reusable bag on every trip today?",
    when: "Before leaving home for any errand or shop",
    instruction:
      "Keep a foldable bag inside your everyday bag permanently. Decline plastic bags at the counter. Having your own removes the only reason to accept one.",
  },

  {
    id: "store_ewaste_properly",
    covers: [{ sectionId: "waste", questionId: "ewaste" }],
    sectionId: "waste",
    name: "Store e-waste properly",
    icon: "mdi-battery-remove",
    iconOutline: "mdi-battery-remove-outline",
    prompt: "Did you store or drop off any electronic waste correctly today?",
    when: "The moment any device, battery, or charger stops working",
    instruction:
      "Place the item in a dedicated container, not the regular bin. Find and save your nearest authorised e-waste collection point now. That step only needs to happen once.",
  },

  {
    id: "fridge_check_before_shopping",
    covers: [{ sectionId: "waste", questionId: "food_waste" }],
    sectionId: "waste",
    name: "Fridge check before shopping",
    icon: "mdi-fridge",
    iconOutline: "mdi-fridge-outline",
    prompt: "Did you check what was already in your fridge before buying food today?",
    when: "Before every grocery shopping trip",
    instruction:
      "Open the fridge before you leave for any food shopping. List what needs to be eaten first. Build your shopping list around that.",
  },

  // ── DIGITAL + CONSUMPTION — SHARED HABIT ─────────────────────────────────
  // Digital Q5 (device_repair) + Consumption Q3 (device_longevity) → merged
  {
    id: "repair_before_replace",
    covers: [
      { sectionId: "digital", questionId: "device_repair" },
      { sectionId: "consumption", questionId: "device_longevity" },
    ],
    sectionId: "digital",
    name: "Repair before replace",
    icon: "mdi-wrench",
    iconOutline: "mdi-wrench-outline",
    prompt: "Did you attempt repair before replacing any device today?",
    when: "The moment any device develops a fault, slowdown, or battery problem",
    instruction:
      "Get a repair quote before looking at any replacement. Battery, screen, and performance issues are typically fixable for a fraction of a new device. Repair is the first option, not the last.",
  },

  {
    id: "stream_at_sd_quality",
    covers: [{ sectionId: "digital", questionId: "streaming_habits" }],
    sectionId: "digital",
    name: "Stream at SD quality",
    icon: "mdi-video",
    iconOutline: "mdi-video-outline",
    prompt: "Did you stream at SD quality and stay within your time limit today?",
    when: "Before opening any streaming app",
    instruction:
      "Set quality to SD or Auto in your app settings. On YouTube: Settings > Video Quality. On Netflix: Account > Playback Settings. SD uses roughly 20 times less data per hour than HD.",
  },

  {
    id: "monthly_digital_declutter",
    covers: [{ sectionId: "digital", questionId: "cloud_hygiene" }],
    sectionId: "digital",
    name: "Monthly digital declutter",
    icon: "mdi-cloud-remove",
    iconOutline: "mdi-cloud-remove-outline",
    prompt: "Did you delete unused files and photos this month?",
    when: "Once a month. Set a recurring calendar reminder today.",
    instruction:
      "Spend 15 minutes each month deleting blurry photos, duplicate shots, unused downloads, and old cloud backups. Set the recurring reminder now.",
  },

  {
    id: "weekly_inbox_clear",
    covers: [{ sectionId: "digital", questionId: "email_hygiene" }],
    sectionId: "digital",
    name: "Weekly inbox clear",
    icon: "mdi-email-remove",
    iconOutline: "mdi-email-remove-outline",
    prompt: "Did you delete unnecessary emails and unsubscribe from at least one list this week?",
    when: "Once a week, same day and time each week",
    instruction:
      "Spend five minutes: delete promotional and spam emails, and unsubscribe from any list you did not open. Unsubscribing stops the email being generated again.",
  },

  {
    id: "daily_screen_time_limit",
    covers: [{ sectionId: "digital", questionId: "intentional_use" }],
    sectionId: "digital",
    name: "Daily screen time limit",
    icon: "mdi-timer",
    iconOutline: "mdi-timer-outline",
    prompt: "Did you stay within your screen time limit for social media today?",
    when: "Right now. Set it once in your phone settings, then check in daily.",
    instruction:
      "Open Screen Time on iOS or Digital Wellbeing on Android and set a daily limit of 30 minutes for social media apps. Configure it once. After that the daily check-in is the habit.",
  },

  {
    id: "digital_before_print",
    covers: [{ sectionId: "consumption", questionId: "printing_habits" }],
    sectionId: "consumption",
    name: "Digital before print",
    icon: "mdi-printer-off",
    iconOutline: "mdi-printer-off-outline",
    prompt: "Did you avoid all unnecessary printing and handle documents digitally today?",
    when: "Every time you are about to print anything",
    instruction:
      "Open the file on screen first. Read or annotate it digitally. Print only if digital is genuinely unusable for that specific task. Screen is the default, not paper.",
  },

  {
    id: "shopping_list_first",
    covers: [{ sectionId: "consumption", questionId: "clothing_purchases" }],
    sectionId: "consumption",
    name: "Shopping list first",
    icon: "mdi-tshirt-crew",
    iconOutline: "mdi-tshirt-crew-outline",
    prompt: "Did you shop only from a prepared list with no unplanned purchases today?",
    when: "The evening before any planned shopping trip",
    instruction:
      "Make your list the night before, not at the market. Write exactly what you need. At the market, buy only what is on the list.",
  },

  {
    id: "secondhand_check_first",
    covers: [{ sectionId: "consumption", questionId: "circular_economy" }],
    sectionId: "consumption",
    name: "Secondhand check first",
    icon: "mdi-recycle",
    iconOutline: "mdi-recycle", // no-outline
    prompt: "Did you check a secondhand or borrow option before any purchase today?",
    when: "Every time you identify something you need to buy",
    instruction:
      "Before buying anything new, spend five minutes checking whether it exists secondhand or can be borrowed. The habit is the check, not the outcome.",
  },
];
