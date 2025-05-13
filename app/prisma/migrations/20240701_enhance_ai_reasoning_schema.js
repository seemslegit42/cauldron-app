/**
 * Migration script to enhance AI reasoning schema
 * 
 * This script applies the schema changes to add support for storing raw prompts,
 * AI reasoning chains, and response trees for transparency, auditing, and supervised fine-tuning.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Main migration function
async function main() {
  try {
    console.log('Starting migration to enhance AI reasoning schema...');
    
    // Run Prisma migration
    console.log('Running Prisma migration...');
    execSync('npx prisma migrate dev --name enhance_ai_reasoning_schema', { stdio: 'inherit' });
    
    console.log('Migration completed successfully');
    
    // Generate Prisma client
    console.log('Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    console.log('Prisma client generated successfully');
    
    console.log('Migration process completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

// Run the migration
main();
