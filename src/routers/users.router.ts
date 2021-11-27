import { Router, Request, Response, NextFunction } from "express";
import { getUser, insertNewUser, isUsername } from "../db/queries/user.queries";
import HttpException from "../exceptions/HttpException";
import { UserModel } from "../models/user.model";
import {
  FollowReqBody,
  LoginReqQuery,
  RequestWithToken,
  TokenData,
  UsernameCheckQuery,
} from "../types";
import bcrypt from "bcrypt";
import {
  insertNewFollowInDb,
  removeFollowInDb,
} from "../db/queries/user_vaca.queries";
import jwt from "jsonwebtoken";

import {
  deleteUsersRefreshTokens,
  getUserFromRefreshToken,
  insertRefreshToken,
} from "../db/queries/refresh_tokens.queries";
export const userRouter = Router();

//=======================GET======================================

userRouter.get(
  "/isUsernameTaken",
  async (
    req: Request<any, any, any, UsernameCheckQuery>,
    res: Response<{ isUsernameTaken: boolean }>,
    next: NextFunction
  ) => {
    try {
      const { username } = req.query;
      if (!username)
        return next(new HttpException(500, "Username was not provided"));
      const isUsernameTaken = await isUsername(username);
      console.log(`isUsernameTaken`, isUsernameTaken);
      return res.status(200).send({ isUsernameTaken });
    } catch (error) {
      return next(new HttpException(500, ` CAUGHT ERROR: ${error}`));
    }
  }
);

userRouter.get(
  "/auth",
  async (
    req: Request<any, any, any, any>,
    res: Response<{
      accessToken: string;
      accessTokenExpiration: number;
      userDetails: Omit<UserModel, "password" | "username">;
    }>,
    next: NextFunction
  ) => {
    const refreshToken = req.cookies?.refreshToken;

    const user = await _checkRefreshTokenOrLoginParams("", "", refreshToken);
    if (user && user.id) {
      //GENERATE EPHEMERAL ACCESS TOKEN AND A HTTP-ONLY COOKIE STORING REFRESH TOKEN

      const [newAccessToken, newRefreshToken] = await _createTokens(
        user.id,
        user.isAdmin
      );
      if (!newAccessToken || !newRefreshToken)
        return next(
          new HttpException(
            500,
            "Unable to create temporary access token OR refresh token.."
          )
        );

      const { id, isAdmin = false, firstName, lastName } = user;
      res.cookie("refreshToken", newRefreshToken, {
        maxAge: 60 * 60 * 24 * 60 * 1000,
        httpOnly: true,
        // secure:true, not during development
      });

      return res.status(200).send({
        accessToken: newAccessToken,
        accessTokenExpiration: 60 * 60 * 15 * 1000, // 15 minutes
        userDetails: { id, isAdmin, firstName, lastName },
      });
    } else
      return next(
        new HttpException(
          500,
          "No User was found in DB with this refresh token OR refresh token was not provided in request."
        )
      );
  }
);

//=======================POST======================================

userRouter.post(
  "/login",
  async (
    req: Request<any, any, LoginReqQuery, any>,
    res: Response<{
      accessToken: string;
      accessTokenExpiration: number;
      userDetails: Omit<UserModel, "password" | "username">;
    }>,
    next: NextFunction
  ) => {
    const { username, password } = req.body;
    const refreshToken = req.cookies?.refreshToken;
    console.log(`initial refresh token?`, refreshToken);
    const user = await _checkRefreshTokenOrLoginParams(
      username,
      password,
      refreshToken
    );
    if (user && user.id) {
      const [newAccessToken, newRefreshToken] = await _createTokens(
        user.id,
        user.isAdmin
      );
      if (!newAccessToken || !newRefreshToken)
        return next(
          new HttpException(
            500,
            "Unable to create temporary access token OR refresh token.."
          )
        );
      const { id, isAdmin = false, firstName, lastName } = user;

      res.cookie("refreshToken", newRefreshToken, {
        maxAge: 60 * 60 * 24 * 60 * 1000,
        httpOnly: true,
      });

      return res.status(200).send({
        accessToken: newAccessToken,
        accessTokenExpiration: 60 * 60 * 15 * 1000, // 15 minutes
        userDetails: { id, isAdmin, firstName, lastName },
      });
    } else
      return next(
        new HttpException(500, "Username or password entered is wrong")
      );
  }
);

