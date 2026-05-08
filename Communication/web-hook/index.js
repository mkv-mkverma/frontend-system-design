const express = require("express");
const app = express();
const port = 3000;

// Built-in middleware to parse JSON bodies
// middleware is A function that runs between request and response.
app.use(express.json());

app.post("/webhook", (req, res) => {
  const event = req.body;
  console.log("Received webhook event:", event);
  // Process the event as needed
  res.status(200).send("Webhook received successfully");
});

app.listen(port, () => {
  console.log(`Webhook server is running on port ${port}`);
});
