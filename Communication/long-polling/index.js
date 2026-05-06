const express = require("express");
const app = express();
const port = 3000;

let data = { message: "Initial data" };
let waitingClients = []; // waiting http calls

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/api/getData", (req, res) => {
  if (data.message !== req.query.lastData) {
    res.json(data);
  } else {
    waitingClients.push(res);
  }
});

app.get("/api/updateData", (req, res) => {
  let newData = req.query.data;

  if (typeof newData !== "string" || !newData.trim()) {
    return res.status(400).json({ error: "Invalid data" });
  }

  newData = newData.trim();

  data.message = newData;

  while (waitingClients.length > 0) {
    const client = waitingClients.pop();
    client.json({ message: data.message });
  }
  res.send({ success: "Data updated successfully" });
});

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
