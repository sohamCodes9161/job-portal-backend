import express from "express";
import {getMe,updateUser,deleteUser} from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { loginUser,registerUser,refreshtoken,logoutUser} from "../controllers/auth.controller.js";    
import { uploadResume } from "../controllers/user.controller.js";

import upload from "../middleware/upload.middleware.js";


const router=express.Router();

router.post("/login",loginUser);
router.post("/refresh",refreshtoken);
router.post("/logout",authMiddleware,logoutUser);
router.put("/:id",authMiddleware,updateUser);
router.delete("/:id",authMiddleware,deleteUser);

router.post("/register",registerUser);
router.get("/me",authMiddleware,getMe);
router.post(
  "/upload-resume",
  authMiddleware,
  upload.single("resume"),
  uploadResume
);
export default router;