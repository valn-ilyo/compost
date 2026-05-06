import type { QuestionInsight, SectionMeta } from "../types/app.types";

export const QUESTION_INSIGHTS: QuestionInsight[] = [
  // ─── TRANSPORT ────────────────────────────────────────────────────────────────

  // commute_mode
  {
    sectionId: "transport",
    questionId: "commute_mode",
    score: 5,
    icon: "mdi-walk",
    text: "Walking or cycling eliminates commute emissions entirely and requires no trade-off. That choice compounds across every working day of the year.",
  },
  {
    sectionId: "transport",
    questionId: "commute_mode",
    score: 4,
    icon: "mdi-bus",
    text: "Shared transport is a strong choice. If any part of your route is walkable or cyclable, replacing that segment removes the remaining footprint.",
  },
  {
    sectionId: "transport",
    questionId: "commute_mode",
    score: 3,
    icon: "mdi-account-group-outline",
    text: "Group transport reduces per-person emissions but still depends on a vehicle. Check whether a public bus serves the same route: it runs regardless of your participation, so your seat adds almost nothing to the total.",
  },
  {
    sectionId: "transport",
    questionId: "commute_mode",
    score: 2,
    icon: "mdi-motorbike",
    text: "A single-occupancy motorbike carries a meaningful per-trip footprint. Identify one day this week where shared transport covers your route and use it.",
  },
  {
    sectionId: "transport",
    questionId: "commute_mode",
    score: 1,
    icon: "mdi-car-off",
    text: "A private car alone is the highest-emission commute option. Find the shared transport route for your destination and take it once this week.",
  },

  // commute_distance — noHabit: distance is a fixed fact, not a repeatable behaviour.
  {
    sectionId: "transport",
    questionId: "commute_distance",
    score: 5,
    noHabit: true,
    icon: "mdi-home-outline",
    text: "Living on-site removes commute emissions entirely. That's the structural ceiling of commute impact reduction, and you're already there.",
  },
  {
    sectionId: "transport",
    questionId: "commute_distance",
    score: 4,
    noHabit: true,
    icon: "mdi-walk",
    text: "Under 2 km is walkable or cyclable for most people. If you're not already doing this on every trip, that's the one remaining gap.",
  },
  {
    sectionId: "transport",
    questionId: "commute_distance",
    score: 3,
    noHabit: true,
    icon: "mdi-bicycle",
    text: "2 to 5 km is within cycling range and well within shared transport range. If you're using a private vehicle for this distance, replace it with one of those two options starting today.",
  },
  {
    sectionId: "transport",
    questionId: "commute_distance",
    score: 2,
    noHabit: true,
    icon: "mdi-bus",
    text: "5 to 15 km requires planning but is served by shared transport in most areas. Map your route once and use it on your next commute.",
  },
  {
    sectionId: "transport",
    questionId: "commute_distance",
    score: 1,
    noHabit: true,
    icon: "mdi-map-marker-distance",
    text: "Over 15 km commutes carry the highest transport footprints. Find the shared transport option for your route, whether bus, train, or carpool, and use it for one trip this week.",
  },

  // commute_frequency
  {
    sectionId: "transport",
    questionId: "commute_frequency",
    score: 5,
    icon: "mdi-home-outline",
    text: "No regular commute is the structural baseline that removes daily transport emissions from your footprint. Nothing you can do on commute days matches this.",
  },
  {
    sectionId: "transport",
    questionId: "commute_frequency",
    score: 4,
    icon: "mdi-calendar-check",
    text: "One to two commute days per week is already low. The remaining impact comes from mode: make sure those trips use shared or active transport.",
  },
  {
    sectionId: "transport",
    questionId: "commute_frequency",
    score: 3,
    icon: "mdi-calendar-week",
    text: "Three to four days of commuting is above average. Mode determines the footprint on each of those days. Switch to shared transport on every commute day.",
  },
  {
    sectionId: "transport",
    questionId: "commute_frequency",
    score: 2,
    icon: "mdi-bus",
    text: "Five to six commute days is a daily pattern. Use shared transport on at least three of those days this week.",
  },
  {
    sectionId: "transport",
    questionId: "commute_frequency",
    score: 1,
    icon: "mdi-car-off",
    text: "Daily commuting by private vehicle is the highest-impact transport pattern. Replace one commute day with shared transport this week.",
  },

  // short_trips
  {
    sectionId: "transport",
    questionId: "short_trips",
    score: 5,
    icon: "mdi-walk",
    text: "Walking every short trip eliminates that segment of your footprint and requires no planning. The habit is already right.",
  },
  {
    sectionId: "transport",
    questionId: "short_trips",
    score: 4,
    icon: "mdi-walk",
    text: "Walking most of the time is close to the ceiling. The gap is the trips where you choose otherwise: commit to walking for any trip under 2 km, no exceptions.",
  },
  {
    sectionId: "transport",
    questionId: "short_trips",
    score: 3,
    icon: "mdi-map-marker-path",
    text: "Short trips by shared transport are not zero-emission. For distances under 2 km, walking is faster than waiting and costs nothing. Remove the decision: walk every time.",
  },
  {
    sectionId: "transport",
    questionId: "short_trips",
    score: 2,
    icon: "mdi-bus",
    text: "Shared transport for sub-2 km trips adds transport emissions where none are needed. Walk the next three short trips before reconsidering any other option.",
  },
  {
    sectionId: "transport",
    questionId: "short_trips",
    score: 1,
    icon: "mdi-car-off",
    text: "A private vehicle for sub-2 km distances is the least efficient option available. Walk one errand today. Distance under 2 km, on foot, no exception.",
  },

  // discretionary_mode
  {
    sectionId: "transport",
    questionId: "discretionary_mode",
    score: 5,
    icon: "mdi-bus",
    text: "Actively choosing shared transport for every local trip removes private vehicle use from your local travel footprint entirely.",
  },
  {
    sectionId: "transport",
    questionId: "discretionary_mode",
    score: 4,
    icon: "mdi-bus",
    text: "Using shared transport on most trips is strong. The remaining gap is the occasions where you default to private. Identify those specific trips and plan the shared alternative in advance.",
  },
  {
    sectionId: "transport",
    questionId: "discretionary_mode",
    score: 3,
    icon: "mdi-car-multiple",
    text: "Half private and half shared means the habit isn't yet default. Pick shared transport as the rule, private as the exception. Start by committing shared for the next seven days.",
  },
  {
    sectionId: "transport",
    questionId: "discretionary_mode",
    score: 2,
    icon: "mdi-car-off",
    text: "Rarely choosing shared transport means the default is private. That default needs to reverse. Take shared transport for your next local errand regardless of convenience.",
  },
  {
    sectionId: "transport",
    questionId: "discretionary_mode",
    score: 1,
    icon: "mdi-car-off",
    text: "Always using a private vehicle for local travel is a daily pattern with a direct fix. Find the shared transport option for your most common local trip and use it once this week.",
  },

  // ─── FOOD ─────────────────────────────────────────────────────────────────────

  // diet_type
  {
    sectionId: "food",
    questionId: "diet_type",
    score: 5,
    icon: "mdi-leaf",
    text: "A plant-based or vegan diet sits at the low end of food-related emissions. That pattern is already the correct one and requires no adjustment.",
  },
  {
    sectionId: "food",
    questionId: "diet_type",
    score: 4,
    icon: "mdi-food-variant",
    text: "A vegetarian diet removes the highest-emission food category. The remaining gap is dairy. Replacing dairy at one meal daily moves the footprint measurably lower.",
  },
  {
    sectionId: "food",
    questionId: "diet_type",
    score: 3,
    icon: "mdi-food-variant",
    text: "A mostly plant-based diet with occasional meat still carries meat emissions. Add one more meat-free day per week: not a smaller portion, a full day without meat.",
  },
  {
    sectionId: "food",
    questionId: "diet_type",
    score: 2,
    icon: "mdi-food-variant",
    text: "Non-vegetarian at most meals is a high-emission diet pattern. Replace one meal today with a legume or grain dish. One meal, one day, repeated daily is the mechanism of change.",
  },
  {
    sectionId: "food",
    questionId: "diet_type",
    score: 1,
    icon: "mdi-food-off",
    text: "Red meat at nearly every meal carries the highest dietary footprint of any pattern. At your next meal containing beef or pork, replace it with chicken, fish, eggs, or lentils.",
  },

  // plate_waste
  {
    sectionId: "food",
    questionId: "plate_waste",
    score: 5,
    icon: "mdi-food-off",
    text: "Taking only what you'll eat means the full production cost of your food is never wasted. That discipline is applied at the right moment.",
  },
  {
    sectionId: "food",
    questionId: "plate_waste",
    score: 4,
    icon: "mdi-food-off",
    text: "Wasting food once or twice a week is occasional but not zero. The specific fix is portion size at the point of serving: take less first, return for more if needed.",
  },
  {
    sectionId: "food",
    questionId: "plate_waste",
    score: 3,
    icon: "mdi-food-off",
    text: "Wasting food three to four times a week means the serving habit consistently over-estimates. Switch to a smaller plate today. Plate size is the most direct control on how much you serve.",
  },
  {
    sectionId: "food",
    questionId: "plate_waste",
    score: 2,
    icon: "mdi-food-off",
    text: "Discarding food nearly every day means every meal is generating avoidable waste. Serve half of what you think you want, eat it, then decide. That one pause prevents most daily plate waste.",
  },
  {
    sectionId: "food",
    questionId: "plate_waste",
    score: 1,
    icon: "mdi-food-off",
    text: "Regularly discarding half-eaten food means the full production cost of that food is paid for nothing. Start by finishing everything on your plate today, even if it means serving less to begin.",
  },

  // leftovers
  {
    sectionId: "food",
    questionId: "leftovers",
    score: 5,
    icon: "mdi-fridge-outline",
    text: "Always saving and eating leftovers means cooked food is never wasted. The production cost of every meal is fully used.",
  },
  {
    sectionId: "food",
    questionId: "leftovers",
    score: 4,
    icon: "mdi-fridge-outline",
    text: "Usually saving leftovers is close to the target. The gap is the occasions you don't. Date each container when you store it: dated leftovers get eaten, undated ones get forgotten.",
  },
  {
    sectionId: "food",
    questionId: "leftovers",
    score: 3,
    icon: "mdi-fridge-outline",
    text: "Sometimes discarding leftovers means the storage habit is inconsistent. Box leftovers before you serve your plate, not after eating and not later. That timing is what makes the difference.",
  },
  {
    sectionId: "food",
    questionId: "leftovers",
    score: 2,
    icon: "mdi-fridge-outline",
    text: "Usually discarding leftovers means cooked food is routinely wasted after production. After dinner tonight, wrap whatever remains and refrigerate it before leaving the kitchen.",
  },
  {
    sectionId: "food",
    questionId: "leftovers",
    score: 1,
    icon: "mdi-fridge-outline",
    text: "Always discarding leftovers means the full cost of every meal beyond your plate is wasted. Before sleeping tonight, put any cooked food still out into the fridge.",
  },

  // packaged_food
  {
    sectionId: "food",
    questionId: "packaged_food",
    score: 5,
    icon: "mdi-package-variant-closed-remove",
    text: "Never buying packaged food means you carry no packaging waste from snacks or drinks and avoid the energy cost of processed food production.",
  },
  {
    sectionId: "food",
    questionId: "packaged_food",
    score: 4,
    icon: "mdi-package-variant-closed-remove",
    text: "Buying packaged food once or twice a week is occasional. The gap is those specific moments: a packed item from home on every departure eliminates them.",
  },
  {
    sectionId: "food",
    questionId: "packaged_food",
    score: 3,
    icon: "mdi-package-variant-closed-remove",
    text: "Three to four times a week is a frequent pattern driven by not having an alternative when hungry. Pack a snack every morning before you leave. That one preparation step removes the trigger for every packaged purchase.",
  },
  {
    sectionId: "food",
    questionId: "packaged_food",
    score: 2,
    icon: "mdi-package-variant-closed-remove",
    text: "Once or twice daily means packaged food is a consistent habit. Fill your reusable bottle and pack one food item each morning. Start tomorrow.",
  },
  {
    sectionId: "food",
    questionId: "packaged_food",
    score: 1,
    icon: "mdi-package-variant-closed-remove",
    text: "Multiple packaged purchases daily is the highest-waste food habit at this level. Tomorrow morning, fill a bottle and put a piece of fruit in your bag before leaving. That replaces one purchase immediately.",
  },

  // local_food
  {
    sectionId: "food",
    questionId: "local_food",
    score: 5,
    icon: "mdi-store-outline",
    text: "Buying mostly local, seasonal, or unpackaged food keeps transport emissions low and reduces packaging waste at the source. That pattern is already right.",
  },
  {
    sectionId: "food",
    questionId: "local_food",
    score: 4,
    icon: "mdi-store-outline",
    text: "More than half local or fresh is a strong position. The gap is the remaining packaged or imported purchases. Identify the one most easily replaced and swap it on your next trip.",
  },
  {
    sectionId: "food",
    questionId: "local_food",
    score: 3,
    icon: "mdi-store-outline",
    text: "Roughly half local and half packaged or imported means the habit isn't yet consistent. Set a minimum of one local or unpackaged item per shopping trip as a non-negotiable rule.",
  },
  {
    sectionId: "food",
    questionId: "local_food",
    score: 2,
    icon: "mdi-store-outline",
    text: "Mostly packaged or imported options means local alternatives are not yet part of the shopping habit. Find your nearest market or fresh supplier this week and buy one item from it.",
  },
  {
    sectionId: "food",
    questionId: "local_food",
    score: 1,
    icon: "mdi-store-outline",
    text: "Rarely or never buying local or seasonal produce means your food footprint from transport and packaging is near its maximum. Buy one seasonal or unpackaged item on your next shopping trip.",
  },

  // ─── ENERGY ───────────────────────────────────────────────────────────────────

  // lights_off
  {
    sectionId: "energy",
    questionId: "lights_off",
    score: 5,
    icon: "mdi-lightbulb-off-outline",
    text: "Switching off every time you leave is a complete habit. Rooms you leave dark cost nothing to run.",
  },
  {
    sectionId: "energy",
    questionId: "lights_off",
    score: 4,
    icon: "mdi-lightbulb-off-outline",
    text: "Usually switching off is close to complete. The gap is the occasions you forget. A note on your door listing what to check closes that gap without any ongoing effort.",
  },
  {
    sectionId: "energy",
    questionId: "lights_off",
    score: 3,
    icon: "mdi-lightbulb-off-outline",
    text: "Occasional forgetting means the habit is not automatic yet. Pick one room and make it unconditional for one week. One room, fully consistent, builds the pattern for all rooms.",
  },
  {
    sectionId: "energy",
    questionId: "lights_off",
    score: 2,
    icon: "mdi-lightbulb-off-outline",
    text: "Rarely switching off means rooms run while empty most of the time. Stick a reminder on one door today and commit to one room. That room, every time.",
  },
  {
    sectionId: "energy",
    questionId: "lights_off",
    score: 1,
    icon: "mdi-lightbulb-off-outline",
    text: "Never switching off means every room runs continuously whether occupied or not. Switch one light off the next time you leave a room. That one act is where the habit begins.",
  },

  // standby_power
  {
    sectionId: "energy",
    questionId: "standby_power",
    score: 5,
    icon: "mdi-power-plug-off",
    text: "Unplugging immediately when charging is done eliminates phantom load from every charger in your space. That power draw is removed entirely.",
  },
  {
    sectionId: "energy",
    questionId: "standby_power",
    score: 4,
    icon: "mdi-power-plug-off",
    text: "Usually unplugging is close to complete. The remaining occasions are the gap. Make device at 100% the unconditional trigger to unplug.",
  },
  {
    sectionId: "energy",
    questionId: "standby_power",
    score: 3,
    icon: "mdi-power-plug-off",
    text: "Sometimes unplugging means chargers run on standby for hours regularly. Before sleeping tonight, unplug every charger not in active use. Make that a nightly routine.",
  },
  {
    sectionId: "energy",
    questionId: "standby_power",
    score: 2,
    icon: "mdi-power-plug-off",
    text: "Chargers left plugged in draw power continuously. Start with the charger by your bed: unplug it every morning as part of waking up.",
  },
  {
    sectionId: "energy",
    questionId: "standby_power",
    score: 1,
    icon: "mdi-power-plug-off",
    text: "Devices plugged in continuously means phantom load runs all day and night. Unplug one charger tonight before sleeping. That's the first action.",
  },

  // natural_light
  {
    sectionId: "energy",
    questionId: "natural_light",
    score: 5,
    icon: "mdi-weather-sunny",
    text: "Using natural light throughout the day means no electricity is drawn for lighting during daylight hours. That saving is automatic and daily.",
  },
  {
    sectionId: "energy",
    questionId: "natural_light",
    score: 4,
    icon: "mdi-weather-sunny",
    text: "Usually using daylight is a strong pattern. The gap is the times you switch lights on when daylight would suffice. Commit to no electric lights before noon as a daily rule.",
  },
  {
    sectionId: "energy",
    questionId: "natural_light",
    score: 3,
    icon: "mdi-weather-sunny",
    text: "Sometimes using daylight means electric lights run during hours when they're not needed. Move your primary work spot near a window and open curtains before sitting down every morning.",
  },
  {
    sectionId: "energy",
    questionId: "natural_light",
    score: 2,
    icon: "mdi-weather-sunny",
    text: "Rarely using daylight means electric lights run all day regardless of what's available outside. Open your curtains as the first act of every morning, before any switch.",
  },
  {
    sectionId: "energy",
    questionId: "natural_light",
    score: 1,
    icon: "mdi-weather-sunny",
    text: "Never using daylight means electric lighting runs from waking to dark. Open the curtains one morning this week instead of turning on the light and see how much you need the switch.",
  },

  // shared_space_energy
  {
    sectionId: "energy",
    questionId: "shared_space_energy",
    score: 5,
    icon: "mdi-account-group-outline",
    text: "Actively checking shared spaces before leaving extends your energy habit beyond your personal rooms. That consistency matters because shared spaces are left running most often.",
  },
  {
    sectionId: "energy",
    questionId: "shared_space_energy",
    score: 4,
    icon: "mdi-account-group-outline",
    text: "Usually checking is close to complete. The remaining gap is assuming someone else will handle it. Make the check your personal rule regardless of who else is in the room.",
  },
  {
    sectionId: "energy",
    questionId: "shared_space_energy",
    score: 3,
    icon: "mdi-account-group-outline",
    text: "Sometimes checking means shared spaces run unnecessarily on the days you don't. Pick one shared space you use daily and commit to always checking before you leave it.",
  },
  {
    sectionId: "energy",
    questionId: "shared_space_energy",
    score: 2,
    icon: "mdi-account-group-outline",
    text: "Rarely checking shared spaces, expecting others to act, means those spaces run continuously. Do the check yourself once today in any shared room you leave.",
  },
  {
    sectionId: "energy",
    questionId: "shared_space_energy",
    score: 1,
    icon: "mdi-account-group-outline",
    text: "Never checking shared spaces means they run after every departure. Look back once before leaving any shared room this week and switch off what is running.",
  },

  // power_saving_mode
  {
    sectionId: "energy",
    questionId: "power_saving_mode",
    score: 5,
    icon: "mdi-brightness-auto",
    text: "Power-saving and auto-brightness set permanently means device energy draw is reduced every hour without further decisions. The setting does the work.",
  },
  {
    sectionId: "energy",
    questionId: "power_saving_mode",
    score: 4,
    icon: "mdi-brightness-auto",
    text: "Usually enabled is nearly complete. The gap is the occasions you disable it. Set both as permanent defaults in your settings now so the question never arises.",
  },
  {
    sectionId: "energy",
    questionId: "power_saving_mode",
    score: 3,
    icon: "mdi-brightness-auto",
    text: "Enabling power-saving only when battery is low means your device runs at full draw most of the time. Go into settings today and enable both permanently: one action, permanent effect.",
  },
  {
    sectionId: "energy",
    questionId: "power_saving_mode",
    score: 2,
    icon: "mdi-brightness-auto",
    text: "High brightness and no power-saving means your device draws significantly more power than necessary all day. Enable auto-brightness now. That single change reduces screen energy use immediately.",
  },
  {
    sectionId: "energy",
    questionId: "power_saving_mode",
    score: 1,
    icon: "mdi-brightness-auto",
    text: "Not using these settings means your devices run at maximum draw continuously. Open your phone settings now and enable auto-brightness. It takes thirty seconds.",
  },

  // ─── CONSUMPTION ──────────────────────────────────────────────────────────────

  // printing_habits
  {
    sectionId: "consumption",
    questionId: "printing_habits",
    score: 5,
    icon: "mdi-printer-off",
    text: "Going fully digital means no paper, no ink, and no energy cost from printing. Every document stays in the system it was created in.",
  },
  {
    sectionId: "consumption",
    questionId: "printing_habits",
    score: 4,
    icon: "mdi-printer-off",
    text: 'Printing only when truly required is close to the ceiling. The gap is what "truly required" actually means. Challenge one more print decision per week by opening the file on screen first.',
  },
  {
    sectionId: "consumption",
    questionId: "printing_habits",
    score: 3,
    icon: "mdi-printer-off",
    text: "Printing roughly half the time means printing is still a reflex. Before your next print, open the file on screen first. Most documents don't need a physical copy once you look at them that way.",
  },
  {
    sectionId: "consumption",
    questionId: "printing_habits",
    score: 2,
    icon: "mdi-printer-off",
    text: "Printing as the default means paper and ink are consumed for documents that could stay digital. Start with your notes: open them on your phone at your next session.",
  },
  {
    sectionId: "consumption",
    questionId: "printing_habits",
    score: 1,
    icon: "mdi-printer-off",
    text: "Printing everything by default means every document generates paper and ink waste. Read one document on screen today instead of printing it.",
  },

  // clothing_purchases
  {
    sectionId: "consumption",
    questionId: "clothing_purchases",
    score: 5,
    icon: "mdi-hanger",
    text: "Zero unplanned purchases means your buying is fully intentional. Every item you own was chosen, not grabbed. That discipline removes demand for unnecessary production.",
  },
  {
    sectionId: "consumption",
    questionId: "clothing_purchases",
    score: 4,
    icon: "mdi-hanger",
    text: "One unplanned purchase is a small gap in an otherwise disciplined pattern. A written list prepared before you leave, not at the market, closes it.",
  },
  {
    sectionId: "consumption",
    questionId: "clothing_purchases",
    score: 3,
    icon: "mdi-hanger",
    text: "Two to three unplanned purchases means impulse buying is an occasional but consistent pattern. Apply a 24-hour rule: if you see something unplanned, note it and return the next day if you still want it.",
  },
  {
    sectionId: "consumption",
    questionId: "clothing_purchases",
    score: 2,
    icon: "mdi-hanger",
    text: "Four to six unplanned purchases in a month means the shopping habit lacks a boundary. Write your list the night before your next trip and buy only what is on it.",
  },
  {
    sectionId: "consumption",
    questionId: "clothing_purchases",
    score: 1,
    icon: "mdi-hanger",
    text: "More than six unplanned purchases is a frequent pattern. Write a list of three things you need before your next trip and buy only those three.",
  },

  // device_longevity
  {
    sectionId: "consumption",
    questionId: "device_longevity",
    score: 5,
    icon: "mdi-cellphone-check",
    text: "Using a device until it stops working, and repairing rather than replacing, spreads the manufacturing cost (roughly 70 to 80 kg CO2 for a smartphone) across the maximum possible years.",
  },
  {
    sectionId: "consumption",
    questionId: "device_longevity",
    score: 4,
    icon: "mdi-cellphone-check",
    text: "Four or more years of use is well above average. When the next fault appears, check the repair cost first: extending the life by another year is usually achievable and significantly cheaper.",
  },
  {
    sectionId: "consumption",
    questionId: "device_longevity",
    score: 3,
    icon: "mdi-cellphone-check",
    text: "Two to three years is a common replacement cycle but not the most efficient. Before your next upgrade, get a repair quote: a battery replacement or screen fix often adds one to two years of use at low cost.",
  },
  {
    sectionId: "consumption",
    questionId: "device_longevity",
    score: 2,
    icon: "mdi-cellphone-check",
    text: "One to two years of use means most of the device's usable life is discarded. Get a repair quote on your current device before considering any replacement.",
  },
  {
    sectionId: "consumption",
    questionId: "device_longevity",
    score: 1,
    icon: "mdi-cellphone-check",
    text: "Replacing at every new model means devices are discarded with most of their life unused. Skip one upgrade cycle. Your current device almost certainly has more usable life remaining.",
  },

  // circular_economy
  {
    sectionId: "consumption",
    questionId: "circular_economy",
    score: 5,
    icon: "mdi-swap-horizontal",
    text: "Borrowing, renting, or buying secondhand consistently means the manufacturing footprint of those items is shared or reused rather than generated again.",
  },
  {
    sectionId: "consumption",
    questionId: "circular_economy",
    score: 4,
    icon: "mdi-swap-horizontal",
    text: "Three to five secondhand or borrowed purchases is a strong pattern. For the remaining new purchases, check secondhand first as a standing rule.",
  },
  {
    sectionId: "consumption",
    questionId: "circular_economy",
    score: 3,
    icon: "mdi-swap-horizontal",
    text: "One or two secondhand choices shows the option is available but not yet the default. Make secondhand the first check, not an afterthought, for every new purchase you consider.",
  },
  {
    sectionId: "consumption",
    questionId: "circular_economy",
    score: 2,
    icon: "mdi-swap-horizontal",
    text: "Thinking about it but buying new means awareness exists without action. Next time you need something, check one secondhand source before purchasing. That check is the habit.",
  },
  {
    sectionId: "consumption",
    questionId: "circular_economy",
    score: 1,
    icon: "mdi-swap-horizontal",
    text: "Always buying new without considering alternatives means every purchase generates its full manufacturing footprint. Search secondhand for the next item you need. One search, one time.",
  },

  // ─── WATER ────────────────────────────────────────────────────────────────────

  // bathing_method
  {
    sectionId: "water",
    questionId: "bathing_method",
    score: 5,
    icon: "mdi-shower-head",
    text: "Bucket bathing consistently uses 15 to 20 litres per wash versus 60 to 80 for a 10-minute shower. That difference is fixed and daily.",
  },
  {
    sectionId: "water",
    questionId: "bathing_method",
    score: 4,
    icon: "mdi-shower-head",
    text: "A shower under 5 minutes is a controlled habit. The gap to score 5 is method: a bucket bath uses roughly half the water of even a 5-minute shower.",
  },
  {
    sectionId: "water",
    questionId: "bathing_method",
    score: 3,
    icon: "mdi-shower-head",
    text: "Showering 5 to 10 minutes means water use is above the bucket baseline. Set a 5-minute timer before stepping in. When it rings, turn off. Work toward one bucket bath per week.",
  },
  {
    sectionId: "water",
    questionId: "bathing_method",
    score: 2,
    icon: "mdi-shower-head",
    text: "Showering over 10 minutes is among the highest personal water uses available. Set a 7-minute timer and reduce by one minute per week until you reach 5 or less.",
  },
  {
    sectionId: "water",
    questionId: "bathing_method",
    score: 1,
    icon: "mdi-shower-head",
    text: "No awareness of shower duration means water use is unchecked. Set a timer before your next shower, any duration. Knowing how long you take is the first corrective step.",
  },

  // tap_behaviour
  {
    sectionId: "water",
    questionId: "tap_behaviour",
    score: 5,
    icon: "mdi-water-off",
    text: "Turning off the tap whenever you're not actively rinsing eliminates idle flow entirely. At 6 litres per minute, none of that water is wasted under this habit.",
  },
  {
    sectionId: "water",
    questionId: "tap_behaviour",
    score: 4,
    icon: "mdi-water-off",
    text: "Usually turning off the tap is close to complete. The gap is the occasions you leave it running. Make the rule unconditional: soap or brush in hand, tap off, no exceptions this week.",
  },
  {
    sectionId: "water",
    questionId: "tap_behaviour",
    score: 3,
    icon: "mdi-water-off",
    text: "Sometimes turning off the tap means idle flow still occurs regularly. Make it a physical rule: the moment your hand touches the toothbrush or soap, the tap is already off.",
  },
  {
    sectionId: "water",
    questionId: "tap_behaviour",
    score: 2,
    icon: "mdi-water-off",
    text: "Rarely turning off the tap means idle flow runs through most of every brushing and washing session. At your next brushing session, turn off the tap as soon as you start. That one session starts the habit.",
  },
  {
    sectionId: "water",
    questionId: "tap_behaviour",
    score: 1,
    icon: "mdi-water-off",
    text: "Tap running throughout brushing and washing means up to 4,000 litres per year per person is wasted at this single moment. Turn the tap off tonight before bed when you brush. Wet the brush, then off.",
  },

  // dishwashing_method
  {
    sectionId: "water",
    questionId: "dishwashing_method",
    score: 5,
    icon: "mdi-bowl-outline",
    text: "Always using a filled basin means dishwashing uses 5 to 10 litres per session instead of up to 30. That saving occurs at every wash.",
  },
  {
    sectionId: "water",
    questionId: "dishwashing_method",
    score: 4,
    icon: "mdi-bowl-outline",
    text: "Usually using a basin is close to the target. The remaining occasions with a running tap are the gap. Make filling the basin the first action before touching any dish, non-negotiable.",
  },
  {
    sectionId: "water",
    questionId: "dishwashing_method",
    score: 3,
    icon: "mdi-bowl-outline",
    text: "Mixing basin and running tap means the saving is inconsistent. Fill the basin before starting and commit to completing the full week using only that method.",
  },
  {
    sectionId: "water",
    questionId: "dishwashing_method",
    score: 2,
    icon: "mdi-bowl-outline",
    text: "Mostly using a running tap means each wash uses significantly more water than needed. Fill a bowl with soapy water first and wash everything in it. Use the running tap only to rinse at the end.",
  },
  {
    sectionId: "water",
    questionId: "dishwashing_method",
    score: 1,
    icon: "mdi-bowl-outline",
    text: "Always leaving the tap running throughout washing means up to 20 extra litres are used per session. Fill the sink or a large bowl before you start today.",
  },

  // laundry_method
  {
    sectionId: "water",
    questionId: "laundry_method",
    score: 5,
    icon: "mdi-washing-machine",
    text: "Full loads with rinse water reuse is the highest-efficiency laundry approach. Every drop of water used is maximised across the largest possible load.",
  },
  {
    sectionId: "water",
    questionId: "laundry_method",
    score: 4,
    icon: "mdi-washing-machine",
    text: "Always running full loads is strong. The next step is reusing the final rinse water for mopping or watering: that closes the last gap.",
  },
  {
    sectionId: "water",
    questionId: "laundry_method",
    score: 3,
    icon: "mdi-washing-machine",
    text: "Mixing full and partial loads means water use per garment varies widely. Check the load before starting: if it's not full, wait one more day. Partial loads use the same water as full ones.",
  },
  {
    sectionId: "water",
    questionId: "laundry_method",
    score: 2,
    icon: "mdi-washing-machine",
    text: "Small or single-item loads are the least efficient laundry habit. Place items in a basket and wait until it is full before washing. That one change cuts water and electricity use per garment significantly.",
  },
  {
    sectionId: "water",
    questionId: "laundry_method",
    score: 1,
    icon: "mdi-washing-machine",
    text: "Washing individual items under running water is the highest per-garment water use. Fill a bucket, collect a few items, and wash everything together. Do this once today to replace the running tap.",
  },

  // drinking_water_source
  {
    sectionId: "water",
    questionId: "drinking_water_source",
    score: 5,
    icon: "mdi-bottle-tonic-outline",
    text: "Using tap or filtered tap water consistently means you generate no plastic waste from drinking water and avoid the energy cost of bottled water production.",
  },
  {
    sectionId: "water",
    questionId: "drinking_water_source",
    score: 4,
    icon: "mdi-bottle-tonic-outline",
    text: "Mostly using tap with occasional bottled is close to the target. The gap is the travel situations. Keep a filled reusable bottle with you every time you leave home.",
  },
  {
    sectionId: "water",
    questionId: "drinking_water_source",
    score: 3,
    icon: "mdi-bottle-tonic-outline",
    text: "Equal tap and bottled means the refill habit isn't yet consistent. Fill your bottle as the last step before leaving home every morning. Place it next to your keys tonight.",
  },
  {
    sectionId: "water",
    questionId: "drinking_water_source",
    score: 2,
    icon: "mdi-bottle-tonic-outline",
    text: "Mostly bottled water generates hundreds of plastic bottles per year. Start refilling one bottle per morning before you leave. That one daily action replaces the first and most frequent bottled purchase.",
  },
  {
    sectionId: "water",
    questionId: "drinking_water_source",
    score: 1,
    icon: "mdi-bottle-tonic-outline",
    text: "Always using single-use bottled water is the highest-impact drinking water habit. Fill any bottle you own from the tap today and carry it. That one act starts the replacement.",
  },

  // leak_reporting
  {
    sectionId: "water",
    questionId: "leak_reporting",
    score: 5,
    icon: "mdi-pipe-leak",
    text: "Reporting immediately and following up means leaks are stopped rather than just noted. A dripping tap at 15 to 20 litres per day is fully preventable once reported and fixed.",
  },
  {
    sectionId: "water",
    questionId: "leak_reporting",
    score: 4,
    icon: "mdi-pipe-leak",
    text: "Reporting once is the most important step. The gap is follow-up: add a reminder for three days after reporting to check whether it was fixed.",
  },
  {
    sectionId: "water",
    questionId: "leak_reporting",
    score: 3,
    icon: "mdi-pipe-leak",
    text: "Informal mentions often don't reach the person who can act. A message to building management is what triggers a repair. One message, correctly addressed.",
  },
  {
    sectionId: "water",
    questionId: "leak_reporting",
    score: 2,
    icon: "mdi-pipe-leak",
    text: "Noticing but not reporting leaves the leak running. Find out who manages maintenance in your building and save their contact. The next time you notice a leak, you have nowhere to delay.",
  },
  {
    sectionId: "water",
    questionId: "leak_reporting",
    score: 1,
    icon: "mdi-pipe-leak",
    text: "Not paying attention to leaks means preventable water waste continues unaddressed. Notice one dripping tap or running pipe this week and report it to whoever is responsible for the building.",
  },

  // ─── WASTE ────────────────────────────────────────────────────────────────────

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

  // ─── DIGITAL ──────────────────────────────────────────────────────────────────

  // streaming_habits
  {
    sectionId: "digital",
    questionId: "streaming_habits",
    score: 5,
    icon: "mdi-video-off-outline",
    text: "Under one hour per day at SD or audio-only is the lowest-impact streaming pattern. Both duration and quality are at the right level.",
  },
  {
    sectionId: "digital",
    questionId: "streaming_habits",
    score: 4,
    icon: "mdi-video-off-outline",
    text: "One to two hours at SD quality manages quality correctly. The remaining gap is duration: consider replacing 15 minutes of video with audio-only to go further.",
  },
  {
    sectionId: "digital",
    questionId: "streaming_habits",
    score: 3,
    icon: "mdi-video-off-outline",
    text: "One to two hours at HD means quality is the primary issue. SD uses roughly 20 times less data per hour than HD with minimal visible difference for most content. Go into your app settings and change it now.",
  },
  {
    sectionId: "digital",
    questionId: "streaming_habits",
    score: 2,
    icon: "mdi-video-off-outline",
    text: "Three to four hours at HD is both high duration and high quality. Set a daily time limit and switch to SD in your app settings today. Either change alone reduces the footprint significantly.",
  },
  {
    sectionId: "digital",
    questionId: "streaming_habits",
    score: 1,
    icon: "mdi-video-off-outline",
    text: "4K streaming at over four hours per day transfers roughly 100 times the data of SD per hour. Switch your quality setting to SD now and set a daily time reminder. Both changes, today.",
  },

  // cloud_hygiene
  {
    sectionId: "digital",
    questionId: "cloud_hygiene",
    score: 5,
    icon: "mdi-delete-sweep-outline",
    text: "Regularly reviewing and deleting unused files keeps cloud storage lean and reduces the continuous server energy required to maintain it.",
  },
  {
    sectionId: "digital",
    questionId: "cloud_hygiene",
    score: 4,
    icon: "mdi-delete-sweep-outline",
    text: "Deleting occasionally when storage fills is reactive rather than proactive. Set a monthly calendar reminder for a cleanup so it happens on a schedule, not only when the storage notification appears.",
  },
  {
    sectionId: "digital",
    questionId: "cloud_hygiene",
    score: 3,
    icon: "mdi-delete-sweep-outline",
    text: "Rarely deleting means storage accumulates continuously. Set a monthly 15-minute calendar reminder now. That one recurring entry converts occasional awareness into action.",
  },
  {
    sectionId: "digital",
    questionId: "cloud_hygiene",
    score: 2,
    icon: "mdi-delete-sweep-outline",
    text: "Never deleting means storage grows indefinitely and cloud energy draw is at its maximum. Start with one focused session: delete your oldest or largest unused files today.",
  },
  {
    sectionId: "digital",
    questionId: "cloud_hygiene",
    score: 1,
    icon: "mdi-delete-sweep-outline",
    text: "Automatic backup across multiple accounts without review is one of the largest sources of unnecessary cloud load. Open one cloud folder this week and spend 10 minutes deleting what you no longer need.",
  },

  // email_hygiene
  {
    sectionId: "digital",
    questionId: "email_hygiene",
    score: 5,
    icon: "mdi-email-outline",
    text: "Regularly archiving, deleting, and unsubscribing means your inbox is actively managed rather than passively accumulating. Unsubscribing prevents emails from arriving rather than just deleting them after.",
  },
  {
    sectionId: "digital",
    questionId: "email_hygiene",
    score: 4,
    icon: "mdi-email-outline",
    text: "Periodically deleting spam and unnecessary emails is good active management. The remaining gap is mailing lists: unsubscribe from ones you no longer read to prevent them arriving in the first place.",
  },
  {
    sectionId: "digital",
    questionId: "email_hygiene",
    score: 3,
    icon: "mdi-email-outline",
    text: "Letting emails accumulate with occasional deletion means the inbox is growing faster than it's being cleared. Set a weekly 10-minute slot on the same day each week and unsubscribe from five mailing lists in that time.",
  },
  {
    sectionId: "digital",
    questionId: "email_hygiene",
    score: 2,
    icon: "mdi-email-outline",
    text: "Rarely deleting means your inbox holds years of emails that serve no function. Start in your promotions or newsletters folder: delete everything older than one month.",
  },
  {
    sectionId: "digital",
    questionId: "email_hygiene",
    score: 1,
    icon: "mdi-email-outline",
    text: "Never managing your inbox means storage and server load grow unchecked. Delete everything in your junk or promotional folder older than a month. That one action is the beginning.",
  },

  // intentional_use
  {
    sectionId: "digital",
    questionId: "intentional_use",
    score: 5,
    icon: "mdi-cellphone-off",
    text: "Using devices for specific purposes and closing apps when done means data transfer occurs only when you intend it. Passive scrolling generates continuous load that intentional use avoids.",
  },
  {
    sectionId: "digital",
    questionId: "intentional_use",
    score: 4,
    icon: "mdi-cellphone-off",
    text: "Mostly intentional use with occasional passive scrolling is close to the target. The gap is noticing when passive scrolling begins: a screen time daily summary makes that visible.",
  },
  {
    sectionId: "digital",
    questionId: "intentional_use",
    score: 3,
    icon: "mdi-cellphone-off",
    text: "Regular passive scrolling alongside intentional use means a significant portion of device time generates unnecessary data transfer. Set a daily screen time limit or a specific no-scroll window each day.",
  },
  {
    sectionId: "digital",
    questionId: "intentional_use",
    score: 2,
    icon: "mdi-cellphone-off",
    text: "Often scrolling without purpose means most of your device time is passive. Set a 20-minute daily limit for social media and browsing. Passive video scrolling in particular generates significant and unnecessary data load.",
  },
  {
    sectionId: "digital",
    questionId: "intentional_use",
    score: 1,
    icon: "mdi-cellphone-off",
    text: "Mostly passive and largely uncontrolled device use means the majority of your data and screen time is unintended. State a purpose before picking up your phone today. That one moment of intention is the start.",
  },

  // device_repair
  {
    sectionId: "digital",
    questionId: "device_repair",
    score: 5,
    icon: "mdi-tools",
    text: "Always choosing repair first extends device life and avoids repeating the manufacturing footprint (roughly 70 to 80 kg CO2 for a smartphone) for as long as the device functions.",
  },
  {
    sectionId: "digital",
    questionId: "device_repair",
    score: 4,
    icon: "mdi-tools",
    text: "Usually repairing minor issues and replacing only if unrepairable is a responsible pattern. The gap is the definition of unrepairable: get a second opinion from a local technician before concluding a device can't be fixed.",
  },
  {
    sectionId: "digital",
    questionId: "device_repair",
    score: 3,
    icon: "mdi-tools",
    text: "Trying repair once and replacing if it's not a quick fix means many repairable devices are discarded. Check repair cafes or local technicians: many repairs that appear complex are straightforward and cheap.",
  },
  {
    sectionId: "digital",
    questionId: "device_repair",
    score: 2,
    icon: "mdi-tools",
    text: "Replacing because repair seems too complicated or expensive is a decision often made without getting a quote. Consult a local repair technician before your next replacement: battery repairs in particular are usually fast and inexpensive.",
  },
  {
    sectionId: "digital",
    questionId: "device_repair",
    score: 1,
    icon: "mdi-tools",
    text: "Replacing immediately at every upgrade opportunity means devices are discarded with most of their life unused. Skip one upgrade cycle and get a repair quote on your current device first.",
  },
];

