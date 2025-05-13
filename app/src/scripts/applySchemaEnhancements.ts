import { SchemaEnhancementUtils } from '../utils/schemaEnhancementUtils';

/**
 * Apply Schema Enhancements
 *
 * This script applies the schema enhancements to the database.
 * It should be run after the Prisma migration has been applied.
 *
 * Usage:
 * 1. Run the Prisma migration: npx prisma migrate dev --name enhance_schema
 * 2. Run this script: npx ts-node src/scripts/applySchemaEnhancements.ts
 */
async function applySchemaEnhancements() {
  console.log('Applying schema enhancements...');

  try {
    // Run all migration utilities
    const results = await SchemaEnhancementUtils.migrateAll();

    console.log('Schema enhancements applied successfully:');
    console.log(`- Migrated ${results.sessions} agent sessions`);
    console.log(`- Migrated ${results.states} module states`);
    console.log(`- Migrated ${results.agents} AI agents`);
    console.log(`- Migrated ${results.memories} interaction memories`);
    console.log(`- Updated session counts for ${results.sessionCounts} agents`);
    console.log(`- Migrated ${results.reasonings} AI reasonings`);
    console.log(`- Migrated ${results.prompts} AI prompts`);
    console.log(`- Created ${results.modelVersions} AI model versions`);
  } catch (error) {
    console.error('Error applying schema enhancements:', error);
    process.exit(1);
  }
}

// Run the script if this file is executed directly
if (require.main === module) {
  applySchemaEnhancements()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
}

export default applySchemaEnhancements;
