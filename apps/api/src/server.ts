import express from "express";

const port = 3000;
const app = express();

app.get("/", (req, res) => {
  console.log(req.url);
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
