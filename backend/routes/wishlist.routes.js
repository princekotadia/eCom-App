import { toggleWish, getWishes } from "../controllers/wishlist.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import express from "express";

const wishRoutes = express.Router()

wishRoutes.post('/:id', authMiddleware, toggleWish)
wishRoutes.get('/', authMiddleware, getWishes)
// wishRoutes.delete('/:id', authMiddleware, delWish)

export default wishRoutes