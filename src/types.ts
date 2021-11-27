import { Request } from "express";
import { RowDataPacket } from "mysql2";
import { UserModel } from "./models/user.model";

export type DbQueryResult<TableRecord> = (TableRecord & RowDataPacket)[];
export interface ReqNewUser {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
}
export interface RequestWithToken extends Request {
  user: userTokenDetails;
}
export type userTokenDetails = {
  username: string;
  userId: number;
  iat: string;
  isAdmin: boolean;
};
export type RegisterReqBody = Partial<UserModel>;
export type LoginReqQuery = { username: string; password: string };
export type UsernameCheckQuery = { username: string };
export type FollowReqBody = { vacaId: number; userId: number };
export type VacationStat = { id: number; title: string; follows: number };
export type PaginationQuery = { current: number; fetchSize: number };

export type RefreshTokenModel = {
  jwt_token: string;
  userId: number;
};

export type TokenData = {
  isAdmin: number;
  userId: number;
};
