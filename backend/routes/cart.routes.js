import express from 'express'
import { add2Cart, updtCart, delCart, usrCart } from '../controllers/cart.controller.js'
import validateToken from '../middlewares/auth.middleware.js'

const cartRoutes = express.Router()

cartRoutes.post("/:id", validateToken, add2Cart)
cartRoutes.get("/", validateToken, usrCart)
cartRoutes.patch("/:id", validateToken, updtCart)
cartRoutes.delete("/:id", validateToken, delCart)

export default cartRoutes