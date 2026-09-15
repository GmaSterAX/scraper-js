import { z } from "zod";

export const BookSchema = z.object({
    title: z.string().min(1),
    product_url: z.string().url(),
    price_gbp: z.number().positive(),
    price_text: z.string(),
    availability_text: z.string(),
    rating_text: z.string().nullable(),
    description: z.string().nullable(),
    source_page: z.string().url(),
    fetched_at: z.string(),
});