import Product from "../models/product.model.js"
import wishlist from "../models/wishlist.model.js"

async function toggleWish(req, res) {
    const id = req.params.id
    const userId = req.user._id

    const prod = await Product.findById(id)
    if (!prod) {
        return res.status(404).send('product not found')
    }

    const wishProd = await wishlist.findOne({ userId: userId, prodId: id })
    if (!wishProd) {
        const wish = await wishlist.create({
            userId: userId,
            prodId: id
        })

        return res.status(200).json({
            "success": true,
            "message": "Product added to wishlist"
        })
    } else {
        const delWish = await wishlist.deleteOne({
            userId: userId,
            prodId: id
        })

        return res.status(200).json({
            "success": true,
            "message": "Product removed from wishlist"
        })
    }
}

async function getWishes(req, res) {
    const userId = req.user._id

    try {
        const wishes = await wishlist.find({ userId: userId }).populate('prodId');
        const validWishes = wishes.filter(w => w.prodId);
        const wishesFilt = validWishes.map((w) => w.prodId);

        return res.status(200).json({
            success: true,
            products: wishesFilt
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export { toggleWish, getWishes }