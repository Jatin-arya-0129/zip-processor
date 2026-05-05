const express = require("express");
const multer = require("multer");
const fs = require("fs");
const AdmZip = require("adm-zip");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const upload = multer({ dest: "uploads/" });

let progress = 0;

// STATIC
app.use(express.static("public"));

// FIX FOR ROOT
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// UPLOAD
app.post("/upload", upload.array("files"), (req, res) => {
  progress = 0;

  const outputZip = new AdmZip();

  req.files.forEach((file, index) => {
    const zip = new AdmZip(file.path);

    zip.getEntries().forEach(entry => {
      if (!entry.isDirectory) {
        outputZip.addFile(entry.entryName, entry.getData());
      }
    });

    progress = Math.floor(((index + 1) / req.files.length) * 100);
  });

  outputZip.writeZip("final.zip");

  res.send("Done");
});

// PROGRESS
app.get("/progress", (req, res) => {
  res.json({ progress });
});

// DOWNLOAD
app.get("/download", (req, res) => {
  res.download("final.zip");
});

app.listen(PORT, () => console.log("Server running"));
