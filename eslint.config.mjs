import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      '.vercel/**',
      'playwright-report/**',
      'test-results/**',
      'dist/**',
      'scripts/**',
      '**/*.md',
      'docs/**',
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Allow 'any' in type definitions, generic components, and API routes where flexibility is needed
      '@typescript-eslint/no-explicit-any': 'off',
      // Allow require imports in specific cases (petition templates use dynamic requires)
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];

export default eslintConfig;
