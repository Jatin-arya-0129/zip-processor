const express = require("express");
const multer = require("multer");
const AdmZip = require("adm-zip");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

const upload = multer({ dest: "uploads/" });

let progress = 0;

// ✅ STATIC FILES
app.use(express.static(path.resolve(__dirname, "public")));

// ✅ FORCE ROOT (MOST IMPORTANT FIX)
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "public", "index.html"));
});

// ✅ UPLOAD
app.post("/upload", upload.array("files"), (req, res) => {
  try {
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
      fs.unlinkSync(file.path);
    });

    outputZip.writeZip("final.zip");
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
  const file = path.join(__dirname, "final.zip");

  if (fs.existsSync(file)) {
    res.download(file);
  } else {
    res.status(404).send("File not ready");
  }
});

app.listen(PORT, () => console.log("Server running on", PORT));
