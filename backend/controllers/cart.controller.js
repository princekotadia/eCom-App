import userModel from "../models/customer.model.js"
import Product from "../models/product.model.js"

async function add2Cart(req, res) {
    try {
        const id = req.params.id
        const userId = req.user._id

        const prod = await Product.findOne({ _id: id })
        if (!prod) {
            return res.status(404).json({
                "success": false,
                "message": "Product not available"
            })
        }
        if (prod.stock < 1) {
            return res.status(400).json({
                "success": false,
                "message": "Stock not available"
            })
        }

        const isPresent = await userModel.findOne({
            _id: userId,
            "cart.product": id
        })
        // console.log(isPresent)

        if (isPresent) {
            const cartItem = isPresent.cart.find(item => item.product.toString() === id);
            if (cartItem && (cartItem.quantity + 1 > prod.stock)) {
                return res.status(400).json({
                    "success": false,
                    "message": "Cannot exceed available stock"
                });
            }

            await userModel.updateOne({
                _id: userId,
                "cart.product": id
            }, { $inc: { "cart.$.quantity": 1 } })

        } else {
            await userModel.updateOne({
                _id: userId
            }, { $push: { cart: { product: id, quantity: 1 } } })
        }

        const cart = await userModel.findOne({ _id: userId })

        return res.status(200).json({
            "success": true,
            "message": "Cart updated",
            "cart": cart.cart
        })
    } catch (error) {
        return res.status(500).json({
            "success": false,
            "message": error
        })
    }
}

async function usrCart(req, res) {
    try {
        const userId = req.user._id

        const usr = await userModel.findById(userId).populate('cart.product')
        if (!usr) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        const validItems = (usr.cart || []).filter(item => item && item.product)

        // Self-heal cart if there were orphaned/deleted product entries
        if (usr.cart && validItems.length !== usr.cart.length) {
            usr.cart = validItems.map(item => ({
                product: item.product._id,
                quantity: item.quantity
            }))
            await usr.save()
        }

        const cart = validItems.map(item => {
            return {
                product: {
                    _id: item.product._id,
                    name: item.product.name,
                    price: item.product.price,
                    image: item.product.image,
                    stock: item.product.stock
                },
                quantity: item.quantity
            };
        })

        return res.status(200).json({
            "success": true,
            "cart": cart
        })
    } catch (error) {
        return res.status(500).json({
            "success": false,
            "message": error.message || "Internal server error"
        })
    }
}

async function updtCart(req, res) {
    try {
        const userId = req.user._id
        const id = req.params.id
        const count = req.body.quantity

        if (count < 1 || !Number.isInteger(count)) {
            return res.status(400).json({
                "success": false,
                "message": "Quantity must be greater than 1 and whole number"
            })
        }

        const prod = await Product.findOne({ _id: id })
        if (!prod) {
            return res.status(404).json({
                "success": false,
                "message": "product not found"
            })
        }

        if (count > prod.stock) {
            return res.status(400).json({
                "success": false,
                "message": "Not enought stock available"
            })
        }

        const prodInUsr = await userModel.findOne({ _id: userId, "cart.product": id })
        if (!prodInUsr) {
            return res.status(404).json({
                "success": false,
                "message": "product not added to cart"
            })
        }

        await userModel.findOneAndUpdate({ _id: userId, "cart.product": id }, { $set: { "cart.$.quantity": count } })

        return res.status(200).json({
            "success": true,
            "message": "Cart updated"
        })

    } catch (error) {
        return res.status(500).json({
            "success": false,
            "message": "internal server error"
        })
    }
}

async function delCart(req, res) {
    try {
        const userId = req.user._id
        const id = req.params.id

        const prod = await Product.findOne({ _id: id })
        if (!prod) {
            return res.status(404).json({
                "success": false,
                "message": "product not found"
            })
        }

        const prodInUsr = await userModel.findOne({ _id: userId, "cart.product": id })
        if (!prodInUsr) {
            return res.status(404).json({
                "success": false,
                "message": "product not added to cart"
            })
        }

        const del = await userModel.findOneAndUpdate(
            { _id: userId },
            { $pull: { cart: { product: id } } },
            { returnDocument: "after" }
        ).populate('cart.product')

        const validItems = (del?.cart || []).filter(item => item && item.product)
        const cart = validItems.map(item => {
            return {
                product: {
                    _id: item.product._id,
                    name: item.product.name,
                    price: item.product.price,
                    image: item.product.image,
                    stock: item.product.stock
                },
                quantity: item.quantity
            };
        })

        return res.status(200).json({
            "success": true,
            "message": "Item deleted from cart",
            "cart": cart
        })
    } catch (error) {
        return res.status(500).json({
            "success": false,
            "message": error.message || "internal server error"
        })
    }
}

export { add2Cart, usrCart, updtCart, delCart }