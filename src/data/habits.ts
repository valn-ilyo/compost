import type { HabitTemplate } from "../types/app.types";

// Icons marked "no-outline" have no MDI outline counterpart — iconOutline === icon intentionally.
// Verified against @mdi/svg v7.4.47 metadata.

export const HABIT_TEMPLATES: HabitTemplate[] = [
  // ── TRANSPORT ─────────────────────────────────────────────────────────────

  {
    id: "commute_mode",
    icon: "mdi-map-marker-path",
    iconOutline: "mdi-map-marker-path", // no-outline
    sectionId: "transport",
    name: "Confirm your commute mode before stepping out",
    prompt: "Did you walk, cycle, or use shared transport for your commute today?",
    when: "Every morning before you leave for your destination",
    instruction:
      "Before stepping out, confirm your mode. Walk or cycle if the distance allows. If not, take shared transport. Reserve private vehicles for when no alternative exists.",
  },
  {
    id: "commute_distance",
    icon: "mdi-map-marker-distance",
    iconOutline: "mdi-map-marker-distance", // no-outline
    sectionId: "transport",
    name: "Walk under 2 km, share over 5 km",
    prompt: "Did you use the lowest-emission mode your distance allows today?",
    when: "Every time you prepare to leave for your destination",
    instruction:
      "Under 2 km, walk. 2–5 km, cycle or take shared transport. Over 5 km, use shared transport or carpool. Distance is fixed — mode is the variable you control.",
  },
  {
    id: "commute_frequency",
    icon: "mdi-calendar-check",
    iconOutline: "mdi-calendar-check-outline",
    sectionId: "transport",
    name: "Take shared or active transport on every commute day",
    prompt: "Did you use shared or zero-emission transport on every day you commuted this week?",
    when: "Each morning you leave for your destination",
    instruction:
      "On every day you commute, confirm your mode before leaving. Shared transport or active travel on each commute day is the target — frequency reduction alone is not enough if the mode is high-emission.",
  },
  {
    id: "short_trips",
    icon: "mdi-walk",
    iconOutline: "mdi-walk", // no-outline
    sectionId: "transport",
    name: "Walk every trip under 2 km",
    prompt: "Did you walk every short local trip today instead of using a vehicle?",
    when: "Every time you are about to leave for a nearby errand or visit",
    instruction:
      "Before any trip, check the distance. If it is under 2 km, walk. No vehicle, no shared transport — walking is the correct mode at that distance and is usually as fast as waiting.",
  },
  {
    id: "discretionary_mode",
    icon: "mdi-bus-clock",
    iconOutline: "mdi-bus-clock", // no-outline
    sectionId: "transport",
    name: "Replace the first private trip each day with shared transport",
    prompt:
      "Did you choose shared transport or walking over a private vehicle for every local trip today?",
    when: "Before your first local journey of the day",
    instruction:
      "Before any local trip, check whether shared transport or walking covers it. If yes, use that. Identify the one daily trip where you most often default to a private vehicle and replace it first.",
  },

  // ── FOOD ──────────────────────────────────────────────────────────────────

  {
    id: "diet_type",
    icon: "mdi-food-apple",
    iconOutline: "mdi-food-apple-outline",
    sectionId: "food",
    name: "Have a plant-based lunch every day",
    prompt: "Did you eat at least one fully plant-based meal today?",
    when: "At lunchtime every day",
    instruction:
      "Commit to one plant-based meal daily — lunch is the easiest to control. Legumes, lentils, grains, or vegetables with no meat or dairy. One meal a day, every day.",
  },
  {
    id: "plate_waste",
    icon: "mdi-food",
    iconOutline: "mdi-food-outline",
    sectionId: "food",
    name: "Serve one spoon less at every meal",
    prompt: "Did you finish everything on your plate at every meal today?",
    when: "Every time you serve yourself food",
    instruction:
      "Take a slightly smaller first serving than you think you need. Eat it. Decide if you need more before serving again. The gap between what you serve and what you eat is where plate waste is created.",
  },
  {
    id: "leftovers",
    icon: "mdi-fridge",
    iconOutline: "mdi-fridge-outline",
    sectionId: "food",
    name: "Box the extra portion before you serve yourself",
    prompt: "Did you store your leftovers immediately after cooking today?",
    when: "Every time you finish cooking a meal",
    instruction:
      "As soon as the food is ready, box the leftover portion before serving your plate. Food stored immediately gets eaten — food left in the pot or on the counter rarely does.",
  },
  {
    id: "packaged_food",
    icon: "mdi-bag-personal",
    iconOutline: "mdi-bag-personal-outline",
    sectionId: "food",
    name: "Pack a home snack before leaving every day",
    prompt:
      "Did you bring a home-prepared snack or drink with you today instead of buying packaged food?",
    when: "Every morning as part of getting ready to leave",
    instruction:
      "Pack a snack before you leave each morning — fruit, home food, a filled bottle. Hunger away from home with nothing available is what drives packaged purchases. A packed item removes that trigger.",
  },
  {
    id: "local_food",
    icon: "mdi-basket",
    iconOutline: "mdi-basket-outline",
    sectionId: "food",
    name: "Buy one local or unpackaged item per shopping trip",
    prompt:
      "Did you choose at least one local, seasonal, or unpackaged item in your food purchases today?",
    when: "Every time you go to buy food",
    instruction:
      "At every shopping trip, buy at least one item that is local, seasonal, or unpackaged. Start with one — the item most available near you. That single choice shifts your food sourcing pattern over time.",
  },

  // ── ENERGY ────────────────────────────────────────────────────────────────

  {
    id: "lights_off",
    icon: "mdi-lightbulb-off",
    iconOutline: "mdi-lightbulb-off-outline",
    sectionId: "energy",
    name: "Switch off lights and fans when you leave",
    prompt: "Did you switch off every fan and light each time you left a room today?",
    when: "Every time you leave any room",
    instruction:
      "One glance back before stepping out. If anything is running and the room will be empty, switch it off. Start with one room — your bedroom — for one full week, then extend.",
  },
  {
    id: "standby_power",
    icon: "mdi-power-plug-off",
    iconOutline: "mdi-power-plug-off-outline",
    sectionId: "energy",
    name: "Unplug your charger the moment it's done",
    prompt: "Did you unplug your charger as soon as your device finished charging today?",
    when: "Every time your device reaches full charge",
    instruction:
      "Device full means charger out. Set a charging alarm if needed. Before sleeping, unplug every charger not actively charging something — one sweep of the room takes under a minute.",
  },
  {
    id: "natural_light",
    icon: "mdi-sun-angle",
    iconOutline: "mdi-sun-angle-outline",
    sectionId: "energy",
    name: "Use daylight before turning on a light",
    prompt: "Did you use natural daylight instead of electric lights for all daytime tasks today?",
    when: "Every morning when you sit down to work or study",
    instruction:
      "Open curtains before touching any switch. Move your work spot near a window. Turn on electric light only when daylight is genuinely insufficient. Daylight first is the rule, not a preference.",
  },
  {
    id: "shared_space_energy",
    icon: "mdi-door-open",
    iconOutline: "mdi-door-open", // no-outline
    sectionId: "energy",
    name: "Switch off fans and lights in shared spaces",
    prompt:
      "Did you check and switch off fans and lights every time you left a shared space today?",
    when: "Every time you leave a shared room",
    instruction:
      "Before stepping out of any shared space, take three seconds to check. Fan on and room emptying — switch it off. Light on — switch it off. Do not wait for someone else to do it.",
  },
  {
    id: "power_saving_mode",
    icon: "mdi-battery-heart",
    iconOutline: "mdi-battery-heart-outline",
    sectionId: "energy",
    name: "Keep power-saving mode permanently enabled",
    prompt: "Were power-saving and auto-brightness settings active on all your devices today?",
    when: "Right now — open your device settings once and set it permanently",
    instruction:
      "Go into your phone and laptop settings and enable power-saving mode and auto-brightness permanently. This is a one-time action. Once set, it reduces device energy draw every hour without any further effort.",
  },

  // ── CONSUMPTION ───────────────────────────────────────────────────────────

  {
    id: "printing_habits",
    icon: "mdi-printer-off",
    iconOutline: "mdi-printer-off-outline",
    sectionId: "consumption",
    name: "Open the document digitally before printing",
    prompt: "Did you avoid all unnecessary printing and handle documents digitally today?",
    when: "Every time you are about to print any document",
    instruction:
      "Before printing anything, open the file on your phone or screen first. Read it or annotate it digitally. Print only if digital is genuinely unusable for that specific task. The default is screen, not paper.",
  },
  {
    id: "clothing_purchases",
    icon: "mdi-tshirt-crew",
    iconOutline: "mdi-tshirt-crew-outline",
    sectionId: "consumption",
    name: "Write a list before every shopping trip",
    prompt:
      "Did you shop only from a prepared list today without any unplanned clothing or accessory purchases?",
    when: "The evening before any planned shopping trip",
    instruction:
      "Make your list the night before — not at the market. Write exactly what you need. At the market, buy only what is on the list. If it is not on the list, leave it. No exceptions for one full week.",
  },
  {
    id: "device_longevity",
    icon: "mdi-wrench",
    iconOutline: "mdi-wrench-outline",
    sectionId: "consumption",
    name: "Repair before you replace any device",
    prompt: "Did you choose repair over replacement for any device issue that came up today?",
    when: "The moment any device develops a fault or problem",
    instruction:
      "When a device has a problem, find the repair cost before looking at replacements. Battery, screen, and performance issues are usually repairable for a fraction of the cost of a new device. Repair is the first option, not the last.",
  },
  {
    id: "circular_economy",
    icon: "mdi-recycle",
    iconOutline: "mdi-recycle", // no-outline
    sectionId: "consumption",
    name: "Check secondhand before buying anything new",
    prompt: "Did you check a secondhand or borrowing option before any purchase you made today?",
    when: "Every time you identify something you need to buy",
    instruction:
      "Before buying anything new, spend five minutes checking whether it exists secondhand or can be borrowed. If a secondhand option covers the need, use it. New is the fallback, not the default.",
  },

  // ── WATER ─────────────────────────────────────────────────────────────────

  {
    id: "bathing_method",
    icon: "mdi-bucket",
    iconOutline: "mdi-bucket-outline",
    sectionId: "water",
    name: "Bathe with a bucket",
    prompt: "Did you bathe using a bucket instead of a shower today?",
    when: "Every time you prepare to bathe",
    instruction:
      "Fill your bucket before getting in. A bucket bath uses 15–20 litres. A 10-minute shower uses 60–80 litres. If switching immediately feels difficult, set a 5-minute timer on your shower and work toward bucket bathing once a week.",
  },
  {
    id: "tap_behaviour",
    icon: "mdi-water-off",
    iconOutline: "mdi-water-off-outline",
    sectionId: "water",
    name: "Turn off the tap while brushing",
    prompt: "Did you turn the tap off every time you were brushing, soaping, or lathering today?",
    when: "The moment your hand touches the soap or toothbrush",
    instruction:
      "Soap or brush in hand means tap is off. Make that an absolute rule. Turn on only to rinse. A running tap wastes 6 litres per minute of idle flow — this single rule prevents all of it.",
  },
  {
    id: "dishwashing_method",
    icon: "mdi-bowl",
    iconOutline: "mdi-bowl-outline",
    sectionId: "water",
    name: "Wash dishes in a filled basin",
    prompt:
      "Did you use a filled basin or bucket for all dish washing today instead of a running tap?",
    when: "The moment you start any dishwashing session",
    instruction:
      "Fill the basin before touching a single dish. Wash everything in it. Use the running tap only for a quick final rinse. A filled basin uses 5–10 litres; a running tap uses up to 30 per session.",
  },
  {
    id: "laundry_method",
    icon: "mdi-washing-machine",
    iconOutline: "mdi-washing-machine", // no-outline
    sectionId: "water",
    name: "Wait for a full load before doing any laundry",
    prompt: "Did you run only a full load of laundry today, or wait until you have one?",
    when: "Every time you consider doing laundry",
    instruction:
      "Before starting any wash, check whether you have a full load. If not, wait and collect more. A partial load uses the same water and electricity as a full one — every gap in the drum is wasted resource.",
  },
  {
    id: "drinking_water_source",
    icon: "mdi-bottle-soda",
    iconOutline: "mdi-bottle-soda-outline",
    sectionId: "water",
    name: "Fill a bottle before leaving home",
    prompt: "Did you fill and carry your reusable bottle today instead of buying bottled water?",
    when: "Every morning before leaving home",
    instruction:
      "Fill your reusable bottle from the tap or filter before you leave. Keep it next to your keys so it leaves with you on every trip, including short ones. A filled bottle in hand removes the need for any bottled purchase.",
  },
  {
    id: "leak_reporting",
    icon: "mdi-water-alert",
    iconOutline: "mdi-water-alert-outline",
    sectionId: "water",
    name: "Report and follow up every water leak you notice",
    prompt: "Did you report or follow up on any water leak or waste you noticed today?",
    when: "The moment you notice any dripping tap, leaking pipe, or running water going to waste",
    instruction:
      "Report it immediately to whoever is responsible — landlord, building management, or facilities. Note the date. Follow up after three days if it is not fixed. A dripping tap wastes 15–20 litres per day; following up is what ensures it stops.",
  },

  // ── WASTE ─────────────────────────────────────────────────────────────────

  {
    id: "plastic_bottles",
    icon: "mdi-bottle-soda",
    iconOutline: "mdi-bottle-soda-outline",
    sectionId: "waste",
    name: "Refill a bottle instead of buying one",
    prompt:
      "Did you use your reusable bottle all day today without buying a single-use plastic bottle?",
    when: "Every morning before leaving home",
    instruction:
      "Fill a reusable bottle before you leave. Place it next to your keys so it goes with you every time. At the moment you would buy a bottle, you already have one.",
  },
  {
    id: "waste_segregation",
    icon: "mdi-trash-can",
    iconOutline: "mdi-trash-can-outline",
    sectionId: "waste",
    name: "Sort waste into a wet bin and dry bin",
    prompt: "Did you correctly separate every item of waste into the right bin today?",
    when: "Every time you dispose of any item",
    instruction:
      "Before dropping anything in a bin, pause and ask: wet, dry, or hazardous? Set up three clearly labelled containers today. The system needs to exist physically before the habit can form.",
  },
  {
    id: "disposable_cutlery",
    icon: "mdi-cup",
    iconOutline: "mdi-cup-outline",
    sectionId: "waste",
    name: "Use your own cup, plate, and spoon",
    prompt:
      "Did you use reusable items for every meal and drink today without touching a disposable?",
    when: "Every morning before leaving the house",
    instruction:
      "Pack a reusable cup and a set of cutlery in your bag before stepping out. One set in your bag means disposables are never the only option available, regardless of where you eat.",
  },
  {
    id: "reusable_bag",
    icon: "mdi-shopping",
    iconOutline: "mdi-shopping-outline",
    sectionId: "waste",
    name: "Take a cloth bag to every shop",
    prompt:
      "Did you use only a reusable bag for all shopping today without accepting any plastic bags?",
    when: "Every time you leave the house",
    instruction:
      "Keep a foldable cloth bag next to your keys. Before picking up your keys, pick up the bag. That one association removes the most common reason for accepting a plastic bag — simply not having one.",
  },
  {
    id: "ewaste",
    icon: "mdi-battery-remove",
    iconOutline: "mdi-battery-remove-outline",
    sectionId: "waste",
    name: "Take e-waste to an authorised collection point",
    prompt:
      "Did you store or drop off any electronic waste correctly today rather than discarding it improperly?",
    when: "The moment any electronic item is no longer working or needed",
    instruction:
      "Find your nearest authorised e-waste collection point now and save the address. When an item fails, store it safely until you can drop it off there. Never put electronics in the regular bin or discard them outdoors.",
  },
  {
    id: "organic_waste",
    icon: "mdi-sprout",
    iconOutline: "mdi-sprout-outline",
    sectionId: "waste",
    name: "Put food scraps in a separate container",
    prompt:
      "Did you put all food scraps and peels into a dedicated container today, separate from other waste?",
    when: "Every time you have food scraps, peels, or leftover food",
    instruction:
      "Place a small container — any lidded container — next to your cooking area for food scraps only. Every peel and scrap goes there. That one container makes composting or proper disposal possible.",
  },
  {
    id: "food_waste",
    icon: "mdi-fridge",
    iconOutline: "mdi-fridge-outline",
    sectionId: "waste",
    name: "Check the fridge before buying groceries",
    prompt:
      "Did you check what was already in your fridge and plan meals around it before buying food today?",
    when: "Before every grocery shopping trip",
    instruction:
      "Open the fridge before you leave for any food shopping. Look at what is already there and what needs to be eaten first. Build your shopping list around that. This one check prevents the most common source of household food waste.",
  },

  // ── DIGITAL ───────────────────────────────────────────────────────────────

  {
    id: "streaming_habits",
    icon: "mdi-video",
    iconOutline: "mdi-video-outline",
    sectionId: "digital",
    name: "Set streaming quality to SD permanently",
    prompt: "Did you stream at SD quality and stay within your daily time limit today?",
    when: "Right now — open your streaming app settings once and set it permanently",
    instruction:
      "Go into your streaming app settings and set video quality to SD or the lowest auto option. Do this on every app today. HD uses roughly 20 times more data per hour than SD — this one setting change reduces streaming energy use every session.",
  },
  {
    id: "cloud_hygiene",
    icon: "mdi-cloud-remove",
    iconOutline: "mdi-cloud-remove-outline",
    sectionId: "digital",
    name: "Delete unused files and photos monthly",
    prompt: "Did you review and delete any unused files, photos, or cloud backups this month?",
    when: "Once a month — set a recurring calendar reminder today",
    instruction:
      "Set a monthly 15-minute calendar reminder for a digital cleanup. Delete photos you will never use, videos you have already watched, and duplicate backups. Cloud storage requires continuous server energy — keeping it lean reduces that load.",
  },
  {
    id: "email_hygiene",
    icon: "mdi-email-remove",
    iconOutline: "mdi-email-remove-outline",
    sectionId: "digital",
    name: "Unsubscribe and delete emails weekly",
    prompt:
      "Did you delete unnecessary emails and unsubscribe from irrelevant mailing lists this week?",
    when: "Once a week — the same day and time each week",
    instruction:
      "Set a weekly 10-minute slot for inbox management. Delete emails you will never return to. Unsubscribe from mailing lists you no longer read. Unsubscribing prevents the email from arriving — it is more efficient than deleting repeatedly.",
  },
  {
    id: "intentional_use",
    icon: "mdi-timer",
    iconOutline: "mdi-timer-outline",
    sectionId: "digital",
    name: "Set a daily screen time limit before you scroll",
    prompt:
      "Did you use your device only for specific, intended purposes today without passive scrolling?",
    when: "Every time you pick up your phone or open your laptop",
    instruction:
      "Before picking up your phone or opening a laptop, state to yourself what you are doing with it. Passive scrolling generates continuous data transfer. Intentional use with a defined endpoint stops that. Set a daily screen time limit in your device settings.",
  },
  {
    id: "device_repair",
    icon: "mdi-wrench",
    iconOutline: "mdi-wrench-outline",
    sectionId: "digital",
    name: "Get a repair quote before any replacement",
    prompt: "Did you choose repair over replacement for any device issue today?",
    when: "The moment any device develops a fault or problem",
    instruction:
      "When a device has a problem, find the repair cost before looking at any replacement. Battery, screen, and performance issues are typically repairable. Get one quote from a local technician before making any other decision.",
  },
];
