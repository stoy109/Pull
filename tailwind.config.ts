const config = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          50: "var(--color-primary-50)",
          100: "var(--color-primary-100)",
          200: "var(--color-primary-200)",
          300: "var(--color-primary-300)",
          400: "var(--color-primary-400)",
          500: "var(--color-primary-500)",
          600: "var(--color-primary-600)",
          700: "var(--color-primary-700)",
          800: "var(--color-primary-800)",
          900: "var(--color-primary-900)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          50: "var(--color-secondary-50)",
          100: "var(--color-secondary-100)",
          200: "var(--color-secondary-200)",
          300: "var(--color-secondary-300)",
          400: "var(--color-secondary-400)",
          500: "var(--color-secondary-500)",
          600: "var(--color-secondary-600)",
          700: "var(--color-secondary-700)",
          800: "var(--color-secondary-800)",
          900: "var(--color-secondary-900)",
        },
        accent: {
          green: "var(--color-accent-green)",
          yellow: "var(--color-accent-yellow)",
          orange: "var(--color-accent-orange)",
          red: "var(--color-accent-red)",
        },
        background: "var(--color-background)",
        surface: {
          DEFAULT: "var(--color-surface)",
          muted: "var(--color-surface-muted)",
          inverse: "var(--color-surface-inverse)",
        },
        foreground: "var(--color-foreground)",
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          muted: "var(--color-text-muted)",
          inverse: "var(--color-text-inverse)",
        },
        border: {
          DEFAULT: "var(--color-border)",
          muted: "var(--color-border-muted)",
        },
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
      },
      fontFamily: {
        sans: ["Lato", "Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        heading: [
          "var(--typography-heading-size)",
          {
            lineHeight: "var(--typography-heading-line-height)",
            fontWeight: "var(--font-weight-heading)",
          },
        ],
        subheading: [
          "var(--typography-subheading-size)",
          {
            lineHeight: "var(--typography-subheading-line-height)",
            fontWeight: "var(--font-weight-subheading)",
          },
        ],
        body: [
          "var(--typography-body-size)",
          {
            lineHeight: "var(--typography-body-line-height)",
            fontWeight: "var(--font-weight-body)",
          },
        ],
      },
    },
  },
};

export default config;
