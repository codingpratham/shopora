import express from 'express'
import {
  adminCancelOrder,
  adminGetAllOrders,
  adminGetOrderById,
  adminUpdateOrderStatus,
  createOrder,
  getOrderById,
  getOrders,
} from '../controller/order.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { onBoardCheck } from '../middleware/onBoardCheck.middleware.js'
import { roleMiddleware } from '../middleware/role.middleware.js'

const router = express.Router()

router.post('/', authenticate, onBoardCheck, createOrder)
router.get('/', authenticate, getOrders)

router.get('/admin/order', roleMiddleware, adminGetAllOrders)
router.get('/admin/order/:id', roleMiddleware, adminGetOrderById)
router.put('/admin/order/:id', roleMiddleware, adminUpdateOrderStatus)
router.delete('/admin/order/:id', roleMiddleware, adminCancelOrder)

router.get('/:id', authenticate, getOrderById)

export default router
