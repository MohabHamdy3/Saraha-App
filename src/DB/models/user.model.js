import mongoose from "mongoose";

export const userGender = {
  male : "male",
  female : "female"

}
export const userRoles = {
  user : "user",
  admin : "admin"
}

export const userProvider = {
  local : "local",
  google : "google"
}

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: [3, 'Name must be at least 3 characters long'],
    maxlength: [50, 'Name must be at most 50 characters long']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: [5, 'Email must be at least 5 characters long'],
    maxlength: [100, 'Email must be at most 100 characters long']
  },
  password: {
    type: String,
    required: function () {
      return this.provider === userProvider.local
    },
    minlength: [6, 'Password must be at least 6 characters long'],
    maxlength: [1024, 'Password must be at most 1024 characters long'],
  },
  phone: {
    type: String,
    required: function () {
      return this.provider === userProvider.local
    },
    unique: true,
    trim: true
  },
  age: {
        type: Number,
        min: [18, 'Age must be at least 18'],
        max: [60, 'Age must be at most 60'],
        default: 18
  },
  gender : {
        type : String ,
        enum : Object.values(userGender),
        default : userGender.male
  },
  confirmed :{
    type : Boolean,
    default : false
  },
  role : {
    type : String,
    enum : Object.values(userRoles),
    default: userRoles.user
  },
  otp : String,
  image : [String],
  converImages : [String],
  isFrozen : Boolean,
  frozenBy : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "user"
  },
  provider : {
    type : String,
    enum : Object.values(userProvider),
    default : userProvider.local
  }
},
{
  timestamps: true,
});

const userModel = mongoose.model.user || mongoose.model("user", userSchema);

export default userModel;


userModel.syncIndexes()