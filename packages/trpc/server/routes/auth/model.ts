import {z} from "zod"

export const createUserWithEmailAndPasswordInputModel = z.object({
    fullName: z.string().describe("Name of the user"),
    email: z.string().describe("Email of the User"),
    password: z.string().describe("Password of the USer"),
})

export const createUserWithEmailAndPasswordOutputModel = z.object({
    id: z.string().describe("Id of the user")
})

export const signInUserWithEmailAndPasswordInputModel = z.object({
    email: z.string().describe("Email of the User"),
    password: z.string().describe("Password of the USer"),
})

export const signInUserWithEmailAndPasswordOutputModel = z.object({
    id: z.string().describe("Id of the user")
})

export const getLoggedInUserInputModel = z.undefined();

export const getLoggedInUserOutputModel = z.object({
    id: z.string().describe("Id of the user"),
    fullName: z.string().describe("Name of the user"),
    email: z.string().describe("Email of the User"),
    profileImageUrl: z.string().nullable().optional().describe("Profile image of the User"),
})