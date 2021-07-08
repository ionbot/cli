const { exec } = require("child_process");
const axios = require("axios");
const fs = require("fs");
const ora = require("ora");
const AdmZip = require("adm-zip");
const hasYarn = require("hasbin").sync("yarn");

const spinner = ora("Checking requirements...").start();

const DownloadIon = () => {
  axios
    .get("https://api.github.com/repos/ionbot/ion-app/releases")
    .then(({ data }) => {
      const { zipball_url, tag_name } = data[0];
      const fileName = `ion-${tag_name}.zip`;
      spinner.text = `Downloading latest version: ${tag_name}`;

      // Download the latest version
      axios({
        method: "get",
        url: zipball_url,
        responseType: "stream",
      }).then((response) => {
        const writer = fs.createWriteStream(fileName);
        response.data.pipe(writer);
        writer.on("close", () => {
          spinner.text = "Downloaded success, extracting...";
          const zip = new AdmZip(fileName);
          zip.extractAllTo(".", true);
          spinner.succeed(
            "Extracted. Please change your drive to the folder and run: yarn"
          );
        });
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
