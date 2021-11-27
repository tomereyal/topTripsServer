import { DbQueryResult, LoginReqQuery, userTokenDetails } from "./../../types";
import { db } from "../db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { UserModel } from "../../models/user.model";

export async function insertNewUser(userDetails: Partial<UserModel>) {
  const { firstName, lastName, username, password } = userDetails;

  try {
    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO users (first_name , last_name ,username,password)  
      VALUES (?,?,?,?) `,
      [firstName, lastName, username, password]
    );
    return result.affectedRows > 0 ? result.insertId : null;
  } catch (error) {
    console.log(`error`, error);
    return null;
  }
}

export async function getUser(username: string) {
  try {
    const [[result]] = await db.query<DbQueryResult<Partial<userTokenDetails>>>(
      `
  SELECT password ,isAdmin, user_id id,first_name firstName,last_name lastName  FROM users where username= ?;
    `,
      [username]
    );
    if (result) {
      const { password, isAdmin, id, firstName, lastName } = result;
      return { hashedPassword: password, isAdmin, id, firstName, lastName };
    }
  } catch (error) {
    console.log(`User was not found in database`, error);
  }
}
export async function isUsername(queriedUsername: string) {
  const [[results]] = await db.query<DbQueryResult<{ username: string }>>(
    `
  SELECT username FROM users where username= ?;
    `,
    [queriedUsername]
  );

  return results?.username ? true : false;
}
