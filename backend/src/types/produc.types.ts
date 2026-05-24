import zod from 'zod';

export const createProductSchema = zod.object({
    title: zod.string().max(200),
    description: zod.string().max(500),
    imageUrl: zod.string().url(),
    price: zod.number().positive(),
    category: zod.string().max(100)
})