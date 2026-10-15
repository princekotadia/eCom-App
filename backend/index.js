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

app.set("trust proxy", 1);

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    process.env.CLIENT_URL,
].filter(Boolean).map(url => url.replace(/\/$/, ""));

app.use(cors({
    origin: "http://localhost:5173",
    origin: function (origin, callback) {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);

        const normalizedOrigin = origin.replace(/\/$/, "");
        if (
            allowedOrigins.includes(normalizedOrigin) ||
            normalizedOrigin.endsWith(".vercel.app")
        ) {
            return callback(null, true);
        }

        return callback(new Error(`CORS error: origin ${origin} is not allowed`));
    },
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

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
    res.status(200).json({ status: "ok", message: "E-Commerce API is running" });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 