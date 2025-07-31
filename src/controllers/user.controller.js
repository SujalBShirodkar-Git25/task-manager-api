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
  if(existedUser) throw new ApiError(400,"User already exists !!");

  //creating user
  const user = await User.create({username,email,password});

  const createdUser = await User.findById(user._id).select("-password");

  if(!createdUser) throw new ApiError(400,"Something went wrong while registering the user !!");

  //send response
  return res.status(200).json(
    new ApiResponse(200,createdUser,"User registered successfully")
  );
});

const loginUser = asyncHandler(async (req,res) => {
  const {username,email,password} = req.body;

  if(!password || !(username || email)) throw new ApiError(400,"User details not provided !!");

  const user = await User.findOne({
    $or: [{username},{email}]
  });

  if(!user) throw new ApiError(400,"User not found !!");

  if(!(await user.isPasswordCorrect(password))) throw new ApiError(400,"Password is incorrect !!");

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
  const user = await User.findByIdAndUpdate(
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

  if(!incomingRefreshToken) throw new ApiError(400,"Unauthorized Access !!");

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id);

    if(!user) throw new ApiError(400,"Invalid refresh token, please login again !!");

    if(incomingRefreshToken !== user?.refreshToken) throw new ApiError(400,"Invalid refresh token, please login again !!");

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

    res.status(400)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
      new ApiResponse(
        400,
        {},
        "Refresh token is expired, please login again !!"
      )
    );
  }
});

export {registerUser,loginUser,logoutUser,refreshAccessToken};