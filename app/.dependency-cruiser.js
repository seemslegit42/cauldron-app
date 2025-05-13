/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular dependencies are not allowed',
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: 'no-orphans',
      severity: 'warn',
      comment: 'Orphaned modules (not referenced by any other module) should be avoided',
      from: {
        orphan: true,
        pathNot: [
          '(^|/)\\.[^/]+\\.(js|cjs|mjs|ts|json)$', // dot files
          '\\.d\\.ts$',                            // TypeScript declaration files
          '(^|/)tsconfig\\.json$',                 // TypeScript config
          '(^|/)(babel|webpack)\\.config\\.(js|cjs|mjs|ts|json)$', // build config
          '(^|/)jest\\.config\\.(js|cjs|mjs|ts|json)$',           // test config
          '(^|/)vite\\.config\\.(js|cjs|mjs|ts|json)$',           // vite config
        ],
      },
      to: {},
    },
    {
      name: 'shared-can-be-imported-by-any-module',
      comment: 'Shared modules can be imported by any module',
      severity: 'info',
      from: {},
      to: {
        path: '^src/shared/',
      },
    },
    {
      name: 'api-can-be-imported-by-modules',
      comment: 'API modules can be imported by feature modules, auth, user, client, server',
      severity: 'error',
      from: {
        pathNot: [
          '^src/modules/',
          '^src/auth/',
          '^src/user/',
          '^src/client/',
          '^src/server/',
          '^src/api/',
          '^src/shared/',
        ],
      },
      to: {
        path: '^src/api/',
      },
    },
    {
      name: 'modules-should-not-import-from-each-other',
      comment: 'Feature modules should not import from each other',
      severity: 'error',
      from: {
        path: '^src/modules/([^/]+)/',
      },
      to: {
        path: '^src/modules/([^/]+)/',
        pathNot: [
          // Allow a module to import from itself
          '^src/modules/$1/',
        ],
      },
    },
    {
      name: 'client-should-not-import-server',
      comment: 'Client code should not import server code',
      severity: 'error',
      from: {
        path: '^src/client/',
      },
      to: {
        path: '^src/server/',
      },
    },
    {
      name: 'server-should-not-import-client',
      comment: 'Server code should not import client code',
      severity: 'error',
      from: {
        path: '^src/server/',
      },
      to: {
        path: '^src/client/',
      },
    },
    {
      name: 'no-deprecated-core',
      comment: 'Deprecated core modules should not be used',
      severity: 'warn',
      from: {},
      to: {
        dependencyTypes: [
          'core',
        ],
        path: '^(punycode|domain|constants|sys|querystring)$',
      },
    },
    {
      name: 'no-non-package-json',
      severity: 'error',
      comment: 'Don\'t allow dependencies to packages not in package.json',
      from: {},
      to: {
        dependencyTypes: [
          'npm-no-pkg',
          'npm-unknown',
        ],
      },
    },
  ],
  options: {
    doNotFollow: {
      path: [
        'node_modules',
        '.wasp',
      ],
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: './tsconfig.json',
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.d.ts'],
    },
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/[^/]+',
      },
      archi: {
        collapsePattern: '^(node_modules|src/shared|src/api)/[^/]+',
      },
    },
  },
};
