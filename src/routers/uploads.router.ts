import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { authAdmin } from "../middleware/auth.middleware";
const imgbbUploader = require("imgbb-uploader");
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

// uploadRouter.post("/", authAdmin, upload.single("avatar"), async (req, res) => {

//   const fileType = req.file?.mimetype.split("/")[1];
//   const newFilename = req.file?.filename + "." + fileType;
//   console.log(`newFilename`, newFilename);
//   fs.rename(
//     `./uploads/${req.file?.filename}`,
//     `./uploads/${newFilename}`,
//     () => {
//       const serverName =
//         process.env.NODE_ENV === "production"
//           ? "https://toptrips.herokuapp.com"
//           : process.env.SERVER_URL;

//       console.log(`url: `, `${serverName}/uploads/${newFilename}`);
//       res.status(200).send({ url: `${serverName}/uploads/${newFilename}` });
//     }
//   );
// });
uploadRouter.post("/", authAdmin, async (req, res) => {
  imgbbUploader("your-imgbb-api-key-string", "path/to/your/image.png")
    //@ts-ignore
    .then((response) => {
      console.log(response);
      res.status(200).send({ url: `` });
    })
    //@ts-ignore

    .catch((error) => console.error(error));
});
