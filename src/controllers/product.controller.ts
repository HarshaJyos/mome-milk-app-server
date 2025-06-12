import { Request, Response, NextFunction } from "express";
import { ProductModel } from "../models";
import { NotFoundError } from "../errorMiddleware";
import winston from "winston";

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               price:
 *                 type: number
 *               unit:
 *                 type: string
 *               variant:
 *                 type: string
 *               description:
 *                 type: string
 *               bulkDiscounts:
 *                 type: array
 *                 items:
 *                   type: object
 *               promotions:
 *                 type: object
 *     responses:
 *       201:
 *         description: Product created
 *       400:
 *         description: Invalid input
 */
const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      category,
      price,
      unit,
      variant,
      description,
      bulkDiscounts,
      promotions,
    } = req.body;
    const product = new ProductModel({
      vendorId: req.user?.id,
      name,
      category,
      price,
      unit,
      variant,
      description,
      bulkDiscounts,
      promotions,
    });
    await product.save();
    logger.info(`Product created: ${product._id}`, {
      requestId: req.requestId,
    });
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product details
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 */
const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findById(id);
    if (!product) {
      throw new NotFoundError("Product not found");
    }
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               price:
 *                 type: number
 *               unit:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated product
 *       400:
 *         description: Invalid input
 */
const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      price,
      unit,
      variant,
      description,
      bulkDiscounts,
      promotions,
    } = req.body;
    const product = await ProductModel.findByIdAndUpdate(
      id,
      {
        name,
        category,
        price,
        unit,
        variant,
        description,
        bulkDiscounts,
        promotions,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );
    if (!product) {
      throw new NotFoundError("Product not found");
    }
    logger.info(`Product updated: ${id}`, { requestId: req.requestId });
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       204:
 *         description: Product deleted
 *       404:
 *         description: Product not found
 */
const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findByIdAndDelete(id);
    if (!product) {
      throw new NotFoundError("Product not found");
    }
    logger.info(`Product deleted: ${id}`, { requestId: req.requestId });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/products/vendor/{vendorId}:
 *   get:
 *     summary: Get products by vendor
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Vendor ID
 *     responses:
 *       200:
 *         description: List of products
 *       404:
 *         description: Vendor not found
 */
const getProductsByVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { vendorId } = req.params;
    const products = await ProductModel.find({ vendorId, available: true });
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

export {
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductsByVendor,
};
