/**
 * Prisma Client Initialization
 * 
 * This file initializes the Prisma client with middleware.
 */

import { PrismaClient } from '@prisma/client';
import { initPrismaMiddleware } from './middleware/initPrismaMiddleware';

// Create a new Prisma client
const prismaClient = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

// Apply middleware
const prisma = initPrismaMiddleware(prismaClient);

// Export the Prisma client
export { prisma };
