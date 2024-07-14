module.exports = {
    root: true,
    parserOptions: {
      ecmaVersion: 2021,
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
      es2021: true,
    },
    extends: [
      'eslint:recommended',
    ],
    plugins: [
      'react',
    ],
    rules: {
      'no-unused-vars': 'warn',
    },
    overrides: [
      {
        files: ['client/src/**/*.{js,jsx}'],
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
        files: ['server/**/*.{js,ts}'],
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
