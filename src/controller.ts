import User from "./models/User";
import Transaction from "./models/Transaction";
import { Request, Response } from "express";
import zod from "./utils/zod";
const { createUserSchema, transferMoneySchema, phoneNumberValidator } = zod;
import { calculateCashback } from "./utils/utils";

const isNewUser = async (req: Request, res: Response) => {
  try {
    const phoneNumber = phoneNumberValidator.parse(req.params.phoneNumber);
    console.log(phoneNumber);
    const user = await User.findOne({ phoneNumber });
    if (user) {
      return res.json({
        isNewUser: false,
      });
    }
    return res.json({
      isNewUser: true,
    });
  } catch (e: any) {
    res.status(400).json({
      message: "Error occurred while checking if user is new",
      error: e.issues.map((issue: any) => issue.message),
    });
  }
}

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
    if (from === to) {
      return res.status(400).json({
        message: "Sender and receiver cannot be the same",
      });
    }
    const sender = await User.findOne({ phoneNumber: from });
    if (!sender) {
      return res.status(404).json({
        message: "Sender not found",
      });
    }
    const receiver = await User.findOne({ phoneNumber: to });
    if (!receiver) {
      return res.status(404).json({
        message: "Receiver not found, create a user with the receiver phone number first",
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
  try {
    const phoneNumber = phoneNumberValidator.parse(req.params.phoneNumber);
    const phoneNumberExists = await User.exists({ phoneNumber });
    if (!phoneNumberExists) {
      return res.status(404).json({
        message: "Given phone number is not registered",
      });
    }
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
  }catch (e: any) {
    res.status(400).json({
      message: "Error occurred while fetching transactions",
      error: e.issues.map((issue: any) => issue.message),
    });
  }
}

const getUser = async (req: Request, res: Response) => {
  try {
    const phoneNumber = phoneNumberValidator.parse(req.params.phoneNumber);
    const userDetails = await User.findOne({ phoneNumber });
    if (!userDetails) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    res.json({
      userDetails,
    });
  } catch (e: any) {
    res.status(400).json({
      message: "Error occurred while fetching user details",
      error: e.issues.map((issue: any) => issue.message),
    });
  }
}

export default { createUser, transferMoney, isNewUser, getTransactions, getUser };
