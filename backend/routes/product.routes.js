import { postProds, getAllProds, getProd, allCategories } from '../controllers/product.controller.js'
import express from 'express'

const router = express.Router()

router.post('/products', postProds)
router.get('/products', getAllProds)
router.get('/products/:id', getProd)
router.get('/allcates', allCategories)

export default router