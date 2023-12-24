import User from "./models/User";
import Transaction from "./models/Transaction";
import { Request, Response } from "express";
import zod from "./utils/zod";
const { createUserSchema, transferMoneySchema } = zod;
import { calculateCashback } from "./utils/utils";

const createUser = async (req: Request, res: Response) => {
  try {
    const parsedBody = createUserSchema.parse(req.body);
    const { phoneNumber, availableCash } = parsedBody;
    const user = new User({ phoneNumber, availableCash });
    await user.save();
    res.json({
      user,
    });
  } catch (e: any) {
    // if there is duplicate key error, return 400
    if (e.code === 11000) {
      return res.status(400).json({
        message: "User with phone number already exists",
      });
    }
    res.status(500).json({
      message: "Error creating user",
      error: e.issues.map((issue: any) => issue.message),
    });
  }
};

const transferMoney = async (req: Request, res: Response) => {
  try {
    const parsedBody = transferMoneySchema.parse(req.body);
    const { from, to, amount } = parsedBody;
    const sender = await User.findOne({ phoneNumber: from });
    if (!sender) {
      return res.status(404).json({
        message: "Sender not found",
      });
    }
    const receiver = await User.findOne({ phoneNumber: to });
    if (!receiver) {
      return res.status(404).json({
        message: "Receiver not found",
      });
    }
    if (sender.availableCash < amount) {
      return res.status(400).json({
        message: "Not enough money",
      });
    }
    const cashback = calculateCashback(amount);
    sender.availableCash -= amount;
    sender.availableCash += cashback;
    receiver.availableCash += amount;
    await sender.save();
    await receiver.save();
    const transaction = new Transaction({
      senderPhoneNumber: from,
      receiverPhoneNumber: to,
      amount,
    });
    await transaction.save();
    const cashbackMessage = cashback > 0 ? `You got ${cashback} cashback` : "Sorry, better luck next time";
    return res.json({
      sender,
      receiver,
      cashback: cashbackMessage,
    });
  } catch (e: any) {
    if (!e.issues) {
      return res.status(500).json({
        message: "Error transferring money",
        error: e.message,
      });
    }
    res.status(400).json({
      message: "Error transferring money",
      // also include the path of the error
      error: e.issues.map((issue: any) => ({
        message: issue.message,
        path: issue.path,
      })),
    });
  }
};

const getTransactions = async (req: Request, res: Response) => {
  const { phoneNumber } = req.params;
  console.log(phoneNumber);
  const transactions = await Transaction.find({
    $or: [
      { senderPhoneNumber: phoneNumber },
      { receiverPhoneNumber: phoneNumber },
    ],
  });
  res.json({
    transactions,
  });
}



export default { createUser, transferMoney, getTransactions };
