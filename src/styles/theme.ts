export const theme = {
  defaultTheme: "light",
  themes: {
    // ── LIGHT ────────────────────────────────────────────────────────────────
    light: {
      dark: false,
      colors: {
        primary: "#0C6B59",
        secondary: "#4B635C",
        tertiary: "#426277",
        error: "#BA1A1A",

        background: "#F5FBF7",
        surface: "#F5FBF7",
        "surface-bright": "#F5FBF7",
        "surface-light": "#EFF5F1", // surfaceContainerLow
        "surface-variant": "#DEE4E0", // surfaceContainerHighest
        "on-surface-variant": "#3F4945",

        outline: "#6F7975",
        "outline-variant": "#BFC9C4",

        "inverse-surface": "#2B322F",
        "inverse-on-surface": "#ECF2EE",
        "inverse-primary": "#85D6BF",

        info: "#426277", // tertiary
        success: "#0C6B59", // primary
        warning: "#7A5900", // ⚠️ manual — no M3 token

        "primary-container": "#A1F2DB",
        "on-primary-container": "#005142",
        "secondary-container": "#CDE9DF",
        "on-secondary-container": "#334C44",
        "tertiary-container": "#C6E7FF",
        "on-tertiary-container": "#294A5E",
        "error-container": "#FFDAD6",
        "on-error-container": "#93000A",
      },
    },

    // ── LIGHT MEDIUM CONTRAST ────────────────────────────────────────────────
    "light-medium-contrast": {
      dark: false,
      colors: {
        primary: "#003E33",
        secondary: "#233B34",
        tertiary: "#173A4D",
        error: "#740006",

        background: "#F5FBF7",
        surface: "#F5FBF7",
        "surface-bright": "#F5FBF7",
        "surface-light": "#EFF5F1",
        "surface-variant": "#CDD3CF", // surfaceContainerHighest (MC)
        "on-surface-variant": "#2F3835",

        outline: "#4B5551",
        "outline-variant": "#656F6B",

        "inverse-surface": "#2B322F",
        "inverse-on-surface": "#ECF2EE",
        "inverse-primary": "#85D6BF",

        info: "#173A4D",
        success: "#003E33",
        warning: "#7A5900", // ⚠️ manual

        "primary-container": "#257A67",
        "on-primary-container": "#FFFFFF",
        "secondary-container": "#59726A",
        "on-secondary-container": "#FFFFFF",
        "tertiary-container": "#517186",
        "on-tertiary-container": "#FFFFFF",
        "error-container": "#CF2C27",
        "on-error-container": "#FFFFFF",
      },
    },

    // ── LIGHT HIGH CONTRAST ──────────────────────────────────────────────────
    "light-high-contrast": {
      dark: false,
      colors: {
        primary: "#003329",
        secondary: "#19302A",
        tertiary: "#092F42",
        error: "#600004",

        background: "#F5FBF7",
        surface: "#F5FBF7",
        "surface-bright": "#F5FBF7",
        "surface-light": "#ECF2EE",
        "surface-variant": "#C2C8C4", // surfaceContainerHighest (HC)
        "on-surface-variant": "#000000",

        outline: "#252E2B",
        "outline-variant": "#424B48",

        "inverse-surface": "#2B322F",
        "inverse-on-surface": "#FFFFFF",
        "inverse-primary": "#85D6BF",

        info: "#092F42",
        success: "#003329",
        warning: "#7A5900", // ⚠️ manual

        "primary-container": "#005345",
        "on-primary-container": "#FFFFFF",
        "secondary-container": "#364E47",
        "on-secondary-container": "#FFFFFF",
        "tertiary-container": "#2C4D61",
        "on-tertiary-container": "#FFFFFF",
        "error-container": "#98000A",
        "on-error-container": "#FFFFFF",
      },
    },

    // ── DARK ─────────────────────────────────────────────────────────────────
    dark: {
      dark: true,
      colors: {
        primary: "#85D6BF",
        secondary: "#B1CCC3",
        tertiary: "#A9CBE3",
        error: "#FFB4AB",

        background: "#0E1513",
        surface: "#0E1513",
        "surface-bright": "#343B38",
        "surface-light": "#171D1B", // surfaceContainerLow
        "surface-variant": "#303634", // surfaceContainerHighest
        "on-surface-variant": "#BFC9C4",

        outline: "#89938F",
        "outline-variant": "#3F4945",

        "inverse-surface": "#DEE4E0",
        "inverse-on-surface": "#2B322F",
        "inverse-primary": "#0C6B59",

        info: "#A9CBE3",
        success: "#85D6BF",
        warning: "#F5C842", // ⚠️ manual

        "primary-container": "#005142",
        "on-primary-container": "#A1F2DB",
        "secondary-container": "#334C44",
        "on-secondary-container": "#CDE9DF",
        "tertiary-container": "#294A5E",
        "on-tertiary-container": "#C6E7FF",
        "error-container": "#93000A",
        "on-error-container": "#FFDAD6",
      },
    },

    // ── DARK MEDIUM CONTRAST ─────────────────────────────────────────────────
    "dark-medium-contrast": {
      dark: true,
      colors: {
        primary: "#9BECD5",
        secondary: "#C7E2D8",
        tertiary: "#BFE1FA",
        error: "#FFD2CC",

        background: "#0E1513",
        surface: "#0E1513",
        "surface-bright": "#3F4643",
        "surface-light": "#191F1D", // surfaceContainerLow
        "surface-variant": "#393F3C", // surfaceContainerHighest
        "on-surface-variant": "#D4DFDA",

        outline: "#AAB4B0",
        "outline-variant": "#88938E",

        "inverse-surface": "#DEE4E0",
        "inverse-on-surface": "#252B29",
        "inverse-primary": "#005243",

        info: "#BFE1FA",
        success: "#9BECD5",
        warning: "#F5C842", // ⚠️ manual

        "primary-container": "#4E9F8A",
        "on-primary-container": "#000000",
        "secondary-container": "#7C968E",
        "on-secondary-container": "#000000",
        "tertiary-container": "#7495AC",
        "on-tertiary-container": "#000000",
        "error-container": "#FF5449",
        "on-error-container": "#000000",
      },
    },

    // ── DARK HIGH CONTRAST ───────────────────────────────────────────────────
    "dark-high-contrast": {
      dark: true,
      colors: {
        primary: "#B3FFE9",
        secondary: "#DBF6EC",
        tertiary: "#E3F2FF",
        error: "#FFECE9",

        background: "#0E1513",
        surface: "#0E1513",
        "surface-bright": "#4B514F",
        "surface-light": "#1B211F", // surfaceContainerLow
        "surface-variant": "#424846", // surfaceContainerHighest
        "on-surface-variant": "#FFFFFF",

        outline: "#E8F2ED",
        "outline-variant": "#BBC5C0",

        "inverse-surface": "#DEE4E0",
        "inverse-on-surface": "#000000",
        "inverse-primary": "#005243",

        info: "#E3F2FF",
        success: "#B3FFE9",
        warning: "#F5C842", // ⚠️ manual

        "primary-container": "#82D2BC",
        "on-primary-container": "#000E0A",
        "secondary-container": "#AEC8BF",
        "on-secondary-container": "#000E0A",
        "tertiary-container": "#A6C7DF",
        "on-tertiary-container": "#000D16",
        "error-container": "#FFAEA4",
        "on-error-container": "#220001",
      },
    },
  },
};
