import mongoose,{Schema} from "mongoose";

const taskSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  status: {
    type: String,
    enum: ["pending","in progress","completed"],
    default: "pending",
    required: true
  },
  dueDate: {
    type: String,
  }
},{timestamps: true});

export const Task = mongoose.model("Task", taskSchema);