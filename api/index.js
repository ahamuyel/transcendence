import express from "express";

const app = express();
const PORT = 4000;

app.get("/", (req, res) => {
  res.json({
    message: "Hello from Cur10usX in a container!",
    service: "Hello-node",
    pod: process.env.POD_NAME || "unknown",
    time: new Date().toISOString(),
  });
});

app.get('/readyz', (req, res)=> res.status(200).send('ready'))
app.get('/healthz', (req, res)=> res.status(200).send('ok'))

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
