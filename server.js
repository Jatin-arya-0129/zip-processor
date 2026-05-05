const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");

const app = express();
const PORT = process.env.PORT || 3000;

// Storage
const upload = multer({ dest: "uploads/" });

let progress = 0;

// Serve frontend
app.use(express.static("public"));

// UPLOAD API
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

// PROGRESS API
app.get("/progress", (req, res) => {
  res.json({ progress });
});

// DOWNLOAD
app.get("/download", (req, res) => {
  res.download("final.zip");
});

app.listen(PORT, () => console.log("Server running on port", PORT));
