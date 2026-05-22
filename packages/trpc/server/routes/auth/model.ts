import {z} from "zod"

export const createUserWithEmailAndPasswordInputModel = z.object({
    fullName: z.string().describe("Name of the user"),
    email: z.string().describe("Email of the User"),
    password: z.string().describe("Password of the USer"),
})

export const createUserWithEmailAndPasswordOutputModel = z.object({
    id: z.string().describe("Id of the user")
})
