import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    prodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }
})

const wishlist = mongoose.model('wishlist', wishlistSchema)

export default wishlist