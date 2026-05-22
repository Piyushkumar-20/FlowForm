import { z } from "zod";
export declare const createUserWithEmailAndPasswordInputModel: z.ZodObject<{
    fullName: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const createUserWithEmailAndPasswordOutputModel: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const signInUserWithEmailAndPasswordInputModel: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const signInUserWithEmailAndPasswordOutputModel: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
