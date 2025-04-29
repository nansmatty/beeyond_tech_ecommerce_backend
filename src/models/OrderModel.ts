import mongoose, { Document, Schema } from "mongoose";

export interface IOrderItem {
	product: mongoose.Types.ObjectId;
	quantity: number;
	price: number;
}

export interface IOrder extends Document {
	customer: mongoose.Types.ObjectId;
	items: IOrderItem[];
	totalAmount: number;
	status: "pending" | "accepted" | "picked_up" | "on_the_way" | "delivered" | "cancelled";
	deliveryPartner?: mongoose.Types.ObjectId;
	deliveryAddress: {
		street: string;
		city: string;
		state: string;
		pincode: string;
	};
	lockedAt: Date;
	lockedBy?: mongoose.Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const OrderSchema = new mongoose.Schema<IOrder>(
	{
		customer: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		items: [
			{
				product: {
					type: Schema.Types.ObjectId,
					ref: "Product",
					required: true,
				},
				quantity: {
					type: Number,
					min: [1, "Quantity must be at least 1"],
					required: true,
				},
				price: {
					type: Number,
					required: true,
				},
			},
		],
		totalAmount: {
			type: Number,
			min: [0, "Total amount cannot be negative."],
			required: true,
		},
		status: {
			type: String,
			enum: ["pending", "accepted", "picked_up", "on_the_way", "delivered", "cancelled"],
			default: "pending",
		},

		deliveryPartner: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
		deliveryAddress: {
			street: {
				type: String,
				required: true,
			},
			city: {
				type: String,
				required: true,
			},
			state: {
				type: String,
				required: true,
			},
			pincode: {
				type: String,
				required: true,
			},
		},
		lockedAt: {
			type: Date,
		},
		lockedBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
	},
	{ timestamps: true }
);

const Order = mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
