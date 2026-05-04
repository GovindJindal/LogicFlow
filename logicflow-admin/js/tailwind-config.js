tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "outline-variant": "#c3c7c8",
        "error-container": "#ffdad6",
        "surface-container-lowest": "#ffffff",
        "surface-container": "#eceef3",
        "on-error-container": "#93000a",
        "on-error": "#ffffff",
        "surface-tint": "#546163",
        "outline": "#737879",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#f8b9c2",
        "primary-fixed-dim": "#bbc9cb",
        "on-background": "#191c20",
        "on-surface-variant": "#424848",
        "on-secondary-container": "#576959",
        "surface-bright": "#f8f9ff",
        "tertiary": "#5c3139",
        "inverse-surface": "#2e3135",
        "primary": "#334042",
        "on-tertiary-fixed-variant": "#673a42",
        "surface-dim": "#d8dae0",
        "surface-container-low": "#f2f3f9",
        "primary-fixed": "#d7e5e7",
        "tertiary-container": "#77474f",
        "background": "#f8f9ff",
        "secondary-container": "#d3e8d4",
        "inverse-primary": "#bbc9cb",
        "surface-container-high": "#e7e8ee",
        "on-primary-container": "#beccce",
        "surface-container-highest": "#e1e2e8",
        "on-primary-fixed-variant": "#3c494b",
        "surface": "#f8f9ff",
        "on-primary-fixed": "#111e1f",
        "secondary-fixed": "#d3e8d4",
        "surface-variant": "#e1e2e8",
        "secondary-fixed-dim": "#b8ccb9",
        "on-secondary": "#ffffff",
        "secondary": "#516353",
        "on-surface": "#191c20",
        "on-secondary-fixed-variant": "#394b3c",
        "inverse-on-surface": "#eff0f6",
        "on-tertiary-fixed": "#330f17",
        "primary-container": "#4a5759",
        "on-secondary-fixed": "#0e1f13",
        "tertiary-fixed": "#ffd9de",
        "on-primary": "#ffffff",
        "tertiary-fixed-dim": "#f5b6bf",
        "error": "#ba1a1a"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1rem",
        "full": "9999px"
      },
      spacing: {
        "xs": "8px",
        "gutter": "24px",
        "base": "4px",
        "md": "24px",
        "xl": "64px",
        "sm": "16px",
        "lg": "40px",
        "container-max": "1440px"
      },
      fontFamily: {
        "body-md": ["Manrope"],
        "code-md": ["Space Grotesk"],
        "headline-md": ["Manrope"],
        "label-sm": ["Space Grotesk"],
        "display-lg": ["Manrope"]
      },
      fontSize: {
        "body-md": ["16px", { lineHeight: "1.6", letterSpacing: "0", fontWeight: "400" }],
        "code-md": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        "headline-md": ["24px", { lineHeight: "1.4", letterSpacing: "-0.01em", fontWeight: "700" }],
        "label-sm": ["12px", { lineHeight: "1.2", letterSpacing: "0.05em", fontWeight: "500" }],
        "display-lg": ["48px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "800" }]
      }
    }
  }
};
