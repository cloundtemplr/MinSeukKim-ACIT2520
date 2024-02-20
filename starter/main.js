const path = require("path");
/*
 * Project: Milestone 1
 * File Name: main.js
 * Description:
 *
 * Created Date:
 * Author:
 *
 */
const IOhandler = require("./IOhandler");
const zipFilePath = path.join(__dirname, "myfile.zip");
const pathUnzipped = path.join(__dirname, "unzipped");
const pathGrayScaled = path.join(__dirname, "grayscaled");

async function main() {
    try {
        await IOhandler.unzip(zipFilePath, pathUnzipped);
        const pngFiles = await IOhandler.readDir(pathUnzipped);
        for (const file of pngFiles) {
            const fileName = path.basename(file);
            const outputPath = path.join(pathGrayScaled, fileName);
            await IOhandler.grayScale(file, outputPath);
            console.log(`Grayscale completed: ${fileName}`);
          }
        } catch (error) {
          console.error("Error:", error);
        }
      }
      
main();