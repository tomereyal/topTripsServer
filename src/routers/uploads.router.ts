import { NextFunction, Router } from "express";

import { authAdmin } from "../middleware/auth.middleware";
import HttpException from "../exceptions/HttpException";
import { cloudinary } from "./../utils/cloudinary";
export const uploadRouter = Router();

uploadRouter.post("/", authAdmin, async (req, res, next: NextFunction) => {
  try {
    const fileStr = req.body.data;
    console.log(`fileStr`, fileStr);
    try {
      const uploadedResponse = await cloudinary.uploader.upload(fileStr, {
        upload_preset: `ml_default`,
      });
      console.log(`uploadedResponse`, uploadedResponse);
      const url = uploadedResponse.url;
      res.status(200).json({ url });
    } catch (error) {
      console.log(`error`, error);
      return next(
        new HttpException(500, `error found: ${JSON.stringify(error)}`)
      );
    }
  } catch (error) {
    return next(
      new HttpException(500, `error found: ${JSON.stringify(error)}`)
    );
  }
});
