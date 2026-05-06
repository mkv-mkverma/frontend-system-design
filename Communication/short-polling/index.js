const express = require("express");
const app = express();
const port = 3000;
const path = require("path");

const data = { message: "Initial data" };

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/api/data", (req, res) => {
  res.json(data);
});

// Simulate data change every 5 seconds
let intervalId;
intervalId = setInterval(() => {
  data.message = `Updated data at ${new Date().toLocaleTimeString()}`;
}, 5000);

// clearInterval(intervalId);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
