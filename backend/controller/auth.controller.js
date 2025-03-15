import User from "../model/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { validateEmail, validatePassword } from "../utils/validate.utils.js";

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser)
      return res.status(400).json({ message: "Username already exists" });

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail)
      return res.status(400).json({ message: "Email already exists" });

    if (!validateEmail(email))
      return res.status(400).json({ message: "Invalid email" });

    if (!validatePassword(password))
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_KEY, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: process.env.JWT_EXPIRES_IN,
      sameSite: "strict",
    });

    res
      .status(201)
      .json({ message: "User created successfully", id: user.id, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect password" });
    const token = jwt.sign({ id: user.id }, process.env.JWT_KEY, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.session.userId = user.id;
    res.session.username = user.username;
    res.session.isLoggedIn = true;

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: process.env.JWT_EXPIRES_IN,
      sameSite: "strict",
    });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const logout = async (req, res) => {
  try {

    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: "Failed to logout" });
        }
        res.clearCookie('token');
        res.status(200).json({ message: "Logged out successfully" });
    });

    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { register, login, logout };
