import {
  type CreateUserWithEmailAndPasswordInputType,
  createUserWithEmailAndPasswordInput,
  generateUserTokenPayload,
  GenerateUserTokenPayloadType,
  SignInUserWithEmailAndPasswordInputType,
  signInUserWithEmailAndPasswordInput,
} from "./model";

import * as JWT from "jsonwebtoken";
import { createHmac, randomBytes } from "node:crypto";
import { db, eq } from "@repo/database";
import { usersTable } from "@repo/database/models/user";
import { env } from "../env";

class UserService {
  private async getUserByEmail(email: string) {
    const result = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!result || result.length === 0) {
      return null;
    }
    return result[0];
  }

  private async generateUserToken(payload: GenerateUserTokenPayloadType) {
    const { id } = await generateUserTokenPayload.parseAsync(payload);
    const token = JWT.sign({ id }, env.JWT_SECRET);
    return { token };
  }

  private async generateHash(salt: string, password: string ){
    return createHmac('sha256', salt).update(password).digest('hex')
  }

  // Create user in the DB
  public async createUserWithEmailAndPassword(payload: CreateUserWithEmailAndPasswordInputType) {
    const { email, fullName, password } =
      await createUserWithEmailAndPasswordInput.parseAsync(payload);

    const existingUserWithEmail = await this.getUserByEmail(email);
    if (existingUserWithEmail) throw new Error(`User with this ${email} already exist`);

    // Calculate salt and hash the password
    const salt = randomBytes(16).toString("hex");
    const hash = await this.generateHash(salt, password)

    const userInsertResult = await db
      .insert(usersTable)
      .values({ email, fullName: fullName, password: hash, salt })
      .returning({ id: usersTable.id });

    if (!userInsertResult || userInsertResult.length === 0 || !userInsertResult[0]?.id)
      throw new Error("Something went wrong with user");

    const userId = userInsertResult[0]?.id;
    const { token } = await this.generateUserToken({ id: userId });
    return {
      id: userId,
      token,
    };
  }

  public async signInUserWithEmailAndPassword(payload: SignInUserWithEmailAndPasswordInputType) {
    const { email, password } = await signInUserWithEmailAndPasswordInput.parseAsync(payload);

    const existingUser = await this.getUserByEmail(email);

    if (!existingUser) {
      throw new Error('Invalid Username or Password');
    }

    if (!existingUser.password || !existingUser.salt) {
      throw new Error ('Invalid Authentication Method')
    } 
    const hash = await this.generateHash(existingUser.salt, password)

    if (existingUser.password !== hash) throw new Error ('Invalid Username or Password')
  
    const {token} = await this.generateUserToken ({id: existingUser.id})

    return {
      id: existingUser.id,
      token
    }
  }
}

export default UserService;
