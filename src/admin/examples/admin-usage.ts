// Exemple d'utilisation des permissions Admin

import { ADMIN_PERMISSIONS } from '../../utils/permissions';

/*
PERMISSIONS DISPONIBLES :
- manage_users     : Gérer les utilisateurs (CRUD, ban/unban)
- manage_content   : Gérer le contenu (blogs, monuments, etc.)
- manage_experts   : Approuver/rejeter les experts
- manage_partners  : Approuver/rejeter les partenaires
- view_analytics   : Voir les statistiques et analytics

EXEMPLES D'UTILISATION :

1. Créer un admin standard :
   POST /admin/promote/123
   Body: { "isSuperAdmin": false }
   
2. Créer un super admin :
   POST /admin/promote/123
   Body: { "isSuperAdmin": true }
   
3. Mettre à jour les permissions :
   PATCH /admin/5/permissions
   Body: { "permissions": ["manage_users", "manage_content"] }
   
4. Vérifier une permission :
   GET /admin/5/has-permission/manage_users
   
ÉVOLUTION FUTURE :
- Ajouter plus de permissions selon les besoins
- Créer des groupes de permissions personnalisés
- Ajouter des permissions temporaires avec expiration
*/

export const ADMIN_EXAMPLES = {
  BASIC_ADMIN: [ADMIN_PERMISSIONS.MANAGE_CONTENT],
  USER_MANAGER: [ADMIN_PERMISSIONS.MANAGE_USERS],
  CONTENT_MANAGER: [
    ADMIN_PERMISSIONS.MANAGE_CONTENT,
    ADMIN_PERMISSIONS.MANAGE_EXPERTS,
  ],
  FULL_ADMIN: Object.values(ADMIN_PERMISSIONS),
};
