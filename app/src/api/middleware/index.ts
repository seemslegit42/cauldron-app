/**
 * Export all middleware for easy imports
 */

export * from './auth';
export * from './validation';
export * from './error';
export * from './rbac';
export * from './rbacUtils';
export * from './fieldAccess';
export * from './apiKey';

// Example of a middleware composition helper
export const applyMiddleware = (...middlewareFns: Function[]) => {
  return (context: any) => {
    for (const fn of middlewareFns) {
      fn(context);
    }
    return context;
  };
};
