import { Schema, model, Document } from "mongoose";

interface IUser extends Document {
  phoneNumber: string;
  availableCash: number;
}

const userSchema = new Schema<IUser>(
  {
    phoneNumber: {
      type: String,
      required: true,
      maxlength: 10,
      minlength: 10,
      unique: true,
    },
    availableCash: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model<IUser>("User", userSchema);
