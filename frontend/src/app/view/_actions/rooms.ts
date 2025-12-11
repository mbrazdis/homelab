"use server"
import db from "@/db/db"
import { z } from "zod"
import fs from "fs/promises"
import { redirect } from "next/navigation"

const fileSchema = z.instanceof(File, { message: "Invalid file" })
const imageSchema = fileSchema.refine(
    file => file.size === 0 || file.type.startsWith("image/"),
)

const addSchema = z.object({
    name: z.string().min(1),
    entities: z.array(z.string()).default([]),
    image: imageSchema.refine(file => file.size > 0, "Required"),
})


export async function addRoom(prevState: unknown, formData: FormData) {
    console.log("Form data received:", formData);

    const result = addSchema.safeParse(Object.fromEntries(formData.entries()));
    if (result.success === false) {
        console.error("Validation failed:", result.error.formErrors.fieldErrors);
        return result.error.formErrors.fieldErrors;
    }

    const data = result.data;
    console.log("Validated data:", data);

    await fs.mkdir("public/rooms", { recursive: true });
    const imagePath = `/rooms/${crypto.randomUUID()}-${data.image.name}`;
    await fs.writeFile(`public${imagePath}`, Buffer.from(await data.image.arrayBuffer()));
    console.log("Image saved at:", imagePath);


    const room = await db.room.create({
        data: {
            name: data.name,
            entities: {
                connect: data.entities.map((id) => ({ id })),
            },
            image: imagePath,
        },
    });
    redirect("/view/rooms");
}
