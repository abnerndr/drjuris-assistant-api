import { SetMetadata } from '@nestjs/common';
import { UserRoles } from 'src/shared/enums/user-roles';

export const Roles = (...roles: UserRoles[]) => SetMetadata('roles', roles);
