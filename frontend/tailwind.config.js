/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#1a365d",          // 深藏蓝 - 书籍感
        "primary-light": "#2b4c7e",    // 浅一档
        "accent": "#c05621",           // 琥珀橙 - 温暖强调
        "accent-light": "#dd6b20",     // 浅琥珀
        "warm": "#d69e2e",             // 金色 - 高级感
        "warm-light": "#ecc94b",       // 浅金
        "surface-light": "#faf9f7",    // 米白 - 纸质感
        "surface-dark": "#1a1a2e",     // 深藏蓝黑
        "background-light": "#f5f3ef", // 温暖米灰
        "background-dark": "#111118",  // 近黑
        "ink": "#2d3748",              // 墨色文字
        "ink-light": "#4a5568",        // 浅墨
        "paper": "#fffef9",            // 纸张白
      },
      fontFamily: {
        "display": ["'Playfair Display'", "Georgia", "serif"],
        "body": ["'DM Sans'", "system-ui", "sans-serif"],
      },
      borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "fade-up": "fadeUp 0.6s ease-out",
        "slide-in": "slideIn 0.4s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s infinite",
        "stagger-1": "fadeUp 0.6s ease-out 0.1s both",
        "stagger-2": "fadeUp 0.6s ease-out 0.2s both",
        "stagger-3": "fadeUp 0.6s ease-out 0.3s both",
        "stagger-4": "fadeUp 0.6s ease-out 0.4s both",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
}
