/**
 * Seed file for Roles and Permissions
 *
 * This file creates the core role-based access control (RBAC) structure:
 * - System roles (Admin, Operator, Agent)
 * - Resource-based permissions
 * - Role-permission associations
 *
 * @tag system-data
 * @tag security
 * @tag rbac
 */

import type { PrismaClient, Role, Permission } from '@prisma/client';
import type { SeedConfig } from './index';

// Define system roles
const systemRoles = [
  {
    name: 'Admin',
    description: 'Full system access with all permissions',
    isSystem: true,
    isDefault: false,
  },
  {
    name: 'Operator',
    description: 'Standard user with operational permissions',
    isSystem: true,
    isDefault: true,
  },
  {
    name: 'Agent',
    description: 'AI agent with limited system access',
    isSystem: true,
    isDefault: false,
  },
];

// Define permissions by resource
const permissionsByResource = {
  // Core system resources
  users: [
    { action: 'create', description: 'Create new users' },
    { action: 'read', description: 'View user information' },
    { action: 'update', description: 'Update user information' },
    { action: 'delete', description: 'Delete users' },
    { action: 'manage', description: 'Manage all user aspects' },
  ],
  organizations: [
    { action: 'create', description: 'Create new organizations' },
    { action: 'read', description: 'View organization information' },
    { action: 'update', description: 'Update organization information' },
    { action: 'delete', description: 'Delete organizations' },
    { action: 'manage', description: 'Manage all organization aspects' },
  ],
  agents: [
    { action: 'create', description: 'Create new AI agents' },
    { action: 'read', description: 'View AI agent information' },
    { action: 'update', description: 'Update AI agent configuration' },
    { action: 'delete', description: 'Delete AI agents' },
    { action: 'execute', description: 'Execute AI agent tasks' },
    { action: 'manage', description: 'Manage all AI agent aspects' },
  ],
  modules: [
    { action: 'configure', description: 'Configure module settings' },
    { action: 'use', description: 'Use module features' },
    { action: 'manage', description: 'Manage all module aspects' },
  ],
  system: [
    { action: 'read_logs', description: 'View system logs' },
    { action: 'manage_settings', description: 'Manage system settings' },
    { action: 'manage_credentials', description: 'Manage system credentials' },
    { action: 'admin', description: 'Full system administration' },
  ],

  // Module-specific resources
  arcana: [
    { action: 'read', description: 'View Arcana dashboard' },
    { action: 'use', description: 'Use Arcana features' },
    { action: 'configure', description: 'Configure Arcana settings' },
    { action: 'manage', description: 'Manage all Arcana aspects' },
  ],
  phantom: [
    { action: 'read', description: 'View Phantom security dashboard' },
    { action: 'scan', description: 'Run security scans' },
    { action: 'monitor', description: 'Monitor security threats' },
    { action: 'configure', description: 'Configure Phantom settings' },
    { action: 'manage', description: 'Manage all Phantom aspects' },
  ],
  forgeflow: [
    { action: 'read', description: 'View Forgeflow workflows' },
    { action: 'create', description: 'Create new workflows' },
    { action: 'update', description: 'Update existing workflows' },
    { action: 'execute', description: 'Execute workflows' },
    { action: 'design', description: 'Design workflow templates' },
    { action: 'manage', description: 'Manage all Forgeflow aspects' },
  ],
  obelisk: [
    { action: 'read', description: 'View Obelisk OSINT data' },
    { action: 'scan', description: 'Run OSINT scans' },
    { action: 'configure', description: 'Configure Obelisk settings' },
    { action: 'manage', description: 'Manage all Obelisk aspects' },
  ],
  athena: [
    { action: 'read', description: 'View Athena analytics' },
    { action: 'analyze', description: 'Run analytics operations' },
    { action: 'configure', description: 'Configure Athena settings' },
    { action: 'manage', description: 'Manage all Athena aspects' },
  ],
  sentinel: [
    { action: 'read', description: 'View Sentinel security posture' },
    { action: 'monitor', description: 'Monitor security events' },
    { action: 'configure', description: 'Configure Sentinel settings' },
    { action: 'manage', description: 'Manage all Sentinel aspects' },
  ],
  manifold: [
    { action: 'read', description: 'View Manifold revenue data' },
    { action: 'analyze', description: 'Analyze revenue streams' },
    { action: 'configure', description: 'Configure Manifold settings' },
    { action: 'manage', description: 'Manage all Manifold aspects' },
  ],
  'cauldron-prime': [
    { action: 'read', description: 'View Cauldron Prime dashboard' },
    { action: 'use', description: 'Use Cauldron Prime features' },
    { action: 'configure', description: 'Configure Cauldron Prime settings' },
    { action: 'manage', description: 'Manage all Cauldron Prime aspects' },
  ],

  // Sub-resources
  'security-scans': [
    { action: 'create', description: 'Create security scans' },
    { action: 'read', description: 'View security scan results' },
    { action: 'manage', description: 'Manage security scans' },
  ],
  'threat-intelligence': [
    { action: 'read', description: 'View threat intelligence' },
    { action: 'analyze', description: 'Analyze threat data' },
    { action: 'manage', description: 'Manage threat intelligence' },
  ],
  'domain-clones': [
    { action: 'read', description: 'View domain clone information' },
    { action: 'scan', description: 'Scan for domain clones' },
    { action: 'manage', description: 'Manage domain clone monitoring' },
  ],
  'osint-sources': [
    { action: 'create', description: 'Create OSINT sources' },
    { action: 'read', description: 'View OSINT sources' },
    { action: 'update', description: 'Update OSINT sources' },
    { action: 'delete', description: 'Delete OSINT sources' },
    { action: 'manage', description: 'Manage all OSINT sources' },
  ],
  'osint-findings': [
    { action: 'create', description: 'Create OSINT findings' },
    { action: 'read', description: 'View OSINT findings' },
    { action: 'update', description: 'Update OSINT findings' },
    { action: 'delete', description: 'Delete OSINT findings' },
    { action: 'manage', description: 'Manage all OSINT findings' },
  ],
  'workflow-templates': [
    { action: 'create', description: 'Create workflow templates' },
    { action: 'read', description: 'View workflow templates' },
    { action: 'update', description: 'Update workflow templates' },
    { action: 'delete', description: 'Delete workflow templates' },
    { action: 'manage', description: 'Manage all workflow templates' },
  ],
  'agent-templates': [
    { action: 'create', description: 'Create agent templates' },
    { action: 'read', description: 'View agent templates' },
    { action: 'update', description: 'Update agent templates' },
    { action: 'delete', description: 'Delete agent templates' },
    { action: 'manage', description: 'Manage all agent templates' },
  ],
  'business-metrics': [
    { action: 'read', description: 'View business metrics' },
    { action: 'analyze', description: 'Analyze business metrics' },
    { action: 'manage', description: 'Manage business metrics' },
  ],
  'revenue-streams': [
    { action: 'create', description: 'Create revenue streams' },
    { action: 'read', description: 'View revenue streams' },
    { action: 'update', description: 'Update revenue streams' },
    { action: 'delete', description: 'Delete revenue streams' },
    { action: 'manage', description: 'Manage all revenue streams' },
  ],
  'analytics-reports': [
    { action: 'create', description: 'Create analytics reports' },
    { action: 'read', description: 'View analytics reports' },
    { action: 'manage', description: 'Manage analytics reports' },
  ],
};

