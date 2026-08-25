import Store from "../models/Store.js";

export async function createStore(req, res) {
  try {
    const { name, slug, description, logo, banner } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        message: "Store name and slug are required",
      });
    }

    const normalizedSlug = slug.toLowerCase().trim();

    const exists = await Store.findOne({
      slug: normalizedSlug,
    });

    if (exists) {
      return res.status(409).json({
        message: "Slug already exists",
      });
    }

    const store = await Store.create({
      vendorId: req.user._id,
      name,
      slug: normalizedSlug,
      description,
      logo,
      banner,
    });

    res.status(201).json({ store });
  } catch (error) {
    console.error("CREATE STORE ERROR:", error);

    res.status(500).json({
      message: "Failed to create store",
    });
  }
}

/* =========================
   PUBLIC STORES
   Only ACTIVE stores whose
   vendor still exists and
   is ACTIVE
========================= */

export async function listStores(req, res) {
  try {
    const stores = await Store.find({
      status: "ACTIVE",
    })
      .populate("vendorId", "name email status")
      .sort({ createdAt: -1 });

    const validStores = stores.filter(
      (store) =>
        store.vendorId &&
        store.vendorId.status === "ACTIVE"
    );

    res.json({
      stores: validStores,
    });
  } catch (error) {
    console.error("LIST STORES ERROR:", error);

    res.status(500).json({
      message: "Failed to load stores",
    });
  }
}

/* =========================
   VENDOR STORES
   Only logged-in vendor's
   stores
========================= */

export async function listVendorStores(req, res) {
  try {
    const stores = await Store.find({
      vendorId: req.user._id,
    })
      .populate("vendorId", "name email status")
      .sort({ createdAt: -1 });

    res.json({
      stores,
    });
  } catch (error) {
    console.error(
      "LIST VENDOR STORES ERROR:",
      error
    );

    res.status(500).json({
      message: "Failed to load your stores",
    });
  }
}

/* =========================
   STORE BY SLUG
========================= */

export async function getStoreBySlug(req, res) {
  try {
    const store = await Store.findOne({
      slug: req.params.slug,
      status: "ACTIVE",
    }).populate(
      "vendorId",
      "name email status"
    );

    if (
      !store ||
      !store.vendorId ||
      store.vendorId.status !== "ACTIVE"
    ) {
      return res.status(404).json({
        message: "Store not found",
      });
    }

    res.json({ store });
  } catch (error) {
    console.error(
      "GET STORE BY SLUG ERROR:",
      error
    );

    res.status(500).json({
      message: "Failed to load store",
    });
  }
}

/* =========================
   UPDATE STORE
========================= */

export async function updateStore(req, res) {
  try {
    const store = await Store.findOne({
      _id: req.params.id,
      vendorId: req.user._id,
    });

    if (!store) {
      return res.status(404).json({
        message: "Store not found",
      });
    }

    const allowedFields = [
      "name",
      "slug",
      "description",
      "logo",
      "banner",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        store[field] = req.body[field];
      }
    });

    if (req.body.slug) {
      const normalizedSlug =
        req.body.slug.toLowerCase().trim();

      const existingStore =
        await Store.findOne({
          slug: normalizedSlug,
          _id: { $ne: store._id },
        });

      if (existingStore) {
        return res.status(409).json({
          message: "Slug already exists",
        });
      }

      store.slug = normalizedSlug;
    }

    await store.save();

    res.json({ store });
  } catch (error) {
    console.error(
      "UPDATE STORE ERROR:",
      error
    );

    res.status(500).json({
      message: "Failed to update store",
    });
  }
}

/* =========================
   DELETE STORE
========================= */

export async function deleteStore(req, res) {
  try {
    const store =
      await Store.findOneAndDelete({
        _id: req.params.id,
        vendorId: req.user._id,
      });

    if (!store) {
      return res.status(404).json({
        message: "Store not found",
      });
    }

    res.json({
      message: "Store deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE STORE ERROR:",
      error
    );

    res.status(500).json({
      message: "Failed to delete store",
    });
  }
}