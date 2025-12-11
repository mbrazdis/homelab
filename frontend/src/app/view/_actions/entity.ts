"use server"
import db from "@/db/db"
import { z } from "zod"
import { redirect } from "next/navigation"

const addSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    type: z.string().min(1),
    manufacturer: z.string().min(1),
    model: z.string().min(1),
    roomId: z.coerce.number().int().min(1),
})

export async function addEntity(prevState: unknown, formData: FormData) {
    console.log("Form data received:", formData);

    const result = addSchema.safeParse(Object.fromEntries(formData.entries()));
    if (result.success === false) {
        console.error("Validation failed:", result.error.formErrors.fieldErrors);
        return result.error.formErrors.fieldErrors;
    }

    const data = result.data;
    console.log("Validated data:", data);


    const entity = await db.entity.create({
        data: {
            id: data.id,
            name: data.name,
            type: data.type,
            manufacturer: data.manufacturer,
            model: data.model,
            roomId: data.roomId,
        },
    });

    console.log("Entity created:", entity);
    redirect("/view/entities");



}
