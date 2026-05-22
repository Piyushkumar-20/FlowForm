import {z} from "zod"

export const createUserWithEmailAndPasswordInput = z.object({
    fullName: z.string().describe("The full name of the user"),
    email: z.string().email().describe("The email address of the user"),
    password: z.string().describe("The password for the user account"),
});

export const generateUserTokenPayload = z.object({
    id: z.string().describe("UUID of User")
});

export type CreateUserWithEmailAndPasswordInputType = z.infer<typeof createUserWithEmailAndPasswordInput>
export type GenerateUserTokenPayloadType = z.infer<typeof generateUserTokenPayload>