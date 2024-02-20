/*
 * Project: Milestone 1
 * File Name: IOhandler.js
 * Description: Collection of functions for files input/output related operations
 *
 * Created Date:
 * Author:
 *
 */

const unzipper = require("unzipper"),
  fs = require("fs"),
  PNG = require("pngjs").PNG,
  path = require("path"),
  yauzl = require("yauzl-promise"),
  { pipeline } = require("stream/promises");

/**
 * Description: decompress file from given pathIn, write to given pathOut
 *
 * @param {string} pathIn
 * @param {string} pathOut
 * @return {promise}
 */
async function unzip(pathIn, pathOut) {
  const zipfile = await yauzl.open(pathIn);
  try {
    for await (const entry of zipfile) {
      if (entry.filename.endsWith('/')) {
        await fs.promises.mkdir(path.join(pathOut, entry.filename), { recursive: true });
      } else if (entry.filename.endsWith('.png')) {
        const readStream = await entry.openReadStream();
        const writeStream = fs.createWriteStream(path.join(pathOut, entry.filename));
        await pipeline(readStream, writeStream);
      }
    }
  } finally {
    await zipfile.close();
    console.log("Extraction operation complete")
  }
}

/**
 * Description: read all the png files from given directory and return Promise containing array of each png file path
 *
 * @param {string} dirPath
 * @return {promise}
 */
async function readDir(dirPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(dirPath, (err, files) => {
      if (err) {
        reject(err);
      } else {
        const pngFiles = files.filter((file) => path.extname(file) === ".png");
        resolve(pngFiles.map((file) => path.join(dirPath, file)));
      }
    });
  });
}

/**
 * Description: Read in png file by given pathIn,
 * convert to grayscale and write to given pathOut
 *
 * @param {string} filePath
 * @param {string} pathProcessed
 * @return {promise}
 */

async function grayScale(filePath, pathProcessed) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(new PNG())
      .on("parsed", function () {
        for (let y = 0; y < this.height; y++) {
          for (let x = 0; x < this.width; x++) {
            const idx = (this.width * y + x) << 2;
            const gray = (this.data[idx] + this.data[idx + 1] + this.data[idx + 2]) / 3;
            this.data[idx] = gray; 
            this.data[idx + 1] = gray; 
            this.data[idx + 2] = gray; 
          }
        }
        this.pack().pipe(fs.createWriteStream(pathProcessed)).on("finish", resolve);
      })
      .on("error", reject);
  });
}

module.exports = {
  unzipper,
  unzip,
  readDir,
  grayScale,
};