// ─── Pipeline types ───────────────────────────────────────────────────────────

export interface SortedQuestion {
  sectionId: string;
  questionId: string;
  score: 1 | 2 | 3 | 4 | 5;
}

// ─── Step 2 — getSortedQuestions ─────────────────────────────────────────────

/**
 * Flatten all answers and sort them worst → best:
 *   primary   — section order from getSortedSections (weakest section first)
 *   secondary — score ascending within each section
 */
export function getSortedQuestions(
  answers: Partial<Record<string, Record<string, number>>>,
  sortedSections: Array<{ meta: SectionMeta; scaled: number }>,
): SortedQuestion[] {
  const sectionOrder = new Map(sortedSections.map((r, i) => [r.meta.id, i]));

  const all = Object.entries(answers).flatMap(([sectionId, qs]) =>
    Object.entries(qs ?? {}).map(([questionId, score]) => ({
      sectionId,
      questionId,
      score: score as 1 | 2 | 3 | 4 | 5,
    })),
  );

  return all.sort((a, b) => {
    const orderA = sectionOrder.get(a.sectionId) ?? Infinity;
    const orderB = sectionOrder.get(b.sectionId) ?? Infinity;
    if (orderA !== orderB) return orderA - orderB;
    return a.score - b.score;
  });
}

