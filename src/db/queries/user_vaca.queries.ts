import { ResultSetHeader } from "mysql2";
import { DbQueryResult, FollowReqBody, VacationStat } from "../../types";
import { db } from "../db";

export async function insertNewFollowInDb(ids: FollowReqBody) {
  const { vacaId, userId } = ids;

  if (await isUserFollowing(ids)) {
    return true;
  }

  const [result] = await db.query<ResultSetHeader>(
    `
    INSERT INTO user_vaca (user_id, vaca_id)
    VALUES (?,?)
    `,
    [userId, vacaId]
  );

  return result?.affectedRows > 0;
}

export async function isUserFollowing(ids: FollowReqBody) {
  const { vacaId, userId } = ids;

  const [usersFound] = await db.query<DbQueryResult<{ id: string }[]>>(
    `
    SELECT user_id id FROM user_vaca WHERE user_id = ? AND vaca_id = ?`,
    [userId, vacaId]
  );

  if (usersFound.length > 0) {
    return true;
  }
}

export async function removeFollowInDb(ids: FollowReqBody) {
  const { vacaId, userId } = ids;

  const [result] = await db.query<ResultSetHeader>(
    ` DELETE FROM user_vaca WHERE user_id=? AND vaca_id = ? `,
    [userId, vacaId]
  );

  return result?.affectedRows > 0;
}

export async function getFollowedVacaFromDb() {
  const [vacationStats] = await db.query<DbQueryResult<VacationStat[]>>(
    ` SELECT count(1) follows ,vaca_id id,title FROM emp_vaca a GROUP BY vaca_id
      INNER JOIN vacations b on a.vaca_id = b.vaca_id;`
  );

  return vacationStats;
}
