/**
 * Theme configuration for Saraswati School Digital Haven
 * This file contains the school's brand colors and theme settings
 */

export const schoolColors = {
  // Primary color - Educational blue
  primary: {
    DEFAULT: "hsl(214, 84%, 56%)", // Main blue
    light: "hsl(214, 84%, 70%)",   // Lighter shade
    dark: "hsl(214, 84%, 40%)",    // Darker shade
    foreground: "hsl(0, 0%, 100%)", // White text on blue
  },
  
  // Secondary color - Educational green
  secondary: {
    DEFAULT: "hsl(158, 64%, 52%)", // Main green
    light: "hsl(158, 64%, 65%)",   // Lighter shade
    dark: "hsl(158, 64%, 40%)",    // Darker shade
    foreground: "hsl(0, 0%, 100%)", // White text on green
  },
  
  // Accent colors
  accent: {
    DEFAULT: "hsl(45, 100%, 60%)", // Gold accent
    foreground: "hsl(0, 0%, 20%)", // Dark text on gold
  },
  
  // Background colors
  background: {
    DEFAULT: "hsl(0, 0%, 100%)", // White in light mode
    dark: "hsl(222, 47%, 11%)",  // Dark blue in dark mode
  },
  
  // Text colors
  text: {
    primary: "hsl(222, 47%, 11%)",     // Dark blue-gray for main text
    secondary: "hsl(215, 16%, 47%)",   // Medium blue-gray for secondary text
    muted: "hsl(215, 16%, 65%)",       // Light blue-gray for muted text
  }
};

// Gradient definitions
export const gradients = {
  // Hero gradient - combines primary and secondary colors
  hero: "linear-gradient(135deg, hsl(214, 84%, 56%) 0%, hsl(158, 64%, 52%) 100%)",
  
  // Subtle gradient for backgrounds
  subtle: "linear-gradient(180deg, hsl(214, 84%, 97%) 0%, hsl(0, 0%, 100%) 100%)",
  
  // Text gradient for headings
  text: "linear-gradient(90deg, hsl(214, 84%, 56%) 0%, hsl(158, 64%, 52%) 100%)",
};

// Shadow styles
export const shadows = {
  soft: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  medium: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  hard: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
};

// Animation timing
export const animations = {
  fast: "150ms",
  normal: "250ms",
  slow: "350ms",
};