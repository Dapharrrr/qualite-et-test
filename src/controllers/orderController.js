import { createOrder, findAllOrders, findOrderById } from '../models/orderModel.js';

export const addOrder = async (req, res) => {
    const { items } = req.body; 
    const userId = req.user.id;

    try {
        const order = await createOrder(userId, items);
        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getOrders = async (req, res) => {
    try {
        const orders = await findAllOrders();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const order = await findOrderById(req.params.id);
        if (order.length > 0) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