// Role-permission mappings
const rolePermissionMappings = {
  Admin: [
    // Admin has all permissions for core resources
    { resource: 'users', action: 'manage' },
    { resource: 'organizations', action: 'manage' },
    { resource: 'agents', action: 'manage' },
    { resource: 'modules', action: 'manage' },
    { resource: 'system', action: 'admin' },

    // Admin has all permissions for modules
    { resource: 'arcana', action: 'manage' },
    { resource: 'phantom', action: 'manage' },
    { resource: 'forgeflow', action: 'manage' },
    { resource: 'obelisk', action: 'manage' },
    { resource: 'athena', action: 'manage' },
    { resource: 'sentinel', action: 'manage' },
    { resource: 'manifold', action: 'manage' },
    { resource: 'cauldron-prime', action: 'manage' },

    // Admin has all permissions for sub-resources
    { resource: 'security-scans', action: 'manage' },
    { resource: 'threat-intelligence', action: 'manage' },
    { resource: 'domain-clones', action: 'manage' },
    { resource: 'osint-sources', action: 'manage' },
    { resource: 'osint-findings', action: 'manage' },
    { resource: 'workflow-templates', action: 'manage' },
    { resource: 'agent-templates', action: 'manage' },
    { resource: 'business-metrics', action: 'manage' },
    { resource: 'revenue-streams', action: 'manage' },
    { resource: 'analytics-reports', action: 'manage' },
  ],
  Operator: [
    // Operators have limited management permissions for core resources
    { resource: 'users', action: 'read' },
    { resource: 'organizations', action: 'read' },
    { resource: 'agents', action: 'create' },
    { resource: 'agents', action: 'read' },
    { resource: 'agents', action: 'update' },
    { resource: 'agents', action: 'execute' },
    { resource: 'modules', action: 'use' },
    { resource: 'system', action: 'read_logs' },

    // Operators have access to all modules with limited permissions
    { resource: 'arcana', action: 'read' },
    { resource: 'arcana', action: 'use' },
    { resource: 'phantom', action: 'read' },
    { resource: 'phantom', action: 'scan' },
    { resource: 'phantom', action: 'monitor' },
    { resource: 'forgeflow', action: 'read' },
    { resource: 'forgeflow', action: 'create' },
    { resource: 'forgeflow', action: 'execute' },
    { resource: 'obelisk', action: 'read' },
    { resource: 'obelisk', action: 'scan' },
    { resource: 'athena', action: 'read' },
    { resource: 'athena', action: 'analyze' },
    { resource: 'sentinel', action: 'read' },
    { resource: 'sentinel', action: 'monitor' },
    { resource: 'manifold', action: 'read' },
    { resource: 'manifold', action: 'analyze' },
    { resource: 'cauldron-prime', action: 'read' },

    // Operators have limited permissions for sub-resources
    { resource: 'security-scans', action: 'create' },
    { resource: 'security-scans', action: 'read' },
    { resource: 'threat-intelligence', action: 'read' },
    { resource: 'domain-clones', action: 'read' },
    { resource: 'domain-clones', action: 'scan' },
    { resource: 'osint-sources', action: 'create' },
    { resource: 'osint-sources', action: 'read' },
    { resource: 'osint-findings', action: 'read' },
    { resource: 'workflow-templates', action: 'read' },
    { resource: 'agent-templates', action: 'read' },
    { resource: 'business-metrics', action: 'read' },
    { resource: 'revenue-streams', action: 'read' },
    { resource: 'analytics-reports', action: 'read' },
  ],
  Agent: [
    // Agents have very limited permissions for core resources
    { resource: 'users', action: 'read' },
    { resource: 'organizations', action: 'read' },
    { resource: 'agents', action: 'read' },
    { resource: 'agents', action: 'execute' },
    { resource: 'modules', action: 'use' },

    // Agents have read-only access to most modules
    { resource: 'arcana', action: 'read' },
    { resource: 'phantom', action: 'read' },
    { resource: 'forgeflow', action: 'read' },
    { resource: 'obelisk', action: 'read' },
    { resource: 'athena', action: 'read' },
    { resource: 'sentinel', action: 'read' },
    { resource: 'manifold', action: 'read' },

    // Agents have read-only access to sub-resources
    { resource: 'security-scans', action: 'read' },
    { resource: 'threat-intelligence', action: 'read' },
    { resource: 'domain-clones', action: 'read' },
    { resource: 'osint-sources', action: 'read' },
    { resource: 'osint-findings', action: 'read' },
    { resource: 'workflow-templates', action: 'read' },
    { resource: 'agent-templates', action: 'read' },
    { resource: 'business-metrics', action: 'read' },
    { resource: 'revenue-streams', action: 'read' },
    { resource: 'analytics-reports', action: 'read' },
  ],
};

