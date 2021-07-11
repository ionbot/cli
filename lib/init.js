const { exec, spawn } = require("child_process");
const axios = require("axios");
const fs = require("fs");
const ora = require("ora");
const AdmZip = require("adm-zip");
const hasYarn = require("hasbin").sync("yarn");

const spinner = ora("Checking requirements...").start();

const installDeps = (dirName) => {
  // install root dependencies

  exec("yarn", { cwd: dirName }, (err, stdout, stderr) => {
    spinner.text = "Installing dependencies...";

    spinner.succeed("Finished.");
  });
};

const DownloadIon = () => {
  spinner.text = `Downloading latest version`;

  // Download the latest version
  axios({
    method: "get",
    url: "https://github.com/ionbot/ion/archive/refs/heads/main.zip",
    responseType: "stream",
  }).then((response) => {
    const writer = fs.createWriteStream("ion.zip");
    response.data.pipe(writer);
    writer.on("close", () => {
      spinner.text = "Downloaded success, extracting...";
      const zip = new AdmZip("ion.zip");
      zip.extractAllTo(".", true);
      spinner.text = "Extracted. Installing dependencies";

      installDeps("./ion-main");
    });
  });
};

const InitIon = () => {
  // Install yarn if not found
  if (!hasYarn) {
    spinner.text = `Yarn not found, installing yarn...`;
    exec("npm i -g yarn", (err, stdout) => {
      DownloadIon();
    });
  } else {
    DownloadIon();
  }
};

module.exports = InitIon;
