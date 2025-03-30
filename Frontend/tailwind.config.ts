import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      screens: {
        sm: "576px",
        md: "768px",
        lg: "992px",
        xl: "1200px",
        xxl: "1400px",
        "3xl": "1600px",
        "4xl": "1800px",
      },
      colors: {
        n0: "#1D1E24",
        n30: "#EBECED",
        lightN30: "#373D4B",
        lightBg1: "#23262B",
        n100: "#7B8088",
        n200: "#6D717B",
        n300: "#5E636E",
        n400: "#525763",
        lightN400: "#C2C4C8",
        n500: "#434956",
        n700: "#262D3B",

        primaryColor: "rgb(77, 107, 254)",
        secondaryColor: "rgb(142, 51, 255)",
        errorColor: "rgb(255, 86, 48)",
        warningColor: "rgb(255, 171, 0)",
        successColor: "rgb(34, 197, 94)",
        infoColor: "rgb(0, 184, 217)",
      },
      padding: {
        "25": "100px",
        "30": "120px",
        "15": "60px",
      },
    },
  },
  plugins: [],
} satisfies Config;
