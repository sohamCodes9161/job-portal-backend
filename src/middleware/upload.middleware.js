import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import {cloudinary} from "../utils/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "job-portal/resumes",
    resource_type: "raw", // important for PDFs
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "application/pdf" &&
    file.originalname.endsWith(".pdf")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

export default upload;