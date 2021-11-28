import cloudinarys from "cloudinary";
import { config } from "dotenv";
import path from "path";
export const cloudinary = cloudinarys.v2;

config({ path: path.join(path.resolve("./"), "src/", ".env") });

process.env.NODE_ENV === "production"
  ? cloudinary.config({
      cloud_name: "hx76lkdc6",
      api_key: "518448317563994",
      api_secret: "FayiwwH3fb8OlqWdnut7j3nzYM8",
    })
  : cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

//for PRODUCTION !
