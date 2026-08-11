import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary } from "../utils/cloudinary.js";

// ---- Resume uploads (PDF only) ----
const resumeStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "job-portal/resumes",
    resource_type: "raw", // important for PDFs
  },
});

const resumeFileFilter = (req, file, cb) => {
  if (
    file.mimetype === "application/pdf" &&
    file.originalname.endsWith(".pdf")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files allowed"), false);
  }
};

const upload = multer({ storage: resumeStorage, fileFilter: resumeFileFilter });

// ---- Avatar uploads (images only) ----
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "job-portal/avatars",
    resource_type: "image",
    transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
  },
});

const avatarFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files allowed"), false);
  }
};

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: avatarFileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

export default upload;
export { uploadAvatar };
