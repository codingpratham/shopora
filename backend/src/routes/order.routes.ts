import express from 'express'
import { getAllOrders, getOrderById, updateOrderStatus } from '../controller/admin/order.controller.js'
const router = express.Router()

router.get('/order',getAllOrders)
router.get('/order/:id',getOrderById)
router.put('/order/:id',updateOrderStatus)

export default router