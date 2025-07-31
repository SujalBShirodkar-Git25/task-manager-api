import { User } from "../models/user.model.js";
import { Task } from "../models/task.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createTask = asyncHandler(async(req,res) => {
  const {title,description,status,dueDate} = req.body;

  if(!title || !description) throw new ApiError(400,"Task details not provided !!");

  const task = await Task.create({
    title,
    description,
    status,
    dueDate,
    owner: req.user._id
  });

  if(!task) throw new ApiError(400,"Error while creating task !!");

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $push: {
        tasks: task._id
      }
    },
    {new: true}
  );

  res.status(200).json(
    new ApiResponse(200,task,"Task created successfully !!")
  );
});

export {createTask};