import Product from "../models/Product.js";

// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filter tuỳ chọn theo category / search text
    const filter = { isActive: true };
    if (req.query.category) {
      filter.category = req.query.category.toLowerCase();
    }
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("seller", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "seller",
      "name email"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    return res.status(200).json({
      success: true,
      data: { product },
    });
  } catch (error) {
    // Nếu id sai format (không phải ObjectId hợp lệ) → CastError
    // sẽ được errorHandler global xử lý thành 400
    next(error);
  }
};

// @route   POST /api/products
// @access  Private (seller, admin)
export const createProduct = async (req, res, next) => {
  try {
    const { name, description, category, price, stock, images } = req.body;

    if (!name || !description || !category || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ name, description, category, price",
      });
    }

    const product = await Product.create({
      name,
      description,
      category,
      price,
      stock: stock || 0,
      images: images || [],
      seller: req.user._id, // lấy từ middleware protect, KHÔNG lấy từ req.body
    });

    return res.status(201).json({
      success: true,
      message: "Tạo sản phẩm thành công",
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/products/:id
// @access  Private (chỉ chủ sở hữu hoặc admin)
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    // Chỉ chủ sở hữu HOẶC admin mới được sửa
    const isOwner = product.seller.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền chỉnh sửa sản phẩm này",
      });
    }

    // Không cho phép đổi seller qua API update (tránh chiếm đoạt sản phẩm)
    const { seller, ...updateData } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Cập nhật sản phẩm thành công",
      data: { product: updatedProduct },
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/products/:id
// @access  Private (chỉ chủ sở hữu hoặc admin)
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    const isOwner = product.seller.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa sản phẩm này",
      });
    }

    await product.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Xóa sản phẩm thành công",
    });
  } catch (error) {
    next(error);
  }
};