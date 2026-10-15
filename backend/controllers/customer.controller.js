import userModel from "../models/customer.model.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

async function register(req, res) {
    const { fullName, email, password, phone } = req.body

    if (!fullName || !email || !password || !phone) {
        return res.status(400).json({
            "message": "Please provide all required fields"
        })
    }

    const existingUser = await userModel.findOne({ email: email })
    if (existingUser) {
        return res.status(409).json({
            "message": "Email already exists"
        })
    }

    if (password.length < 6) {
        return res.status(400).json({
            "message": "Password must be at least 6 characters long"
        })
    }

    const user = await userModel.create({
        fullName: fullName,
        email: email,
        password: await bcrypt.hash(password, 10),
        phone: phone
    })

    res.status(201).json({
        "success": true,
        "message": "Customer registered successfully",
        "customer": {
            "_id": user._id,
            "fullName": user.fullName,
            "email": user.email,
            "phone": user.phone,
            "createdAt": user.createdAt
        }
    })
}

async function login(req, res) {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({
            "message": "Please provide all required fields"
        })
    }

    const existingUser = await userModel.findOne({ email: email })
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

    return res.cookie("jwtToken", jwtToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
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
    return res.clearCookie("jwtToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
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