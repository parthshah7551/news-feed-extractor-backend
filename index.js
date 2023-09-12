const express = require("express");
const fs = require("fs-extra");

const app = express();
const cors = require("cors");
app.use(express.json());
app.use(cors());
const PORT = 5000;
const urlKeywordsFilePath = "./url_keywords.json";
const masterKeywordsFilePath = "./master_keywords.json";

const urlKeywordsDetailsFunction = async () => {
  return new Promise((resolve, reject) => {
    fs.readFile(urlKeywordsFilePath, "utf8", (err, data) => {
      if (err) {
        console.error("Error while reading the file:", err);
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

const masterKeywordsDetailsFunction = async () => {
  return new Promise((resolve, reject) => {
    fs.readFile(masterKeywordsFilePath, "utf8", (err, data) => {
      if (err) {
        console.error("Error while reading the file:", err);
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

app.get("/masterKeywordsDetails", async (req, res) => {
  const responseDetails = await masterKeywordsDetailsFunction();
  res.send(responseDetails);
});

app.listen(PORT, (error) => {
  if (!error)
    console.log(
      "Server is Successfully Running,and App is listening on port " + PORT
    );
  else console.log("Error occurred, server can't start", error);
});
