import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js"

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
  if(existedUser) throw new ApiError(400,"User already exists");

  //creating user
  const user = await User.create({username,email,password});

  const createdUser = await User.findById(user._id).select("-password");

  if(!createdUser) throw new ApiError(400,"Something went wrong while registering the user");

  //send response
  return res.status(200).json(
    new ApiResponse(200,createdUser,"User registered successfully")
  );
});

export {registerUser};