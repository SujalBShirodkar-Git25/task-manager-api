import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateRefreshTokens = async(user) => {
  try {
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave: false});
  
    return refreshToken;
  } catch (error) {
    throw new ApiError(400,"Something wrong happened while generating refresh token !!",[error]);
  }
};

const generateAccessTokens = async(user) => {
  try {
    const accessToken = await user.generateAccessToken();
    return accessToken;
  } catch (error) {
    throw new ApiError(400,"Something wrong happened while generating access token !!",[error]);
  }
};

const registerUser = asyncHandler(async (req,res) => {
  //take user details
  const {username,email,password} = req.body;

  //check if user details are present or not
  [username,email,password].forEach((userDetail) => {
    if(userDetail === '') throw new ApiError(400,"User details not provided !!");
  });

  //check if there is a existing user or not
  const existedUser = await User.findOne({
    $or: [{username},{email}]
  });

  //if existed user is present throw error
  if(existedUser) throw new ApiError(409,"User already exists !!");

  //creating user
  const user = await User.create({username,email,password});

  const createdUser = await User.findById(user._id).select("-password");

  if(!createdUser) throw new ApiError(500,"Something went wrong while registering the user !!");

  //send response
  return res.status(201).json(
    new ApiResponse(201,createdUser,"User registered successfully")
  );
});

const loginUser = asyncHandler(async (req,res) => {
  const {username,email,password} = req.body;

  if(!password || !(username || email)) throw new ApiError(400,"User details not provided !!");

  const user = await User.findOne({
    $or: [{username},{email}]
  });

  if(!user) throw new ApiError(404,"User not found !!");

  if(!(await user.isPasswordCorrect(password))) throw new ApiError(401,"Password is incorrect !!");

  //generating access token
  const accessToken = await generateAccessTokens(user);

  //generate refresh token
  const refreshToken = await generateRefreshTokens(user);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true
  }

  res.status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new ApiResponse(
      200,
      {
        user: loggedInUser,
        accessToken,
        refreshToken
      },
      "User logged in successfully !!"
    )
  );
});

const logoutUser = asyncHandler(async (req,res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1
      }
    },
    {
      new: true
    }
  );

  const options = {
    httpOnly: true,
    secure: true
  };

  res.status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(
    new ApiResponse(200,{},"User logged out successfully")
  );
});

const refreshAccessToken = asyncHandler(async (req,res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if(!incomingRefreshToken) throw new ApiError(401,"Unauthorized Access !!");

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id);

    if(!user) throw new ApiError(401,"Invalid refresh token, please login again !!");

    if(incomingRefreshToken !== user?.refreshToken) throw new ApiError(401,"Invalid refresh token, please login again !!");

    const newAccessToken = await generateAccessTokens(user);

    const options= {
      httpOnly: true,
      secure: true
    };

    res.status(200)
    .cookie("accessToken",newAccessToken,options)
    .cookie("refreshToken",incomingRefreshToken,options)
    .json(
      new ApiResponse(
        200,
        {
          accessToken: newAccessToken,
          refreshToken: incomingRefreshToken
        },
        "Access token refreshed"
      )
    );
  } catch (error) {
    const options = {
      httpOnly: true,
      secure: true
    };

    res.status(401)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
      new ApiResponse(
        401,
        {},
        "Refresh token is expired, please login again !!"
      )
    );
  }
});

const resetPassword = asyncHandler(async(req,res) => {
  const {oldPassword,newPassword} = req.body;
  const {user} = req;

  if(!oldPassword || !newPassword) throw new ApiError(400,"Both old and new passwords are needed !!");

  const checkPassword = await user.isPasswordCorrect(oldPassword);

  if(!checkPassword) throw new ApiError(400,"Old password is not correct !!");

  user.password = newPassword;
  await user.save();

  res.status(200).json(new ApiResponse(200,{},"Password reset done successfully"));
});

const getUser = asyncHandler(async(req,res) => {
  const currentUser = await User.findById(req.user._id).select("-password -refreshToken");

  res.status(200).json(
    new ApiResponse(
      200,
      currentUser,
      "User fetched successfully"
    )
  );
});

const updateUser = asyncHandler(async(req,res) => {
  const {username,email} = req.body;

  if(!username && !email) throw new ApiError(400,"Either username or email should be present !!");

  const existedUser = await User.findOne({
    $or: [{username},{email}]
  });

  if(existedUser) throw new ApiError(409,"User already exists with given username or password !!");

  const updates = {};
  if(username) updates.username = username;
  if(email) updates.email = email;

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: updates
    },
    {new: true}
  ).select("-password -refreshToken");

  res.status(200).json(
    new ApiResponse(
      200,
      updatedUser,
      "User updated successfully"
    )
  );
});

const deleteUser = asyncHandler(async(req,res) => {
  const deletedUser = await User.findByIdAndDelete(req.user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true
  };

  res.status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(
    new ApiResponse(200,deletedUser,"User deleted successfully")
  );
});

export {registerUser,loginUser,logoutUser,refreshAccessToken,resetPassword,getUser,updateUser,deleteUser};