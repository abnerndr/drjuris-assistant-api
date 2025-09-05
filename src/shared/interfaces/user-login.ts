import type { UserRoles } from '../enums/user-roles';

export interface UserLogin {
  email: string;
  full_name: string;
  id: string;
  role?: { name?: UserRoles };
}
