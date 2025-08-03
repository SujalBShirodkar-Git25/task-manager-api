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

const getAllTask = asyncHandler(async(req,res) => {
  res.status(200).json(
    new ApiResponse(
      200,
      req.user.tasks,
      "Tasks fetched successfully"
    )
  );
});

const getTask = asyncHandler(async(req,res) => {
  const taskId = req.params?.id;

  if(!taskId) throw new ApiError(400,"Task id missing !!");

  const task = await Task.findById(taskId);

  if(!task) throw new ApiError(400,"Invalid task id !!");

  res.status(200).json(
    new ApiResponse(200,task,"Task fetched successfully")
  );
});

const updateTask = asyncHandler(async(req,res) => {
  const taskId = req.params.id;
  const {title,description,status,dueDate} = req.body;
  
  if(!taskId) throw new ApiError(400,"Task id missing !!");

  const updates={};
  if(title) updates.title=title; 
  if(description) updates.description=description; 
  if(status) updates.status=status; 
  if(dueDate) updates.dueDate=dueDate;

  const task = await Task.findByIdAndUpdate(
    taskId,
    {
      $set: updates
    },
    {new: true}
  );

  if(!task) throw new ApiError(400,"Invalid task id !!");

  res.status(200).json(
    new ApiResponse(200,task,"Task updated successfully")
  );
});

const deleteTask = asyncHandler(async(req,res) => {
  const taskId = req.params?.id;

  if(!taskId) throw new ApiError(400,"Task id missing !!");

  const deletedTask = await Task.findByIdAndDelete(taskId);

  if(!deletedTask) throw new ApiError(400,"Task id not found !!");

  res.status(200).json(
    new ApiResponse(200,deletedTask,"Task deleted successfully")
  );
});

export {createTask,getAllTask,getTask,updateTask,deleteTask};