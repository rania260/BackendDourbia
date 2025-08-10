export const ADMIN_PERMISSIONS = {
  // Permissions de base - extensibles plus tard
  MANAGE_USERS: 'manage_users',
  MANAGE_CONTENT: 'manage_content',
  MANAGE_EXPERTS: 'manage_experts',
  MANAGE_PARTNERS: 'manage_partners',
  VIEW_ANALYTICS: 'view_analytics',
} as const;

export type AdminPermission =
  (typeof ADMIN_PERMISSIONS)[keyof typeof ADMIN_PERMISSIONS];

// Groupes de permissions de base
export const DEFAULT_ADMIN_PERMISSIONS = [
  ADMIN_PERMISSIONS.MANAGE_USERS,
  ADMIN_PERMISSIONS.MANAGE_CONTENT,
];

export const SUPER_ADMIN_PERMISSIONS = Object.values(ADMIN_PERMISSIONS);
