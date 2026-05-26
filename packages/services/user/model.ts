import {z} from "zod"

export const createUserWithEmailAndPasswordInput = z.object({
    fullName: z.string().describe("The full name of the user"),
    email: z.string().email().describe("The email address of the user"),
    password: z.string().describe("The password for the user account"),
});
export type CreateUserWithEmailAndPasswordInputType = z.infer<typeof createUserWithEmailAndPasswordInput>

export const generateUserTokenPayload = z.object({
    id: z.string().describe("UUID of User")
});
export type GenerateUserTokenPayloadType = z.infer<typeof generateUserTokenPayload>

export const signInUserWithEmailAndPasswordInput = z.object({
    email: z.string().email().describe("The email address of the user"),
    password: z.string().describe("The password for the user account"),
})

export type SignInUserWithEmailAndPasswordInputType = z.infer<typeof signInUserWithEmailAndPasswordInput>

export const verifyAndDecodeUserTokenOutput = z.object({
    id: z.string(),
    email: z.string().email(),
    fullName: z.string(),
    profileImageUrl: z.string().nullable(),
    role: z.enum(["USER", "ADMIN"]),
  })

  export type VerifyAndDecodeUserTokenOutputType =
    z.infer<typeof verifyAndDecodeUserTokenOutput>