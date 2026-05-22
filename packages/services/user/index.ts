import {
  type CreateUserWithEmailAndPasswordInputType,
  createUserWithEmailAndPasswordInput,
} from "./model";
import { createHmac, randomBytes } from "node:crypto";
import { db, eq } from "@repo/database";
import { usersTable } from "@repo/database/models/user";
class UserService {
  private async getUserByEmail(email: string) {
    const result = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!result || result.length === 0) {
      return null;
    }
    return result[0];
  }

  // Create user in the DB
  public async createUserWithEmailAndPassword(payload: CreateUserWithEmailAndPasswordInputType) {
    const { email, fullName, password } =
      await createUserWithEmailAndPasswordInput.parseAsync(payload);

    const existingUserWithEmail = await this.getUserByEmail(email);
    if (existingUserWithEmail) throw new Error(`User with this ${email} already exist`);

    // Calculate salt and hash the password
    const salt = randomBytes(16).toString('hex');
    const hash = createHmac('sha256', salt).update(password).digest('hex');

    const userInsertResult = await db.insert(usersTable).values({email, fullName: fullName, password: hash, salt}).returning({id: usersTable.id})

    if (!userInsertResult || userInsertResult.length === 0 || !userInsertResult[0]?.id) throw new Error('Something went wrong with user') 

        return {
            id: userInsertResult[0]?.id
        }
  }
}

export default UserService;
