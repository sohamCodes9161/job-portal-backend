import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import asyncHandler from "../middleware/asyncHandler.js";
import ErrorHandler from "../utils/errorHandler.js";

/* ================================
   🔐 TOKEN GENERATORS
================================ */

const generatetoken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1m"  } // short-lived
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" } // long-lived
  );
};

/* ================================
   🔑 LOGIN
================================ */

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ErrorHandler("Email and password required", 400);
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ErrorHandler("Invalid credentials", 401);
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new ErrorHandler("Invalid credentials", 401);
  }

  const token = generatetoken(user);
  const refreshToken = generateRefreshToken(user);

  // 💾 Save refresh token in DB
  user.refreshToken = refreshToken;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
});

/* ================================
   📝 REGISTER
================================ */

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ErrorHandler("All required fields must be provided", 400);
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ErrorHandler("User already exists", 400);
  }

  const user = await User.create({
    name,
    email,
    password,
    role: "user",
  });

  const token = generatetoken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    token,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
});

/* ================================
   🔄 REFRESH TOKEN
================================ */

export const refreshtoken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new ErrorHandler("No refresh token provided", 401);
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      throw new ErrorHandler("Invalid refresh token", 403);
    }

    const newtoken = generatetoken(user);

    res.status(200).json({
      success: true,
      token: newtoken,
    });
  } catch (err) {
    throw new ErrorHandler("Refresh token expired or invalid", 403);
  }
});

/* ================================
   🚪 LOGOUT
================================ */

export const logoutUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    user.refreshToken = null;
    await user.save();
  }

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});