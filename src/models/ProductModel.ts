import mongoose, { Document } from "mongoose";

export interface IProduct extends Document {
	name: string;
	description: string;
	price: number;
	image: string;
	category: string;
	inStock: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const ProductSchema = new mongoose.Schema<IProduct>(
	{
		name: {
			type: String,
			required: [true, "Please add a product name"],
			trim: true,
		},
		description: {
			type: String,
			required: [true, "Please add a description"],
		},
		price: {
			type: Number,
			required: [true, "Please add a price"],
			min: [0, "Price cannot be negative"],
		},
		image: {
			type: String,
			default: "no-image.jpg",
		},
		category: {
			type: String,
			required: [true, "Please add a category"],
		},
		inStock: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
	}
);

const Product = mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
