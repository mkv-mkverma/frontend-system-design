const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/api/sse", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.write("data: " + JSON.stringify({ message: "Hello from SSE!" }) + "\n\n");

  const intervalId = setInterval(() => {
    res.write(
      "data: " +
        JSON.stringify({
          message: "Current time: " + new Date().toLocaleTimeString(),
        }) +
        "\n\n",
    );
  }, 5000);

  req.on("close", () => {
    clearInterval(intervalId);
  });
});

app.listen(port, () => {
  console.log(`SSE server running at http://localhost:${port}`);
});
