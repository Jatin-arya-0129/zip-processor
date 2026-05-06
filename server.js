const express = require("express");
const multer = require("multer");
const AdmZip = require("adm-zip");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

const upload = multer({ dest: "uploads/" });

let progress = 0;

// ✅ DIRECT HTML RESPONSE (NO FILE NEEDED)
app.get("/", (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <title>ZIP Processor</title>
  </head>
  <body style="margin:0;background:#1f3c72;color:white;text-align:center;font-family:Segoe UI;">
    
    <h2 style="margin-top:100px;">🚀 ZIP Processor</h2>

    <input type="file" id="files" multiple><br><br>

    <button onclick="upload()">Upload</button>
    <button onclick="download()">Download</button>

    <div style="position:fixed;bottom:10px;right:10px;color:#ccc;">
      @Innovatiview India Ltd.
    </div>

    <script>
      let selectedFiles = [];

      document.getElementById("files").addEventListener("change", function(e){
        selectedFiles = Array.from(e.target.files);
      });

      function upload() {
        let formData = new FormData();
        selectedFiles.forEach(f => formData.append("files", f));

        fetch("/upload", {
          method: "POST",
          body: formData
        });

        alert("Processing...");
      }

      function download() {
        window.open("/download");
      }
    </script>

  </body>
  </html>
  `);
});

// UPLOAD
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
    res.send("Done");

  } catch (err) {
    res.status(500).send(err.message);
  }
});

// DOWNLOAD
app.get("/download", (req, res) => {
  if (fs.existsSync("final.zip")) {
    res.download("final.zip");
  } else {
    res.send("File not ready");
  }
});

app.listen(PORT, () => console.log("Server running"));
