/**
 * Apply Memory and LangGraph Schema
 * 
 * This script applies the memory and LangGraph schema extensions to the main Prisma schema.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths
const mainSchemaPath = path.join(__dirname, '..', 'schema.prisma');
const memorySchemaPath = path.join(__dirname, '..', 'schema.memory.append');
const langgraphSchemaPath = path.join(__dirname, '..', 'schema.langgraph.append');
const tempSchemaPath = path.join(__dirname, '..', 'schema.prisma.temp');

// Main function
async function applySchema() {
  try {
    console.log('Starting schema migration process...');
    
    // Read the schema files
    console.log('Reading schema files...');
    const mainSchema = fs.readFileSync(mainSchemaPath, 'utf8');
    const memorySchema = fs.existsSync(memorySchemaPath) 
      ? fs.readFileSync(memorySchemaPath, 'utf8')
      : '';
    const langgraphSchema = fs.existsSync(langgraphSchemaPath)
      ? fs.readFileSync(langgraphSchemaPath, 'utf8')
      : '';
    
    if (!memorySchema && !langgraphSchema) {
      console.error('No schema extensions found. Aborting.');
      process.exit(1);
    }
    
    // Combine the schemas
    console.log('Combining schemas...');
    const combinedSchema = `${mainSchema}\n\n// Memory and LangGraph Schema Extensions\n\n${memorySchema}\n\n${langgraphSchema}`;
    
    // Write to a temporary file
    console.log('Writing combined schema to temporary file...');
    fs.writeFileSync(tempSchemaPath, combinedSchema);
    
    // Validate the schema
    console.log('Validating schema...');
    try {
      execSync('npx prisma validate --schema=' + tempSchemaPath, { stdio: 'inherit' });
      console.log('Schema validation successful');
    } catch (error) {
      console.error('Schema validation failed:', error);
      fs.unlinkSync(tempSchemaPath);
      process.exit(1);
    }
    
    // Backup the original schema
    const backupPath = `${mainSchemaPath}.backup.${Date.now()}`;
    console.log(`Backing up original schema to ${backupPath}...`);
    fs.copyFileSync(mainSchemaPath, backupPath);
    
    // Update the main schema file
    console.log('Updating main schema file...');
    fs.writeFileSync(mainSchemaPath, combinedSchema);
    
    // Generate Prisma client
    console.log('Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Create migration
    console.log('Creating migration...');
    execSync('npx prisma migrate dev --name add_memory_langgraph_schema', { stdio: 'inherit' });
    
    console.log('Migration process completed successfully');
    
    // Clean up
    if (fs.existsSync(tempSchemaPath)) {
      fs.unlinkSync(tempSchemaPath);
    }
  } catch (error) {
    console.error('Error during migration:', error);
    
    // Clean up
    if (fs.existsSync(tempSchemaPath)) {
      fs.unlinkSync(tempSchemaPath);
    }
    
    process.exit(1);
  }
}

// Run the migration
applySchema();
