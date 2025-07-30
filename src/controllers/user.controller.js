import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js"

const generateRefreshTokens = async(user) => {
  const refreshToken = await user.generateRefreshToken();
  await user.save({validateBeforeSave: false});

  return refreshToken;
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
  const accessToken = await user.generateAccessToken();

  //generate refresh token
  let refreshToken;
  if(!user.refreshToken){
    refreshToken = await generateRefreshTokens(user);
  }

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
        user: loggedInUser,accessToken,refreshToken
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
  .cookie("accessToken", options)
  .cookie("refreshToken", options)
  .json(
    new ApiResponse(200,{},"User logged out successfully")
  );
});

export {registerUser,loginUser,logoutUser};