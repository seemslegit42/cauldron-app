/**
 * Migration script to apply the enhanced AI reasoning schema
 * 
 * This script reads the enhanced schema definition and applies it to the database.
 * It should be run after creating the migration file.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Main function
async function main() {
  console.log('Starting migration for enhanced AI reasoning schema...');
  
  try {
    // Check if the migration file exists
    const migrationFilePath = path.join(__dirname, '20240601_enhance_ai_reasoning_schema.prisma');
    if (!fs.existsSync(migrationFilePath)) {
      console.error('Migration file not found:', migrationFilePath);
      process.exit(1);
    }
    
    // Create a temporary schema file that includes the migration
    const tempSchemaPath = path.join(__dirname, 'temp_schema.prisma');
    const mainSchemaPath = path.join(__dirname, '..', 'schema.prisma');
    
    // Read the main schema
    const mainSchema = fs.readFileSync(mainSchemaPath, 'utf8');
    
    // Read the migration schema
    const migrationSchema = fs.readFileSync(migrationFilePath, 'utf8');
    
    // Combine them
    const combinedSchema = mainSchema + '\n\n' + migrationSchema;
    
    // Write to the temporary file
    fs.writeFileSync(tempSchemaPath, combinedSchema);
    
    console.log('Created temporary schema file with enhanced reasoning models');
    
    // Run Prisma migration
    console.log('Running Prisma migration...');
    execSync('npx prisma migrate dev --name enhance_ai_reasoning_schema --schema=' + tempSchemaPath, { 
      stdio: 'inherit' 
    });
    
    console.log('Migration completed successfully');
    
    // Clean up the temporary file
    fs.unlinkSync(tempSchemaPath);
    console.log('Cleaned up temporary files');
    
    // Update the main schema file to include the new models
    console.log('Updating main schema file...');
    fs.writeFileSync(mainSchemaPath, combinedSchema);
    
    console.log('Schema update completed successfully');
    
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

// Run the main function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
