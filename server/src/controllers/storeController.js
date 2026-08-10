import Store from "../models/Store.js";

export async function createStore(req, res) {
  const { name, slug, description, logo, banner } = req.body;
  const exists = await Store.findOne({ slug: slug.toLowerCase() });
  if (exists) return res.status(409).json({ message: "Slug already exists" });

  const store = await Store.create({
    vendorId: req.user._id,
    name,
    slug: slug.toLowerCase(),
    description,
    logo,
    banner
  });

  res.status(201).json({ store });
}

export async function listStores(req, res) {
  const stores = await Store.find({ status: "ACTIVE" }).populate("vendorId", "name");
  res.json({ stores });
}

export async function getStoreBySlug(req, res) {
  const store = await Store.findOne({ slug: req.params.slug, status: "ACTIVE" });
  if (!store) return res.status(404).json({ message: "Store not found" });
  res.json({ store });
}

export async function updateStore(req, res) {
  const store = await Store.findOne({ _id: req.params.id, vendorId: req.user._id });
  if (!store) return res.status(404).json({ message: "Store not found" });

  Object.assign(store, req.body);
  await store.save();
  res.json({ store });
}

export async function deleteStore(req, res) {
  const store = await Store.findOneAndDelete({
    _id: req.params.id,
    vendorId: req.user._id
  });
  if (!store) return res.status(404).json({ message: "Store not found" });
  res.json({ message: "Store deleted" });
}
