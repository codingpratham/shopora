import zod from 'zod';

export const createProductSchema = zod.object({
    title: zod.string().max(200),
    description: zod.string().max(500),
    imageUrl: zod.array(zod.string().url()).optional(),
    price: zod.string(),
    category: zod.string().max(100)
});
export type CreateProductInput = zod.infer<typeof createProductSchema>;