userRouter.post(
  "/logout",
  async (
    req: Request<any, any, { userId: string }>,
    res: Response<{ wasLoggedOut: boolean }>
  ) => {
    const userId = req.body.userId;
    const refreshTokenDeleted = await deleteUsersRefreshTokens(Number(userId));
    res.cookie("refreshToken", "", {
      httpOnly: true,
      maxAge: 1,
    });
    // res.clearCookie("refreshToken");
    // const cookie = req.cookies;
    // for (var prop in cookie) {
    //   console.log(`prop`, prop);
    //   if (!cookie.hasOwnProperty(prop)) {
    //     continue;
    //   }
    //   res.cookie(prop, "", { expires: new Date(0) });
    // }
    return res.status(200).send({ wasLoggedOut: true });
  }
);

userRouter.post(
  "/register",
  async (
    req: Request<any, any, Partial<UserModel>>,
    res: Response<{ userId: number }>,
    next: NextFunction
  ) => {
    const { firstName, lastName, username, password } = req.body;
    console.log(`req.body`, req.body);
    const user = {
      firstName,
      lastName,
      username,
      password,
    };

    if (password) user.password = await bcrypt.hash(password, 10);

    const userId = await insertNewUser(user);
    if (firstName && lastName && username && password && userId)
      res.send({ userId });
    else return next(new HttpException(400, "User was not able to be created"));
  }
);

userRouter.post(
  "/followVacation",
  async (
    req: Request<any, any, FollowReqBody>,
    res: Response<{ wasAdded: boolean }>,
    next: NextFunction
  ) => {
    const { vacaId } = req.body;
    const { userId } = (req as RequestWithToken).user;
    const wasAdded = await insertNewFollowInDb({
      vacaId,
      userId: Number(userId),
    });
    console.log(`wasAdded`, wasAdded);

    if (wasAdded) return res.status(200).send({ wasAdded });
    else return next(new HttpException(400, "Unable to follow this vacation"));
  }
);

//=======================PUT======================================

//=======================DELETE======================================
userRouter.post(
  "/unfollowVacation",
  async (
    req: Request<any, any, FollowReqBody>,
    res: Response<{ wasRemoved: boolean }>,
    next: NextFunction
  ) => {
    const { vacaId } = req.body;
    const { userId } = (req as RequestWithToken).user;
    console.log(`vacaId`, vacaId);
    console.log(`userId`, userId);
    const wasRemoved = await removeFollowInDb({
      vacaId,
      userId: Number(userId),
    });
    console.log(`wasRemoved`, wasRemoved);

    if (wasRemoved) return res.status(200).send({ wasRemoved });
    else
      return next(new HttpException(400, "Unable to unfollow this vacation"));
  }
);

//HELPER FUNCTIONS

async function _createTokens(
  userId: number,
  isAdmin: number | boolean | undefined
) {
  if (Number(userId) === NaN || Number(isAdmin) === NaN)
    return [undefined, undefined];
  const newAccessToken = _generateAccessToken({
    isAdmin,
    userId,
  });

  const newRefreshToken = await _generateRefreshToken({
    isAdmin,
    userId,
  });
  return [newAccessToken, newRefreshToken];
}

function _generateAccessToken(claims: { [key: string]: any }) {
  const accessToken = jwt.sign(claims, process.env.JWT_SECRET || "secret", {
    expiresIn: `${60 * 15}s`,
  });

  return accessToken;
}

async function _generateRefreshToken(claims: {
  [key: string]: any;
  userId: number;
}) {
  const { userId } = claims;
  const refresh_token_expiration = Date.now() + 60 * 60 * 24 * 2; //2 days
  const jwt_token = jwt.sign(
    { ...claims },
    process.env.JWT_SECRET || "secret",
    { expiresIn: `${refresh_token_expiration}s` }
  );

  //insert new refreshToken to DB
  const tokenAdded = await insertRefreshToken({
    jwt_token,
    userId: Number(userId),
  });
  console.log(
    `_generaterefreshtoken: refresh token was added to server?`,
    tokenAdded
  );
  console.log(`this is the token added===>`, jwt_token);
  if (tokenAdded) return jwt_token;
}

async function _checkRefreshTokenOrLoginParams(
  username: string,
  password: string,
  refreshToken: string
) {
  if (!username && !password && !refreshToken) return null;
  if (!username && !password && refreshToken) {
    //check req.cookie for refresh token.
    const decodedUser = jwt.verify(
      refreshToken,
      process.env.JWT_SECRET || "secret" //check existence and validity of jwt.
    );
    if (!decodedUser) return null;
    const user = await getUserFromRefreshToken(refreshToken); //query db and RETURN USER DATA and POPULATE userDetails
    if (user) return user;
  }

  if (username && password) {
    //check if provided username matches the provided password using a db query RETURN USER DATA and POPULATE userDetails
    const user = await getUser(username);
    const isUser =
      user?.hashedPassword &&
      (await bcrypt.compare(password, user.hashedPassword));
    if (isUser) return user;
  }
  return null; // (401.. username or pass is wrong or was provided)
}
