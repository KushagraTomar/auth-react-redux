const User = require("../models/User");
const Note = require("../models/Note");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").lean();
  if (!users?.length) {
    return res.status(400).json({ message: "users not found" });
  }
  res.json(users);
});

const createNewUser = asyncHandler(async (req, res) => {
    const {username, password, roles} = req.body
    if(!username || !password) {
        return res.status(400).json({message:'all fields are required'})
    }
    const duplicate = await User.findOne({username}).lean().exec()
    if(duplicate) {
        return res.status(409).json({message:'duplicate username not allowed'})
    }
    const hashPwd = await bcrypt.hash(password, 10)
    const userObject = {username, "password":hashPwd, roles}
    const user = await User.create(userObject)
    if(user) {
        res.status(201).json({message:'new user created'})
    }else{
        res.status(400).json({message:'invalid user data recieved'})
    }
});

const updateUser = asyncHandler(async (req, res) => {
    const {id, username, roles, active, password} = req.body
    const _id=id
    if(!_id||!username||typeof active !=='boolean') {
        return res.status(400).json({message:'all fields are required'})
    }
    const user = await User.findById(_id).exec()
    if(!user) {
        return res.status(400).json({message:'user not found'})
    }

    user.username = username
    user.roles = roles
    user.active = active
    if(password) {
        user.password = await bcrypt.hash(password,10)
    }
    const updateUser = await user.save()
    res.status(201).json({message:'user updated'})
});

const deleteUser = asyncHandler(async (req, res) => {
    const {id} = req.body
    const _id=id
    if(!_id) {
        return res.status(400).json({message:'user id required'})
    }
    const note = await Note.findOne({user:_id}).lean().exec()
    if(note) {
        return res.status(400).json({message:'user has assigned notes'})
    }
    const user = await User.findById(_id).exec()
    if(!user) {
        return res.status(400).json({message:'user not found'})
    }
    const result = await user.deleteOne()
    res.status(201).json({message:`${result.username} deleted`})
});

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
};
