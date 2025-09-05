import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const UpdateUserSchema = z.object({
  name: z.string().optional(),
  email: z.email().optional(),
  password: z.string().optional(),
  phone: z.string().optional(),
  documentNumber: z.string().optional(),
  address: z
    .object({
      street: z.string().optional(),
      number: z.string().optional(),
      complement: z.string().optional(),
      neighborhood: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zip_code: z.string().optional(),
    })
    .optional(),
  isActive: z.boolean().optional().default(true),
  roleId: z.number().optional(),
});

export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
