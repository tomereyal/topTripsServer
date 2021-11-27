import { ResultSetHeader } from "mysql2";
import { DbQueryResult, PaginationQuery, VacationStat } from "../../types";
import { db } from "../db";
import { VacationModel } from "./../../models/vaca.model";

export async function insertNewVacation(
  vacationDetails: Partial<VacationModel>
) {
  const { title, fromDate, toDate, price, url, description } = vacationDetails;

  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO trips.vacations (title,description,from_date,to_date,price,url)
         VALUES(?,?,?,?,?,?)`,
    [title, description, fromDate, toDate, price, url]
  );
  console.log(`result`, result);

  return result.affectedRows > 0 ? result.insertId : null;
}

export async function getVacationsFromDb(
  { current, fetchSize }: PaginationQuery,
  userId: number
) {
  try {
    const [vacations] = await db.query<DbQueryResult<VacationModel>>(
      `
      Select follows, a.vaca_id id, title,description, price,DATE_FORMAT(from_date,'%d/%m/%y') fromDate, DATE_FORMAT(to_date,'%d/%m/%y') toDate,url
      FROM trips.vacations a LEFT JOIN ( SELECT count(1) follows, vaca_id,user_id FROM trips.user_vaca GROUP BY vaca_id) b ON a.vaca_id = b.vaca_id
      WHERE a.vaca_id NOT IN (SELECT vaca_id FROM trips.user_vaca WHERE user_id =? ) 
      LIMIT ?,?;
    `,
      [userId, current, current + fetchSize]
    );

    return vacations;
  } catch (error) {
    console.log(`Error while querying DB`, error);
  }
}
export async function getVacationsUserFollowsFromDb(userId: number) {
  try {
    const [vacations] = await db.query<DbQueryResult<VacationModel>>(
      `
        Select follows, a.vaca_id id, title,description, price,DATE_FORMAT(from_date,'%d/%m/%y') fromDate, DATE_FORMAT(to_date,'%d/%m/%y') toDate,url
        FROM  (SELECT * FROM trips.user_vaca WHERE user_id = ?) a
        LEFT JOIN( SELECT count(1) follows, vaca_id FROM trips.user_vaca WHERE user_id=  ?  GROUP BY vaca_id) b ON a.vaca_id = b.vaca_id 
                LEFT JOIN trips.vacations c on a.vaca_id = c.vaca_id  LIMIT 20
    `,
      [userId, userId]
    );
    return vacations;
  } catch (error) {
    console.log(`error`, error);
    return [];
  }
}

export async function getVacationsFollowStatsFromDb() {
  try {
    const [vacationsFollowStats] = await db.query<DbQueryResult<VacationStat>>(
      `Select follows, a.vaca_id id, title FROM trips.vacations a 
  LEFT JOIN ( SELECT count(1) follows, vaca_id FROM trips.user_vaca GROUP BY vaca_id) b 
  ON a.vaca_id = b.vaca_id 
  WHERE follows IS NOT NULL;`
    );
    return vacationsFollowStats;
  } catch (error) {
    console.log(`error`, error);
    return null;
  }
}

export async function getVacationTotal() {
  try {
    const [result] = await db.query<DbQueryResult<{ total: number }>>(`
    SELECT count(1) total FROM trips.vacations 
    `);

    return result[0].total;
  } catch (error) {}
}
export async function getRemainingVacationTotal(userId: number) {
  try {
    const [result] = await db.query<DbQueryResult<{ total: number }>>(
      `
    SELECT count(1) total FROM trips.vacations WHERE vaca_id  NOT IN (SELECT vaca_id FROM trips.user_vaca WHERE user_id = ?)  
    `,
      [userId]
    );

    return result[0].total;
  } catch (error) {}
}

export async function updateVacationInDb(
  vacationDetails: Partial<VacationModel>
) {
  const { id, title, fromDate, toDate, price, url, description } =
    vacationDetails;

  const [result] = await db.query<ResultSetHeader>(
    `
        UPDATE trips.vacations SET title=?,description=?, price=?,from_date =?, to_date =?,url=? WHERE vaca_id = ?
    `,
    [title, description, price, fromDate, toDate, url, id]
  );
  return result?.affectedRows > 0;
}

export async function deleteVacationInDb(vacationId: number) {
  const [result] = await db.query<ResultSetHeader>(
    `
        DELETE FROM trips.vacations WHERE  vaca_id = ?
    `,
    [vacationId]
  );
  return result?.affectedRows > 0;
}
