// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';
import eslintConfigPrettier from 'eslint-config-prettier';

export default withNuxt(
  // Disable formatting-related rules that would conflict with Prettier.
  // Prettier handles all whitespace/quotes/etc., ESLint handles semantics.
  eslintConfigPrettier,
);
