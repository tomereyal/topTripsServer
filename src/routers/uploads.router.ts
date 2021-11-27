import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { authAdmin } from "../middleware/auth.middleware";
export const uploadRouter = Router();

// STORAGE MULTER CONFIG
const upload = multer({
  dest: "./uploads/",
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== ".jpg" && ext !== ".png" && ext !== ".mp4") {
      return cb(new Error("only jpg, png, mp4 is allowed"));
    }
    cb(null, true);
  },
});

uploadRouter.post("/", authAdmin, upload.single("avatar"), (req, res) => {
  const fileType = req.file?.mimetype.split("/")[1];
  const newFilename = req.file?.filename + "." + fileType;
  console.log(`newFilename`, newFilename);
  fs.rename(
    `./uploads/${req.file?.filename}`,
    `./uploads/${newFilename}`,
    () => {
      res.status(200).send({ url: `${process.env.SERVER_URL}/${newFilename}` });
    }
  );
});
