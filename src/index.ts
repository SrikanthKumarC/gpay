import express, {Request, Response, Express} from "express";
import dbConnection from "./config/dbConnection";
import controller from "./controller";
const { createUser, transferMoney } = controller;
import dotenv from "dotenv";
import bodyParser from "body-parser";

dotenv.config();

dbConnection();

const app:Express = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.post("/create-user", createUser);

app.post("/transfer-money", transferMoney)

app.listen(port, () => {
  console.log(`GPay app listening at http://localhost:${port}`);
});
