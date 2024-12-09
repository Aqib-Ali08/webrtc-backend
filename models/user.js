import { Schema, model } from "mongoose";

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  gender:{
    type: String,
    required: true,
    enum:['Male','Female','Other']
  },
  profilePic: {
    type: String,
    default: "",
  },
});

export default model("User", UserSchema);
