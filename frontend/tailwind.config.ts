import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0093D6",
          light: "#4FB4E3",
        },
        pink: {
          DEFAULT: "#EC1886",
          light: "#F05AA4",
        },
      },
    },
  },
  plugins: [],
};

export default config;
