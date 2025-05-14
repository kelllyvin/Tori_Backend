
const mongoose = require("mongoose")
const Schema = mongoose.Schema

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full Name is Requireed"],
    },
    email: {
      type: String,
      required: [true, "Email is Required"],
      unique: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    phoneNumber: {
      type: String,
      unique: true,
      match: /^\+?[1-9][0-9]{7,14}$/
    },
    profilepicture: {
      type: String,
      default:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5c2QCGWIDwM5VfLmcIWkU3aMzzQ18uf2ISQ&s ",
    },
    role: {
      type: String,
      enum: ["tenant", "landlord"],
      default: "tenant",
    },

    password: {
      type: String,
      minlength: [6, "minimum password length is 6"],
      required: [true, "password is required"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);


const USER = mongoose.model ("user", userSchema)
module.exports = USER