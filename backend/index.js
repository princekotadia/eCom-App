import express from "express";
import cookieParser from "cookie-parser";
const app = express();
import mongoose from "mongoose";
import "dotenv/config";
import customerRouter from "./routes/customer.routes.js";
import productRoutes from "./routes/product.routes.js";
import wishRoutes from "./routes/wishlist.routes.js";
import cors from "cors";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
}));


mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("aahhhhh connected");
    }).catch((err) => {
        console.error("Error connecting to MongoDB", err);
    });

app.use(express.json());
app.use(cookieParser());
app.use("/customers", customerRouter);
app.use('/wishlist', wishRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/", productRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 