import express from 'express';
import { cr8Order, verifyPayment, getOrderById, getUserOrders } from '../controllers/order.controller.js';
import validateToken from '../middlewares/auth.middleware.js';

const orderRoutes = express.Router();

orderRoutes.post('/', validateToken, cr8Order);
orderRoutes.post('/create-payment-order', validateToken, cr8Order);
orderRoutes.post('/verify', validateToken, verifyPayment);
orderRoutes.post('/verify-payment', validateToken, verifyPayment);
orderRoutes.get('/', validateToken, getUserOrders);
orderRoutes.get('/:id', validateToken, getOrderById);

export default orderRoutes;

