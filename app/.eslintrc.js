module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'jsx-a11y',
    'import',
    'prettier',
    'boundaries',
  ],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
    'boundaries/elements': [
      {
        type: 'api',
        pattern: 'src/api/*',
      },
      {
        type: 'shared',
        pattern: 'src/shared/*',
      },
      {
        type: 'modules',
        pattern: 'src/modules/*',
      },
      {
        type: 'auth',
        pattern: 'src/auth/*',
      },
      {
        type: 'user',
        pattern: 'src/user/*',
      },
      {
        type: 'client',
        pattern: 'src/client/*',
      },
      {
        type: 'server',
        pattern: 'src/server/*',
      },
    ],
    'boundaries/ignore': ['**/*.test.*', '**/*.spec.*', '**/*.stories.*'],
  },
  rules: {
    // General ESLint rules
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'no-unused-vars': 'off', // Handled by TypeScript
    'no-undef': 'off', // Handled by TypeScript
    
    // TypeScript rules
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/no-empty-function': 'warn',
    '@typescript-eslint/ban-ts-comment': 'warn',
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    
    // React rules
    'react/react-in-jsx-scope': 'off', // Not needed in React 17+
    'react/prop-types': 'off', // We use TypeScript for prop validation
    'react/jsx-uses-react': 'off', // Not needed in React 17+
    'react/jsx-props-no-spreading': 'off', // Allow JSX props spreading
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // Import rules
    'import/no-unresolved': 'error',
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
        pathGroups: [
          {
            pattern: 'react',
            group: 'builtin',
            position: 'before',
          },
          {
            pattern: 'wasp/**',
            group: 'external',
            position: 'before',
          },
          {
            pattern: '@src/**',
            group: 'internal',
            position: 'after',
          },
        ],
        pathGroupsExcludedImportTypes: ['react'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    
    // Architectural boundaries rules
    'boundaries/element-types': [
      'error',
      {
        default: 'allow',
        rules: [
          // Shared can be imported by any module
          { from: ['api', 'modules', 'auth', 'user', 'client', 'server'], to: ['shared'], allow: true },
          
          // API can be imported by modules, auth, user, client, server
          { from: ['modules', 'auth', 'user', 'client', 'server'], to: ['api'], allow: true },
          
          // Modules should not import from each other
          { from: ['modules'], to: ['modules'], allow: false },
          
          // Client should not import server code
          { from: ['client'], to: ['server'], allow: false },
          
          // Server should not import client code
          { from: ['server'], to: ['client'], allow: false },
        ],
      },
    ],
    
    // Prettier rules
    'prettier/prettier': ['error', {}, { usePrettierrc: true }],
  },
  overrides: [
    {
      files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
      env: {
        jest: true,
      },
      extends: ['plugin:testing-library/react', 'plugin:jest-dom/recommended'],
    },
    {
      files: ['**/*.stories.{ts,tsx}'],
      extends: ['plugin:storybook/recommended'],
    },
  ],
};
