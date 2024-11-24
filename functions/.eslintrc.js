module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "object-curly-spacing": ["error", "always"],
    "eol-last": ["error", "always"],
    "@typescript-eslint/no-unused-vars": ["error"],
    "@typescript-eslint/no-require-imports": ["error"],
  },
};