export async function seedRolesAndPermissions(prisma: PrismaClient, config: SeedConfig) {
  console.log('🔑 Seeding roles and permissions...');

  // Create all permissions
  const permissions: Record<string, Permission> = {};

  for (const [resource, actions] of Object.entries(permissionsByResource)) {
    for (const { action, description } of actions) {
      const permissionName = `${resource}:${action}`;
      const permission = await prisma.permission.upsert({
        where: { name: permissionName },
        update: { description },
        create: {
          name: permissionName,
          description,
          resource,
          action,
        },
      });

      permissions[permissionName] = permission;

      if (config.logLevel === 'verbose') {
        console.log(`  ↳ Created permission: ${permissionName}`);
      }
    }
  }

  // Create roles and assign permissions
  const roles: Record<string, Role> = {};

  for (const roleData of systemRoles) {
    const role = await prisma.role.upsert({
      where: { name: roleData.name },
      update: {
        description: roleData.description,
        isSystem: roleData.isSystem,
        isDefault: roleData.isDefault,
      },
      create: roleData,
    });

    roles[roleData.name] = role;

    if (config.logLevel === 'verbose') {
      console.log(`  ↳ Created role: ${roleData.name}`);
    }

    // Assign permissions to role
    const roleMappings =
      rolePermissionMappings[roleData.name as keyof typeof rolePermissionMappings] || [];

    for (const { resource, action } of roleMappings) {
      const permissionName = `${resource}:${action}`;
      const permission = permissions[permissionName];

      if (permission) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: permission.id,
          },
        });

        if (config.logLevel === 'verbose') {
          console.log(`    ↳ Assigned permission ${permissionName} to role ${roleData.name}`);
        }
      }
    }
  }

  console.log(
    `✅ Created ${Object.keys(roles).length} roles and ${Object.keys(permissions).length} permissions`
  );

  return { roles, permissions };
}
