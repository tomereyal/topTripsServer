import { Response, Request, NextFunction } from "express";
import HttpException from "../exceptions/HttpException";
import { RequestWithToken } from "../types";

export function authAdmin(req: Request, res: Response, next: NextFunction) {
  const myReq = req as RequestWithToken;
  if (!myReq.user.isAdmin)
    return next(
      new HttpException(
        401,
        "Request not autherized. Admin credentials are required."
      )
    );
  next();
}
