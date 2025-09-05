import { createZodDto } from 'nestjs-zod';
import { User } from 'src/entities/user.entity';
import { UserRoles } from 'src/shared/enums/user-roles';
import { z } from 'zod';

// Schema para o endereço do usuário
const UserAddressSchema = z.object({
  street: z.string(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string(),
  state: z.string(),
  zip_code: z.string(),
});

// Schema para o role
const RoleSchema = z.object({
  id: z.number(),
  name: z.enum(UserRoles),
  description: z.string().nullable(),
});

// Schema de saída (transformado)
const ResponseUserSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  email: z.email(),
  phone: z.string().nullable(),
  documentNumber: z.string().nullable(),
  avatarUrl: z.string().nullable().optional(),
  address: UserAddressSchema,
  role: RoleSchema,
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

class ResponseUserDto extends createZodDto(ResponseUserSchema) {}

// Função de transformação
export const transformUserResponse = (user: User): ResponseUserDto => {
  return {
    id: user.id.toString(),
    userId: user.uuid,
    name: user.name,
    email: user.email,
    phone: user.phone,
    documentNumber: user.documentNumber,
    avatarUrl: user.avatarUrl,
    address: user.address,
    role: {
      id: user.role.id,
      name: user.role.name,
      description: user.role.description,
    },
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
};

export { ResponseUserDto, ResponseUserSchema, RoleSchema, UserAddressSchema };
