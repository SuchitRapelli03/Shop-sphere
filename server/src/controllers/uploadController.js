import cloudinary from "../config/cloudinary.js";

export async function uploadImage(req, res) {
  if (!req.body?.image) {
    return res.status(400).json({ message: "Base64 image is required" });
  }
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return res.status(503).json({ message: "Cloudinary is not configured" });
  }

  const result = await cloudinary.uploader.upload(req.body.image, {
    folder: "shop-sphere"
  });

  res.status(201).json({ url: result.secure_url });
}
