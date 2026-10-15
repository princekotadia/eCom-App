import userModel from "../models/customer.model.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

async function register(req, res) {
    const { fullName, email, password, phone } = req.body

    const cleanName = fullName?.trim()
    const cleanEmail = email?.trim()?.toLowerCase()
    const cleanPhone = phone?.toString()?.trim()

    if (!cleanName || !cleanEmail || !password || !cleanPhone) {
        return res.status(400).json({
            success: false,
            message: "Please provide all required fields"
        })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail)) {
        return res.status(400).json({
            success: false,
            message: "Please enter a valid email address"
        })
    }

    const phoneRegex = /^[0-9]{10}$/
    if (!phoneRegex.test(cleanPhone)) {
        return res.status(400).json({
            success: false,
            message: "Phone number must be a valid 10-digit number"
        })
    }

    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 6 characters long"
        })
    }

    const existingUser = await userModel.findOne({ email: cleanEmail })
    if (existingUser) {
        return res.status(409).json({
            success: false,
            message: "Email already exists"
        })
    }

    const user = await userModel.create({
        fullName: cleanName,
        email: cleanEmail,
        password: await bcrypt.hash(password, 10),
        phone: cleanPhone
    })

    res.status(201).json({
        success: true,
        message: "Customer registered successfully",
        customer: {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            createdAt: user.createdAt
        }
    })
}

async function login(req, res) {
    const { email, password } = req.body

    const cleanEmail = email?.trim()?.toLowerCase()

    if (!cleanEmail || !password) {
        return res.status(400).json({
            success: false,
            message: "Please provide all required fields"
        })
    }

    const existingUser = await userModel.findOne({ email: cleanEmail })
    if (!existingUser) {
        return res.status(401).json({
            "message": "Invalid email or password"
        })
    }

    const chkPwd = await bcrypt.compare(password, existingUser.password)
    if (!chkPwd) {
        return res.status(401).json({
            "message": "Invalid email or password"
        })
    }

    const payload = {
        id: existingUser._id,
    }

    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' })

    const isProduction = process.env.NODE_ENV === "production";

    return res.cookie("jwtToken", jwtToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
        maxAge: 60 * 60 * 1000,
    }).status(200).json({
        "success": true,
        "message": "Login successful",
    })
}

async function profile(req, res) {
    const user = req.user;
    return res.status(200).json({
        "customer": {
            "_id": user._id,
            "fullName": user.fullName,
            "email": user.email,
            "phone": user.phone,
        }
    })
}

async function logout(req, res) {
    const isProduction = process.env.NODE_ENV === "production";

    return res.clearCookie("jwtToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
    })
        .status(200)
        .json({
            "success": true,
            "message": "Logged out successfully"
        })
}

export {
    register,
    login,
    profile,
    logout
}