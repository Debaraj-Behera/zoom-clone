import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import bcrypt from 'bcryptjs';
import crypto from "crypto";
import { Meeting } from "../models/meeting.model.js";

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "Invalid username or passward" });
    }
    if (isMatch) {
      let token = crypto.randomBytes(20).toString("hex");
      user.token = token;
      await user.save();
      return res.status(httpStatus.OK).json({
        message: "Login successful",
        token: token,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const register = async (req, res) => {
  const { name, username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(httpStatus.FOUND)
        .json({ message: "User already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name: name,
      username: username,
      password: hashPassword,
    });

    await newUser.save();

    res.status(httpStatus.CREATED).json({
      message: "User registered successfully",
    });
  } catch (error) {
    console.log(error);
  }
};

const getUserHistory = async (req, res) => {
  const {token} = req.query;

  try {
    const user = await User.findOne({token: token});
    const meetings = await Meeting.find({user_id: user.username});
    res.json(meetings);
  } catch (error) {
    console.log(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "Error fetching user history",
    });
  }
}

const addToHistory = async (req, res) => {
  const {token, meeting_code} = req.body;

  try {
    const user = await User.findOne({token: token});
    const newMeeting = new Meeting({
      user_id: user.username,
      meetingCode: meeting_code
    });
    await newMeeting.save();
    res.status(httpStatus.CREATED).json({
      message: "Meeting added to history",
    });
  } catch (error) {
    console.log(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "Error adding to history",
    });
    
  }
}
export { login, register, getUserHistory, addToHistory };