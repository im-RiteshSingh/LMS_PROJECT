// Register User
// Login User
// Logout User
// GetProfile
// ForgotPassword
// ResetPassword
// ChangePassword
// Update User


import AppError from '../utils/appError.js';
import User from '../models/user.models.js';
import cloudinary from 'cloudinary';
import fs from 'fs/promises'


const cookieOptions = {
  secure: true,
  maxAge: 7 * 24 * 24 * 60 * 1000,
  httpOnly: true,
  sameSite: "none"

}

// register user

const register = async (req, res, next) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return next(new AppError(400, 'All fields are required'));
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    return next(new AppError(400, 'User already exists'));
  }

  const user = await User.create({
    fullName,
    email,
    password,
    avatar: {
      public_id: '',
      secure_url: ''
    }
  });

  if (!user) {
    return next(new AppError(400, 'User registration failed'))
  }

  if (req.file) {
    try {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: 'lms',
        width: 250,
        height: 250,
        gravity: 'faces',
        crop: 'fill'
      });
      if (result) {
        user.avatar.public_id = result.public_id;
        user.avatar.secure_url = result.secure_url;

        fs.rm(`uploads/${req.file.filename}`);
      }
    } catch (error) {
      return next(new AppError(500, error.message || 'File not uploaded'))
    }
  }

  await user.save();

  user.password = undefined;

  res.status(200).json({
    success: true,
    message: 'User registered successfully',
    user
  })
}

// login user

const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError(400, 'All fields are required'));
  }

  const user = await User.findOne({
    email
  }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    res.status(401).json({
      success: false,
      message: 'Email or password do not match'
    });

    return;
  }

  const token = await user.generateJWTToken();
  user.password = undefined;

  res.cookie('token', token, cookieOptions);

  res.status(201).json({
    success: true,
    message: 'User LoggedIn Successfully',
    user
  })

}

// logout user

const logout = (req, res) => {
  res.cookie('token', null, {
    secure: true,
    maxAge: 0,
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully'
  })

}

const getProfile = async (req, res) => {
  const { id } = req.user
  try {
    const user = await User.findById(id);

    res.status(200).json({
      success: true,
      message: 'User details',
      user
    })
  } catch (error) {
    throw new AppError(400, error.message)
  }


}


export { register, login, logout, getProfile };