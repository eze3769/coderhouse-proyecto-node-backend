import mongoose from "mongoose";

const ProductsSchema = new mongoose.Schema({
    title: {type:String, required:true},
    price: {type:Number, required:true},
    description: String,
    thumbnail: String,
});

const Products = mongoose.model('Products', ProductsSchema);

export default Products;