import { UserModel } from "./../../models/user.model";
import { RefreshTokenModel, DbQueryResult } from "./../../types";
import { db } from "../db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export async function insertRefreshToken(refreshToken: RefreshTokenModel) {
  try {
    const { jwt_token, userId } = refreshToken;
    const [{ affectedRows }] = await db.query<ResultSetHeader>(
      `
        REPLACE INTO refresh_tokens (jwt_token ,user_id)
         VALUES (?,?);

        `,
      [jwt_token, userId]
    );
    return affectedRows > 0;
  } catch (error) {
    console.log(`error`, error);
  }
}
export async function deleteUsersRefreshTokens(userId: number) {
  try {
    const [{ affectedRows }] = await db.query<ResultSetHeader>(
      `
      DELETE FROM refresh_tokens WHERE user_id = ?
        `,
      [userId]
    );

    return affectedRows > 0;
  } catch (error) {
    console.log(`error`, error);
  }
}
export async function getUserFromRefreshToken(refreshToken: string) {
  try {
    const [[user]] = await db.query<DbQueryResult<Partial<UserModel>>>(
      `
       SELECT a.user_id id,first_name firstName, last_name lastName, isAdmin FROM
        (SELECT user_id from refresh_tokens where jwt_token = ?) a
        INNER JOIN users b ON a.user_id = b.user_id; 
        `,
      [refreshToken]
    );
    if (!user) return null;
    return user;
  } catch (error) {
    console.log(`error`, error);
  }
}
