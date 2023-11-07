const express = require("express");
const fs = require("fs-extra");

const app = express();
const cors = require("cors");
app.use(express.json());
app.use(cors());
const PORT = process.argv[2] || 5000;
const urlKeywordsFilePath = "./url_keywords.json";
const masterKeywordsFilePath = "./master_keywords.json";

const getAllURLKeywordsDetailsFunction = async () => {
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

const getAllMasterKeywordsDetailsFunction = async () => {
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

const writeKeywordToFileFunction = (updatedData) => {
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
const addKeywordFunction = async (body) => {
  try {
    const existingMasterKeywordsResponse =
      await getAllMasterKeywordsDetailsFunction();
    const parsedMasterKeywords = JSON.parse(existingMasterKeywordsResponse);
    if (
      parsedMasterKeywords &&
      Object.keys(parsedMasterKeywords).includes(Object.keys(body)[0])
    ) {
      return {
        statusCode: 500,
        message: "Keyword already exist!",
      };
    }
    const updatedData = {
      ...parsedMasterKeywords,
      ...body,
    };
    await writeKeywordToFileFunction(updatedData);
    return {
      statusCode: 200,
      message: "Keyword added successfully!",
    };
  } catch (error) {
    return {
      statusCode: 500,
      message: error,
    };
  }
};
const writeURLToFileFunction = async (parsedExistingURL) => {
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
  const existingURL = await getAllURLKeywordsDetailsFunction();
  const parsedExistingURL = JSON.parse(existingURL);
  Object.keys(parsedExistingURL).forEach((item) => {
    parsedExistingURL[item].keywords = {
      ...parsedExistingURL[item].keywords,
      ...inputKeyword,
    };
  });
  await writeURLToFileFunction(parsedExistingURL);
};

const removeURLFunction = async (url) => {
  try {
    const urlDetails = await getAllURLKeywordsDetailsFunction();
    const parsedURL = JSON.parse(urlDetails);
    delete parsedURL[url];
    await writeURLToFileFunction(parsedURL);
    return {
      statusCode: 200,
      message: "URL removed successfully",
    };
  } catch (error) {
    console.log("error: ", error);
    return {
      statusCode: 500,
      message: "Internal server error",
    };
  }
};

const editURLFunction = async (urlData) => {
  try {
    const urlDetails = await getAllURLKeywordsDetailsFunction();
    const editedURLDetails = {
      ...JSON.parse(urlDetails),
      ...urlData,
    };
    await writeURLToFileFunction(editedURLDetails);
  } catch (error) {
    console.log("error: ", error);
  }
};
const removeKeywordFromURLKeywordFile = async (deleteKeyword) => {
  const urlDetails = await getAllURLKeywordsDetailsFunction();
  const parsedURLDetails = JSON.parse(urlDetails);
  for (const key in parsedURLDetails) {
    if (parsedURLDetails[key]?.keywords?.hasOwnProperty(deleteKeyword)) {
      delete parsedURLDetails[key]?.keywords?.[deleteKeyword];
    }
  }
  await writeURLToFileFunction(parsedURLDetails);
};

const removeKeywordFromMasterKeywordFile = async (deleteKeyword) => {
  try {
    const existingMasterKeywordsResponse =
      await getAllMasterKeywordsDetailsFunction();
    const parsedExistingMasterKeywords = JSON.parse(
      existingMasterKeywordsResponse
    );
    if (
      parsedExistingMasterKeywords &&
      Object.keys(parsedExistingMasterKeywords).includes(deleteKeyword)
    ) {
      delete parsedExistingMasterKeywords[deleteKeyword];
      await writeKeywordToFileFunction(parsedExistingMasterKeywords);
    }
  } catch (error) {
    console.log("error: ", error);
    throw error;
  }
};

const removeKeywordFunction = async (deleteKeyword, res) => {
  try {
    const responseDetails = await getAllMasterKeywordsDetailsFunction();
    const jsonParseResponseDetails = JSON.parse(responseDetails);
    if (
      jsonParseResponseDetails &&
      !Object.keys(jsonParseResponseDetails).includes(deleteKeyword)
    ) {
      return { statusCode: 404, message: "Keyword Not found" };
    }
    await removeKeywordFromURLKeywordFile(deleteKeyword);
    await removeKeywordFromMasterKeywordFile(deleteKeyword);
    return {
      statusCode: 200,
      message: "Keyword Deleted successfully",
    };
  } catch (error) {
    return {
      statusCode: 500,
      message: "Internal server error",
    };
  }
};

app.get("/", async (req, res) => {
  res.send("OK");
});

app.get("/urlKeywordsDetails", async (req, res) => {
  const responseDetails = await getAllURLKeywordsDetailsFunction();
  res.send(responseDetails);
});

app.get("/masterKeywordsDetails", async (req, res) => {
  const responseDetails = await getAllMasterKeywordsDetailsFunction();
  res.send(responseDetails);
});
app.post("/addURL", async (req, res) => {
  const urlDetails = await getAllURLKeywordsDetailsFunction();
  const masterKeywordsDetails = await getAllMasterKeywordsDetailsFunction();
  const newURLKeywordsObject = {
    ...JSON.parse(urlDetails),
    [req.body.url]: {
      isChecked: true,
      keywords: JSON.parse(masterKeywordsDetails),
    },
  };

  const responseDetails = await writeURLToFileFunction(newURLKeywordsObject);
  res.send(responseDetails);
});
app.post("/addKeyword", async (req, res) => {
  const responseDetails = await addKeywordFunction(req.body);
  if (responseDetails.statusCode === 200) {
    await addKeywordToURLFunction(req.body);
  }
  res.send(responseDetails);
});
app.put("/editURL", async (req, res) => {
  const responseDetails = await editURLFunction(req.body);
  res.send(responseDetails);
});

app.delete("/removeURL", async (req, res) => {
  const responseDetails = await removeURLFunction(req.query.url);
  res.send(responseDetails);
});

app.delete("/removeKeyword", async (req, res) => {
  const responseDetails = await removeKeywordFunction(
    req.query.deleteKeyword,
    res
  );
  res.send(responseDetails);
});

app.listen(PORT, (error) => {
  if (!error)
    console.log(
      "Server is Successfully Running,and App is listening on port " + PORT
    );
  else console.log("Error occurred, server can't start", error);
});
