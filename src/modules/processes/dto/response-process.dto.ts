import { z } from 'zod';

// Schema para o objeto de análise
const AnalysisObjectSchema = z.object({
  problema: z.string(),
  tipo: z.string(),
  gravidade: z.string(),
  analise: z.string(),
  recomendacao: z.string(),
  precedentes: z.array(z.string()),
});

// Schema de entrada (process completo da entidade)
const InputProcessSchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
  type: z.string().nullable(),
  status: z.string(),
  processText: z.string(),
  analysis: z.array(AnalysisObjectSchema).nullable(),
  additionalInstructions: z.string().nullable().optional(),
  fileUrl: z.string().nullable().optional(),
  userId: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Schema de saída (transformado)
const ResponseProcessSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  type: z.string().nullable(),
  status: z.string(),
  processText: z.string(),
  analysis: z.array(AnalysisObjectSchema).nullable(),
  additionalInstructions: z.string().nullable().optional(),
  fileUrl: z.string().nullable().optional(),
  userId: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Função de transformação
export const transformProcessResponse = (
  process: z.infer<typeof InputProcessSchema>,
): z.infer<typeof ResponseProcessSchema> => {
  return {
    id: process.id.toString(),
    name: process.name,
    type: process.type,
    status: process.status,
    processText: process.processText,
    analysis: process.analysis,
    additionalInstructions: process.additionalInstructions,
    fileUrl: process.fileUrl,
    userId: process.userId,
    createdAt: process.createdAt.toISOString(),
    updatedAt: process.updatedAt.toISOString(),
  };
};

export { AnalysisObjectSchema, InputProcessSchema, ResponseProcessSchema };
export type ResponseProcess = z.infer<typeof ResponseProcessSchema>;
export type InputProcess = z.infer<typeof InputProcessSchema>;
