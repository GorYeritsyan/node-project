const path = require("path");
const fs = require("fs").promises;

const readFileAsync = async (...args) => {
  return await fs.readFile(
    path.join(__dirname, "..", args.join().replaceAll(",", "/")),
    "utf-8"
  );
};

module.exports.readFileAsync = readFileAsync;
