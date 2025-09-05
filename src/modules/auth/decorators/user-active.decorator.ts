import { SetMetadata } from '@nestjs/common';

export const UserActivated = () => SetMetadata('isActive', true);
