import express from "express";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// Lấy cart của user, tạo mới nếu chưa có (mỗi user chỉ có 1 cart duy nhất)
const getOrCreateCart = async (userId: string) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

// Tính lại tổng số lượng + tổng tiền từ cart đã populate product
// Bỏ qua item nào có product đã bị xóa khỏi hệ thống (product populate ra null)
const buildCartSummary = (cart: any) => {
  let totalItems = 0;
  let totalPrice = 0;

  const items = cart.items
    .filter((item: any) => item.product)
    .map((item: any) => {
      const subtotal = item.product.price * item.quantity;
      totalItems += item.quantity;
      totalPrice += subtotal;
      return {
        _id: item._id,
        product: item.product,
        quantity: item.quantity,
        subtotal,
      };
    });

  return { items, totalItems, totalPrice };
};

// @route   GET /api/cart
// @access  Private
export const getCart = async (
  req: express.Request & { user: { _id: string } },
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    await cart.populate("items.product", "name price stock images category");

    const summary = buildCartSummary(cart);

    return res.status(200).json({
      success: true,
      data: { cartId: cart._id, ...summary },
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/cart
// @body    { productId, quantity }
// @access  Private
export const addToCart = async (
  req: express.Request & { user: { _id: string }; body: { productId?: string; quantity?: number } },
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { productId, quantity } = req.body;
    const qty = Number(quantity);

    if (!productId) {
      return res.status(400).json({ success: false, message: "productId là bắt buộc" });
    }
    if (!Number.isInteger(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: "Số lượng phải là số nguyên dương",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
    }

    const cart = await getOrCreateCart(req.user._id);
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    // Nếu sản phẩm đã có trong giỏ, số lượng thêm mới sẽ CỘNG DỒN vào số lượng cũ
    const requestedTotalQty = existingItem ? existingItem.quantity + qty : qty;

    if (requestedTotalQty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Chỉ còn ${product.stock} sản phẩm "${product.name}" trong kho, không thể có ${requestedTotalQty} trong giỏ hàng`,
      });
    }

    if (existingItem) {
      existingItem.quantity = requestedTotalQty;
    } else {
      cart.items.push({ product: productId, quantity: qty });
    }

    await cart.save();
    await cart.populate("items.product", "name price stock images category");

    const summary = buildCartSummary(cart);

    return res.status(200).json({
      success: true,
      message: "Đã thêm vào giỏ hàng",
      data: { cartId: cart._id, ...summary },
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/cart/:productId
// @body    { quantity }
// @access  Private
export const updateCartItem = async (
  req: express.Request & { user: { _id: string }; body: { quantity?: number }; params: { productId?: string } },
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { productId } = req.params;
    const qty = Number(req.body.quantity);

    if (!Number.isInteger(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: "Số lượng phải là số nguyên dương (dùng API xóa nếu muốn bỏ sản phẩm khỏi giỏ)",
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Giỏ hàng đang trống" });
    }

    const item = cart.items.find((i) => i.product.toString() === productId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Sản phẩm không có trong giỏ hàng" });
    }

    // Re-check stock hiện tại, vì tồn kho có thể đã thay đổi kể từ lúc thêm vào giỏ
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Sản phẩm không còn tồn tại" });
    }

    if (qty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Chỉ còn ${product.stock} sản phẩm "${product.name}" trong kho`,
      });
    }

    item.quantity = qty;
    await cart.save();
    await cart.populate("items.product", "name price stock images category");

    const summary = buildCartSummary(cart);

    return res.status(200).json({
      success: true,
      message: "Cập nhật giỏ hàng thành công",
      data: { cartId: cart._id, ...summary },
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/cart/:productId
// @access  Private
export const removeFromCart = async (
  req: express.Request & { user: { _id: string }; params: { productId?: string } },
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Giỏ hàng đang trống" });
    }

    const itemExists = cart.items.some((i) => i.product.toString() === productId);
    if (!itemExists) {
      return res.status(404).json({ success: false, message: "Sản phẩm không có trong giỏ hàng" });
    }

    cart.items = cart.items.filter((i: any) => i.product.toString() !== productId) as any;
    await cart.save();
    await cart.populate("items.product", "name price stock images category");

    const summary = buildCartSummary(cart);

    return res.status(200).json({
      success: true,
      message: "Đã xóa sản phẩm khỏi giỏ hàng",
      data: { cartId: cart._id, ...summary },
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (
  req: express.Request & { user: { _id: string } },
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Giỏ hàng đang trống" });
    }

    cart.items = [] as any;
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Đã xóa toàn bộ giỏ hàng",
      data: { cartId: cart._id, items: [], totalItems: 0, totalPrice: 0 },
    });
  } catch (error) {
    next(error);
  }
};