module.exports = {
    root: true,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
    },
    settings: {
      cache: false,
      react: {
        version: 'detect',
      },
    },
    env: {
      es2022: true,
    },
    extends: [
      'eslint:recommended',
    ],
    plugins: [
      'react',
    ],
    rules: {
      'no-unused-vars': ['warn', { "argsIgnorePattern": "^_" }],
    },
    overrides: [
      {
        files: ['./**/*.{js,jsx}'],
        env: {
          browser: true,
        },
        extends: [
          'plugin:react/recommended',
          'plugin:react/jsx-runtime',
        ],
        rules: {
          'react/display-name': 'warn',
          'react/prop-types': 'warn',
        },
      },
      {
        files: ['./**/*.{js,ts}'],
        env: {
          node: true,
        },
        rules: {
          // Server-specific rules
        },
      }
    ],
    ignorePatterns: ["**/__tests__/**"]
  };
