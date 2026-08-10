import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

async function getOrCreateCart(customerId) {
  let cart = await Cart.findOne({ customerId });
  if (!cart) cart = await Cart.create({ customerId, items: [] });
  return cart;
}

export async function getCart(req, res) {
  const cart = await getOrCreateCart(req.user._id);
  await cart.populate("items.productId", "name price images stock storeId");
  res.json({ cart });
}

export async function addToCart(req, res) {
  const { productId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product || !product.active) return res.status(404).json({ message: "Product not found" });
  if (product.stock < quantity) return res.status(400).json({ message: "Insufficient stock" });

  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.find((i) => i.productId.toString() === productId);

  if (item) item.quantity += Number(quantity);
  else cart.items.push({ productId, quantity: Number(quantity) });

  await cart.save();
  await cart.populate("items.productId", "name price images stock storeId");
  res.json({ cart });
}

export async function updateCartItem(req, res) {
  const { quantity } = req.body;
  if (Number(quantity) < 1) return res.status(400).json({ message: "Quantity must be at least 1" });

  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.find((i) => i.productId.toString() === req.params.productId);
  if (!item) return res.status(404).json({ message: "Cart item not found" });

  item.quantity = Number(quantity);
  await cart.save();
  await cart.populate("items.productId", "name price images stock storeId");
  res.json({ cart });
}

export async function removeCartItem(req, res) {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = cart.items.filter((i) => i.productId.toString() !== req.params.productId);
  await cart.save();
  res.json({ cart });
}
