import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import storybook from 'eslint-plugin-storybook';

const eslintConfig = [
  {
    ignores: [
      'node_modules/',
      '.next/',
      'out/',
      'build/',
      'dist/',
      'coverage/',
      'storybook-static/',
      'src/types/generated/',
      // Serwist-generated service worker bundle (see next.config.ts swDest);
      // gitignored build artifact, not hand-authored source.
      'public/sw.js',
      'public/sw.js.map',
      'public/swe-worker-*.js',
      'public/swe-worker-*.js.map',
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  ...storybook.configs['flat/recommended'],
  {
    // Honor the `_`-prefix convention for intentionally-unused bindings
    // (standard typescript-eslint escape hatch; matches prior config behavior).
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    // Test and story scaffolding relies on `any` for mock props, DOM event
    // casts (e.g. beforeinstallprompt), and mock-call inspection. Production
    // source keeps `no-explicit-any` as an error.
    files: [
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.stories.tsx',
      'tests/**/*.ts',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    // Node CommonJS tooling scripts legitimately use require().
    files: ['scripts/**/*.js'],
    languageOptions: {
      globals: {
        require: 'readonly',
        module: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        console: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];

export default eslintConfig;
