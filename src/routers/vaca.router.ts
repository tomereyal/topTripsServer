import { Request, Router, Response, NextFunction } from "express";
import {
  deleteVacationInDb,
  getRemainingVacationTotal,
  getVacationsFollowStatsFromDb,
  getVacationsFromDb,
  getVacationsUserFollowsFromDb,
  getVacationTotal,
  insertNewVacation,
  updateVacationInDb,
} from "../db/queries/vaca.queries";
import HttpException from "../exceptions/HttpException";
import { authAdmin } from "../middleware/auth.middleware";
import { VacationModel } from "../models/vaca.model";
import { PaginationQuery, RequestWithToken, VacationStat } from "../types";

export const vacationRouter = Router();

//=======================GET======================================
vacationRouter.get(
  "/",
  async (
    req: Request<any, any, any, PaginationQuery>,
    res: Response<VacationModel[]>,
    next: NextFunction
  ) => {
    const { current, fetchSize } = req.query;
    //@ts-ignore
    const userId = req.user?.userId;
    if (!current || !fetchSize)
      return next(
        new HttpException(
          401,
          `Error in params given to req: current: ${current}, fetchSize: ${fetchSize}`
        )
      );
    const vacations = await getVacationsFromDb(
      {
        current: Number(current),
        fetchSize: Number(fetchSize),
      },
      Number(userId)
    );
    if (vacations) return res.status(200).send(vacations);
    else
      return next(
        new HttpException(
          404,
          `Error in params given to DB Query: current: ${current}, fetchSize: ${fetchSize} 
          or Error in DB query itself resulting in: vacations = ${vacations}`
        )
      );
  }
);
vacationRouter.get(
  "/followedByUser",
  async (req: Request, res: Response<VacationModel[]>, next: NextFunction) => {
    const myReq = req as RequestWithToken;
    const id = myReq.user.userId;
    const vacations = await getVacationsUserFollowsFromDb(Number(id));
    if (vacations) return res.status(200).send(vacations);
  }
);

vacationRouter.get(
  "/vacationsFollowStats",
  authAdmin,
  async (req: Request, res: Response<VacationStat[]>, next: NextFunction) => {
    const vacationsFollowStats = await getVacationsFollowStatsFromDb();
    if (vacationsFollowStats) return res.status(200).send(vacationsFollowStats);
    else
      return new HttpException(500, "Internal error retrieving follow stats.");
  }
);
vacationRouter.get(
  "/total",

  async (
    req: Request,
    res: Response<{ total: number }>,
    next: NextFunction
  ) => {
    const userId = (req as RequestWithToken).user.userId;
    console.log(`userId`, userId);
    const total = await getRemainingVacationTotal(Number(userId));
    if (total) return res.status(200).send({ total });
    else return new HttpException(500, "Internal error retrieving total.");
  }
);

//=======================POST======================================
vacationRouter.post(
  "/",
  authAdmin,
  async (
    req: Request<any, any, Partial<VacationModel>>,
    res: Response<{ vacationId: number }>,
    next: NextFunction
  ) => {
    const { title, fromDate, toDate, price, url, description } = req.body;
    console.log(`req.body `, req.body);

    const vacationId = await insertNewVacation({
      title,
      description,
      fromDate,
      toDate,
      price,
      url,
    });

    if (vacationId) return res.status(200).send({ vacationId });
  }
);

//=======================UPDATE======================================
vacationRouter.patch(
  "/",
  authAdmin,
  async (
    req: Request<any, any, Partial<VacationModel>, any>,
    res: Response<{ wasUpdated: boolean }>,
    next: NextFunction
  ) => {
    const { id, title, description, price, fromDate, toDate, url } = req.body;
    console.log(`updatingg vacation in db`, id);
    const wasUpdated = await updateVacationInDb({
      title,
      description,
      price,
      fromDate,
      toDate,
      url,
      id: Number(id),
    });
    console.log(`updated vacation #:`, id);

    if (wasUpdated) return res.status(200).send({ wasUpdated });
    else
      return next(
        new HttpException(500, "We found a problem with the database")
      );
  }
);

//=======================DELETE======================================

vacationRouter.delete(
  "/:vacationId",
  authAdmin,
  async (
    req: Request<{ vacationId: string }>,
    res: Response<{ wasDeleted: boolean }>,
    next: NextFunction
  ) => {
    const { vacationId } = req.params;

    if (!vacationId)
      return next(
        new HttpException(500, "please provide vacation id" + vacationId)
      );

    const wasDeleted = await deleteVacationInDb(Number(vacationId));

    if (wasDeleted) return res.status(200).send({ wasDeleted });
    else
      return next(
        new HttpException(
          500,
          "We found a problem deleting vacation in the database"
        )
      );
  }
);
