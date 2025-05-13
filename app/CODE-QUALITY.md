# Code Quality Tools

This document outlines the code quality tools and standards used in the Cauldron application.

## Tools

### ESLint

ESLint is used to enforce code style and catch potential issues. The configuration is in `.eslintrc.js`.

```bash
# Run ESLint
npm run lint

# Fix ESLint issues
npm run lint:fix
```

### Prettier

Prettier is used to format code consistently. The configuration is in `.prettierrc`.

```bash
# Format code
npm run format

# Check if code is formatted correctly
npm run format:check
```

### Stylelint

Stylelint is used to enforce CSS style and catch potential issues. The configuration is in `.stylelintrc.js`.

```bash
# Run Stylelint
npm run lint:css

# Fix Stylelint issues
npm run lint:css:fix
```

### TypeScript

TypeScript is configured with strict mode and additional strict checks to catch type errors. The configuration is in `tsconfig.json`.

```bash
# Type check
npm run type-check
```

### Dependency Cruiser

Dependency Cruiser is used to enforce architectural boundaries and prevent circular dependencies. The configuration is in `.dependency-cruiser.js`.

```bash
# Check dependencies
npm run deps:check
```

### Husky and lint-staged

Husky and lint-staged are used to run linters and formatters on staged files before committing. The configuration is in `.husky/pre-commit` and `.lintstagedrc.js`.

## Architectural Boundaries

The codebase is organized into the following layers:

- `src/shared`: Shared code that can be imported by any module
- `src/api`: API routes and middleware
- `src/modules`: Feature modules
- `src/auth`: Authentication
- `src/user`: User management
- `src/client`: Client-side code
- `src/server`: Server-side code

The following architectural boundaries are enforced:

1. Shared code can be imported by any module
2. API code can be imported by feature modules, auth, user, client, and server
3. Feature modules should not import from each other
4. Client code should not import server code
5. Server code should not import client code

## Code Style Guidelines

### General

- Use consistent naming conventions
- Keep functions and components small and focused
- Write meaningful comments and documentation
- Use TypeScript types and interfaces
- Avoid any and unknown types when possible
- Use async/await instead of promises
- Use destructuring for props and state
- Use named exports instead of default exports
- Use functional components with hooks

### React

- Use functional components with hooks
- Use TypeScript for prop types
- Use the React Context API for global state
- Use custom hooks for reusable logic
- Use the useCallback and useMemo hooks for performance optimization
- Use the useEffect hook for side effects
- Use the useState hook for local state
- Use the useRef hook for DOM references

### CSS

- Use Tailwind CSS for styling
- Use the cn utility for conditional class names
- Use CSS variables for theming
- Use responsive design
- Use dark mode support

## VSCode Integration

The project includes VSCode settings and extension recommendations to ensure a consistent development experience. The configuration is in `.vscode/settings.json` and `.vscode/extensions.json`.

The following features are enabled:

- Format on save
- ESLint and Stylelint auto-fix on save
- TypeScript language server
- Tailwind CSS IntelliSense
- Prettier as the default formatter
