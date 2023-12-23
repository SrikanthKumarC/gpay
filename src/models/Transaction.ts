import { Schema, model, Document } from "mongoose";

interface ITransaction extends Document {
  senderPhoneNumber: string;
  receiverPhoneNumber: string;
  amount: number;
}

const transactionSchema = new Schema<ITransaction>(
  {
    senderPhoneNumber: {
      type: String,
      required: true,
    },
    receiverPhoneNumber: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model<ITransaction>("Transaction", transactionSchema);
