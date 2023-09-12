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
const addKeywordFunction = async (body) => {
  const eistingMasterKeywordsResponse = await masterKeywordsDetailsFunction();
  const updatedData = { ...JSON.parse(eistingMasterKeywordsResponse), ...body };
  return new Promise((resolve, reject) => {
    fs.writeFile(
      masterKeywordsFilePath,
      JSON.stringify(updatedData),
      "utf8",
      (err, data) => {
        if (err) {
          console.error("Error while writting the file:", err);
          reject(err);
        } else {
          resolve(data);
        }
      }
    );
  });
};
const writeURLFunction = async (parsedExistingURL) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(
      urlKeywordsFilePath,
      JSON.stringify(parsedExistingURL),
      "utf8",
      (err, data) => {
        if (err) {
          console.error("Error while writting the file:", err);
          reject(err);
        } else {
          resolve(data);
        }
      }
    );
  });
};

const addKeywordToURLFunction = async (inputKeyword) => {
  const existingURL = await urlKeywordsDetailsFunction();
  console.log("existingURL: ", existingURL);
  const parsedExistingURL = JSON.parse(existingURL);
  Object.keys(parsedExistingURL).forEach((item) => {
    parsedExistingURL[item].keywords = {
      ...parsedExistingURL[item].keywords,
      ...inputKeyword,
    };
  });
  await writeURLFunction(parsedExistingURL);
  console.log("parsedExistingURL: ", parsedExistingURL);
};

app.get("/urlKeywordsDetails", async (req, res) => {
  const responseDetails = await urlKeywordsDetailsFunction();
  res.send(responseDetails);
});

app.get("/masterKeywordsDetails", async (req, res) => {
  const responseDetails = await masterKeywordsDetailsFunction();
  res.send(responseDetails);
});
app.post("/addURL", async (req, res) => {
  const responseDetails = await writeURLFunction();
  res.send(responseDetails);
});
app.post("/addKeyword", async (req, res) => {
  const responseDetails = await addKeywordFunction(req.body);
  await addKeywordToURLFunction(req.body);
  res.send(responseDetails);
});

app.listen(PORT, (error) => {
  if (!error)
    console.log(
      "Server is Successfully Running,and App is listening on port " + PORT
    );
  else console.log("Error occurred, server can't start", error);
});
