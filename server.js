const express = require("express");
const multer = require("multer");
const AdmZip = require("adm-zip");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.static(__dirname));

const upload = multer({ dest: "uploads/" });

let progress = 0;

// UPLOAD + PROCESS
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

      fs.unlinkSync(files[i].path); // temp delete
    }

    let outputPath = path.join(__dirname, "final.zip");
    outputZip.writeZip(outputPath);

    res.json({ message: "Done" });

  } catch (err) {
    res.status(500).send(err.message);
  }
});

// PROGRESS
app.get("/progress", (req, res) => {
  res.json({ progress });
});

// DOWNLOAD
app.get("/download", (req, res) => {
  let filePath = path.join(__dirname, "final.zip");

  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).send("No file yet");
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running...");
});
