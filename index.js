const express = require("express");
const fs = require("fs-extra");

const app = express();
const cors = require("cors");
app.use(express.json());
app.use(cors());
const PORT = 5000;

const urlKeywordsDetailsFunction = async () => {
  const filePath = "./url_keywords.json";
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading the file:", err);
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

app.get("/urlKeywordsDetails", async (req, res) => {
  const responseDetails = await urlKeywordsDetailsFunction();
  res.send(responseDetails);
});

app.listen(PORT, (error) => {
  if (!error)
    console.log(
      "Server is Successfully Running,and App is listening on port " + PORT
    );
  else console.log("Error occurred, server can't start", error);
});
