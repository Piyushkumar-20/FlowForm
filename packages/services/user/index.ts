import {
  type CreateUserWithEmailAndPasswordInputType,
  createUserWithEmailAndPasswordInput,
  generateUserTokenPayload,
  GenerateUserTokenPayloadType,
  SignInUserWithEmailAndPasswordInputType,
  signInUserWithEmailAndPasswordInput,
  VerifyAndDecodeUserTokenOutputType
} from "./model";

import * as JWT from "jsonwebtoken";
import { createHmac, randomBytes } from "node:crypto";
import { db, eq, sql } from "@repo/database";
import { usersTable } from "@repo/database/models/user";
import { formsTable } from "@repo/database/models/form";
import { formSubmissionTable } from "@repo/database/models/form-submission";
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
  };

  private async verifyUserToken(token: string): Promise <GenerateUserTokenPayloadType> {
    
    try{
      const verificationResult = JWT.verify(token, env.JWT_SECRET) as GenerateUserTokenPayloadType
      return verificationResult;
    } catch (error){
      throw new Error ('Invalid token')
    }
  }

  private async getUserDetailById(id: string) {
    const [userRecord] = await db.select({
      id: usersTable.id,
      email: usersTable.email,
      fullName: usersTable.fullName,
      profileImageUrl: usersTable.profileImageUrl,
      role: usersTable.role,
    }).from(usersTable).where(eq(usersTable.id, id));

    if (!userRecord) throw new Error('User does not exist');

    return userRecord;
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

  public async verifyAndDecodeUserToken(token: string): Promise<VerifyAndDecodeUserTokenOutputType> {
    const { id } = await this.verifyUserToken(token);
    const userInfo = await this.getUserDetailById(id);
    return {
      id: userInfo.id,
      email: userInfo.email,
      fullName: userInfo.fullName,
      profileImageUrl: userInfo.profileImageUrl,
      role: userInfo.role,
    };
  }

  public async getUserRoleById(id: string): Promise<"USER" | "ADMIN"> {
    const [record] = await db.select({ role: usersTable.role }).from(usersTable).where(eq(usersTable.id, id));
    if (!record) throw new Error('User does not exist');
    return record.role;
  }

  public async getAdminStats(): Promise<{ totalUsers: number; totalForms: number; totalSubmissions: number }> {
    const [userCount] = await db.select({ count: sql<number>`count(*)::int` }).from(usersTable);
    const [formCount] = await db.select({ count: sql<number>`count(*)::int` }).from(formsTable);
    const [submissionCount] = await db.select({ count: sql<number>`count(*)::int` }).from(formSubmissionTable);
    return {
      totalUsers: userCount?.count ?? 0,
      totalForms: formCount?.count ?? 0,
      totalSubmissions: submissionCount?.count ?? 0,
    };
  }

  public async getRecentUsers(limit = 10) {
    return db.select({
      id: usersTable.id,
      fullName: usersTable.fullName,
      email: usersTable.email,
      role: usersTable.role,
      createdAt: usersTable.createdAt,
    }).from(usersTable).orderBy(sql`${usersTable.createdAt} desc`).limit(limit);
  }

  public async getRecentForms(limit = 10) {
    return db.select({
      id: formsTable.id,
      title: formsTable.title,
      status: formsTable.status,
      visibility: formsTable.visibility,
      createdAt: formsTable.createdAt,
    }).from(formsTable).orderBy(sql`${formsTable.createdAt} desc`).limit(limit);
  }
}

export default UserService;
