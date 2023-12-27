import express, {Request, Response, Express} from "express";
import dbConnection from "./config/dbConnection";
import controller from "./controller";
const { createUser, transferMoney, getTransactions, isNewUser, getUser} = controller;
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";

dotenv.config();

dbConnection();

const app:Express = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.post("/create-user", createUser);

app.post("/transfer-money", transferMoney)

app.get("/transactions/:phoneNumber", getTransactions)

app.get("/is-new-user/:phoneNumber", isNewUser)

app.get("/user/:phoneNumber", getUser)


app.all("*", (req: Request, res: Response) => {
  res.status(404).json({
    message: "Invalid route",
  });
});

app.all("*", (req: Request, res: Response) => {
  res.status(404).json({
    message: "Route not found",
  });
}
);

app.listen(port, () => {
  console.log(`GPay app listening at http://localhost:${port}`);
});
