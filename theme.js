// theme.js
// This file holds all the colors, font sizes, and spacing for the entire app.
// Think of it as a style guide — one place to control the whole look.

export const theme = {
  colors: {
    background: '#0A0A0A',       // near-black background
    surface: '#141414',          // slightly lighter card background
    surfaceAlt: '#1C1C1C',       // even lighter for inputs
    text: '#FFFFFF',             // pure white for main text
    textSecondary: '#5A5A5A',    // grey for labels and hints
    textMuted: '#2E2E2E',        // very dark grey for subtle lines
    accent: '#F0EBE3',           // warm off-white accent
    tabActive: '#FFFFFF',        // active tab color
    tabInactive: '#3A3A3A',      // inactive tab color
    border: '#1E1E1E',           // subtle border between elements
  },
  fontSize: {
    massive: 56,    // the big hero number / heading
    large: 32,      // section titles
    medium: 18,     // card titles, labels
    small: 13,      // hints, captions, uppercase labels
    tiny: 11,       // very small supporting text
  },
  spacing: {
    xs: 8,
    sm: 16,
    md: 24,
    lg: 36,
    xl: 52,
  },
  radius: {
    sm: 10,
    md: 18,
    lg: 26,
  },
};
