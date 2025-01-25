/** @type {import('prettier').Options & import("@ianvs/prettier-plugin-sort-imports").PrettierConfig} */
module.exports = {
  singleQuote: true,
  // I don't like commas everywhere, so... yes.
  // https://prettier.io/blog/2023/07/05/3.0.0.html#javascript
  trailingComma: "es5",
  importOrder: [
    // Built-in Node.js and npm modules
    "<THIRD_PARTY_MODULES>",
    "",
    // Relative imports
    "^[.]",
  ],
  importOrderTypeScriptVersion: "5.7.3",
  plugins: ["@ianvs/prettier-plugin-sort-imports"],
};
