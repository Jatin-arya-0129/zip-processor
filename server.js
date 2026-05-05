app.use(express.static(__dirname));
const express = require("express");
const multer = require("multer");
const AdmZip = require("adm-zip");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());

const upload = multer({ dest: "uploads/" });

let progress = 0;

// Upload + Process
app.post("/upload", upload.array("files"), async (req, res) => {
  try {
    progress = 0;

    let outputZip = new AdmZip();

    const files = req.files;

    for (let i = 0; i < files.length; i++) {
      let zip = new AdmZip(files[i].path);
      let entries = zip.getEntries();

      entries.forEach(entry => {
        if (!entry.isDirectory) {
          outputZip.addFile(entry.entryName, entry.getData());
        }
      });

      progress = Math.round(((i + 1) / files.length) * 100);
    }

    let outputPath = "final.zip";
    outputZip.writeZip(outputPath);

    res.json({ message: "Done", file: outputPath });

  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Progress API
app.get("/progress", (req, res) => {
  res.json({ progress });
});

// Download
app.get("/download", (req, res) => {
  res.download("final.zip");
});

app.listen(3000, () => console.log("Server running on port 3000"));