// ─── Step 4 — getInsightsForAssessment ───────────────────────────────────────

/**
 * Pick exactly 5 insights from the sorted question pool.
 *
 * Slots 1–4 — section-aware allocation:
 *   default (0 weak) → treat as broad, using sortedQuestions section order
 *   focused (1 weak) → 4 from section 1
 *   dual    (2 weak) → 2 from section 1, 2 from section 2
 *   broad   (3+ weak)→ 2 from section 1, 1 from section 2, 1 from section 3
 *
 * Slot 5 — search remaining pool strongest → weakest for score >= 4.
 *   Found     → that question (renders green in the view via score check)
 *   Not found → worst remaining question (renders default)
 *
 * No isAffirmation flag. The view checks score >= 4 for colour directly.
 */
export function getInsightsForAssessment(
  sortedQuestions: SortedQuestion[],
  weakSections: string[],
): QuestionInsight[] {
  if (sortedQuestions.length === 0) return [];

  const key = (q: SortedQuestion) => `${q.sectionId}::${q.questionId}`;

  // Derive section priority from sortedQuestions for the default (0 weak) case.
  // sortedQuestions is already weakest-section-first so unique section order is correct.
  const sectionOrder = [...new Set(sortedQuestions.map((q) => q.sectionId))];
  const prioritySections = weakSections.length > 0 ? weakSections : sectionOrder;

  const used = new Set<string>();

  function pickFromSection(sectionId: string, n: number): SortedQuestion[] {
    const result: SortedQuestion[] = [];
    for (const q of sortedQuestions) {
      if (result.length >= n) break;
      if (q.sectionId === sectionId && !used.has(key(q))) {
        result.push(q);
        used.add(key(q));
      }
    }
    return result;
  }

  const slots: SortedQuestion[] = [];

  if (weakSections.length === 1) {
    // focused: 4 from the one weak section
    slots.push(...pickFromSection(prioritySections[0]!, 4));
  } else if (weakSections.length === 2) {
    // dual: 2 + 2
    slots.push(...pickFromSection(prioritySections[0]!, 2));
    slots.push(...pickFromSection(prioritySections[1]!, 2));
  } else {
    // broad (3+ weak) or default (0 weak treated as broad): 2 + 1 + 1
    slots.push(...pickFromSection(prioritySections[0]!, 2));
    slots.push(...pickFromSection(prioritySections[1]!, 1));
    slots.push(...pickFromSection(prioritySections[2]!, 1));
  }

  // Slot 5: remaining pool, iterated strongest → weakest
  const remaining = sortedQuestions.filter((q) => !used.has(key(q))).reverse();
  const affirmation = remaining.find((q) => q.score >= 4) ?? remaining[remaining.length - 1];
  if (affirmation) slots.push(affirmation);

  // Resolve slots to QuestionInsight entries
  return slots.flatMap(({ sectionId, questionId, score }) => {
    const insight = QUESTION_INSIGHTS.find(
      (i) => i.sectionId === sectionId && i.questionId === questionId && i.score === score,
    );
    return insight ? [insight] : [];
  });
}
