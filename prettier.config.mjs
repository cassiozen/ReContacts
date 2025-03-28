/** @type {import("prettier").Config} */
const config = {
  printWidth: 120,
  trailingComma: "es5",
  plugins: ["prettier-plugin-organize-imports", "prettier-plugin-tailwindcss"],
};

export default config;
