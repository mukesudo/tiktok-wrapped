import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "0.35", transform: "scale(0.98)" },
          "50%": { opacity: "0.75", transform: "scale(1.02)" }
        },
        "bar-dance": {
          "0%, 100%": { transform: "scaleY(0.35)" },
          "50%": { transform: "scaleY(1)" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        }
      },
      animation: {
        "pulse-glow": "pulse-glow 2.2s ease-in-out infinite",
        "bar-dance": "bar-dance 1.2s ease-in-out infinite",
        float: "float 5s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
