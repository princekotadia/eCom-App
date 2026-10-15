import jwt from "jsonwebtoken";
import userModel from "../models/customer.model.js";

async function validateToken(req, res, next) {
    try {
        const token = req.cookies?.jwtToken
        const token = req.cookies?.jwtToken || req.headers.authorization?.replace(/^Bearer\s+/i, "");

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (!decoded || !decoded.id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            })
        }

        const user = await userModel.findById(decoded.id)
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            })
        }

        req.user = user
        next()
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        })
    }
}

export default validateToken;