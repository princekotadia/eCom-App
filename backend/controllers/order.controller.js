import userModel from "../models/customer.model.js";
import order from "../models/order.model.js";
import Product from "../models/product.model.js";
import crypto from "crypto";
import mongoose from "mongoose";
import razorpay from "../config/razorpay.js";

async function cr8Order(req, res) {
    try {
        const shipAdd = req.body.shippingAddress;
        const userId = req.user._id;

        const user = await userModel.findOne({ _id: userId }).populate('cart.product');

        if (!user || !user.cart || user.cart.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty."
            });
        }

        for (const item of user.cart) {
            if (!item.product) {
                return res.status(400).json({
                    success: false,
                    message: "One or more products in your cart are no longer available."
                });
            }

            if (item.quantity > item.product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${item.product.name}.`
                });
            }
        }

        const orderItems = user.cart.map(item => ({
            product: item.product._id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            image: item.product.image
        }));

        const totalAmount = user.cart.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
        );

        const newOrder = await order.create({
            user: userId,
            items: orderItems,
            shippingAddress: shipAdd,
            totalAmount,
            status: "PENDING_PAYMENT",
            paymentStatus: "PENDING"
        });

        // 2. Create Razorpay Order
        const amountInRupees = totalAmount;
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(amountInRupees * 100),
            currency: "INR",
            receipt: newOrder._id.toString()
        });

        // 3. Save returned Razorpay Order ID to the order document
        newOrder.razorpayOrderId = razorpayOrder.id;
        await newOrder.save();

        // 4. Return safe checkout information
        return res.status(201).json({
            success: true,
            shopKartOrderId: newOrder._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
}

async function verifyPayment(req, res) {
    try {
        const {
            shopKartOrderId = req.body.orderId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;
        const userId = req.user._id;

        if (!shopKartOrderId || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Missing required payment verification parameters."
            });
        }

        // 1. Fetch order from DB to get the TRUSTED Razorpay Order ID
        const shopKartOrder = await order.findOne({ _id: shopKartOrderId, user: userId });
        if (!shopKartOrder) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        // 2. IMPORTANT: Use the Razorpay Order ID stored in your database as the trusted order ID
        const body = shopKartOrder.razorpayOrderId + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            shopKartOrder.paymentStatus = "FAILED";
            await shopKartOrder.save();
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature"
            });
        }

        // 3. Confirm the order after signature verification succeeds
        shopKartOrder.paymentStatus = "PAID";
        shopKartOrder.status = "PLACED";
        shopKartOrder.razorpayPaymentId = razorpay_payment_id;
        await shopKartOrder.save();

        // 4. Deduct stock from database
        if (shopKartOrder.items && shopKartOrder.items.length > 0) {
            for (const item of shopKartOrder.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: -item.quantity }
                });
            }
        }

        // 5. Clear the user's cart in database
        const user = await userModel.findById(userId);
        if (user) {
            user.cart = [];
            await user.save();
        }

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            order: shopKartOrder
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Payment verification error"
        });
    }
}

async function getOrderById(req, res) {
    try {
        const orderId = req.params.id;
        const userId = req.user._id;

        const foundOrder = await order.findById(orderId);
        if (!foundOrder) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        if (foundOrder.user.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You do not have permission to view this order."
            });
        }

        return res.status(200).json({
            success: true,
            order: foundOrder
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
}

async function getUserOrders(req, res) {
    try {
        const userId = req.user._id;

        const orders = await order
            .find({ user: userId })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
}

export { cr8Order, verifyPayment, getOrderById, getUserOrders };
