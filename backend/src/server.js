import { connectDB, closeDB, gracefulShutdown } from "./db.js";
import routes from "./routes.js";
import express from "express";
import cors from "cors";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  }),
);

//routes (configure new routes in routes.js)
app.use("/api", routes);
app.get("/", (req, res) => {
  res.send("Welcome to the backend.");
});

//db logic
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
connectDB();

//open server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
