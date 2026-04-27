import express from "express";

const app = express();
const PORT = 4000;

app.get("/", (req, res) => {
  res.json({ message: "Hello from API" });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});