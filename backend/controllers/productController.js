const fs = require("fs/promises");
const Product = require("../model/products.js");
const cloudinary = require("../config/cloudinary.js");

const removeTempFile = async (filePath) => {
    if (!filePath) {
        return;
    }

    try {
        await fs.unlink(filePath);
    } catch (error) {
        if (error.code !== "ENOENT") {
            console.error("Failed to remove temp file:", error.message);
        }
    }
};

const getCloudinaryPublicId = (imageUrl) => {
    if (!imageUrl || typeof imageUrl !== "string") {
        return null;
    }

    const uploadSegment = "/upload/";
    const uploadIndex = imageUrl.indexOf(uploadSegment);

    if (uploadIndex === -1) {
        return null;
    }

    let publicId = imageUrl.slice(uploadIndex + uploadSegment.length);
    publicId = publicId.replace(/^v\d+\//, "");

    const extensionIndex = publicId.lastIndexOf(".");
    return extensionIndex === -1 ? publicId : publicId.slice(0, extensionIndex);
};

const deleteCloudinaryImage = async (publicId) => {
    if (!publicId) {
        return;
    }

    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error("Failed to delete Cloudinary image:", error.message);
    }
};

const getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        return res.status(200).json(products);
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.status(200).json(product);
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};
const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock } = req.body;

        let imageUrl = "";

        // upload image if exists
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            imageUrl = result.secure_url;
        }

        // create product
        const product = new Product({
            name,
            description,
            price,
            category,
            stock,
            imageUrl,
        });

        const savedProduct = await product.save();

        res.status(201).json(savedProduct);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};


const updateProduct = async (req, res) => {
    const { name, description, price, category, stock, rating, numReviews } = req.body;
    let newPublicId = null;
    let oldPublicId = null;

    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        product.name = name ?? product.name;
        product.description = description ?? product.description;
        product.price = price ?? product.price;
        product.category = category ?? product.category;
        product.stock = stock ?? product.stock;
        product.rating = rating ?? product.rating;
        product.numReviews = numReviews ?? product.numReviews;

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "shopnest/products",
            });
            newPublicId = result.public_id;

            oldPublicId = getCloudinaryPublicId(product.imageUrl);
            product.imageUrl = result.secure_url;
            await removeTempFile(req.file.path);
        }

        const updatedProduct = await product.save();

        if (oldPublicId) {
            await deleteCloudinaryImage(oldPublicId);
        }

        return res.status(200).json(updatedProduct);
    } catch (error) {
        await removeTempFile(req.file?.path);

        if (newPublicId) {
            await deleteCloudinaryImage(newPublicId);
        }

        return res.status(500).json({ message: "Server error" });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const publicId = getCloudinaryPublicId(product.imageUrl);

        if (publicId) {
            await deleteCloudinaryImage(publicId);
            }

        await product.deleteOne();
        return res.status(200).json({ message: "Product removed successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};
