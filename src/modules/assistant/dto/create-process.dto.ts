import { z } from 'zod';

export const CreateProcessDto = z.object({
  name: z.string().min(1, 'O nome do processo é obrigatório'),
});
