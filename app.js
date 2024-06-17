const fs = require("fs/promises");

(async () => {
  const CREATE_FILE = "create a file";
  const DELETE_FILE = "delete a file";
  const RENAME_FILE = "rename a file";
  const ADD_TO_FILE = "add to file";

  const createFile = async (path) => {
    let fileHandler;
    try {
      fileHandler = await fs.open(path, "r");
      console.log("File already exist path is:", path);
    } catch (e) {
      fileHandler = await fs.open(path, "w");
      console.log("A new file was created successfully!");
    }
    fileHandler.close();
  };

  const deleteFile = async (path) => {
    try {
      await fs.unlink(path);
      console.log("file deleted!!");
    } catch (e) {
      console.log("Error deleting file:", e);
    }
  };

  const renameFile = async (oldPath, newPath) => {
    try {
      await fs.rename(oldPath, newPath);
      console.log("file renamed to: ", newPath);
    } catch (e) {
      console.log("Error occured:", e);
    }
  };

  const addToFile = async (path, content) => {
    let fileHandler;
    try {
      fileHandler = await fs.open(path, "w");
      fileHandler.write(content);
      console.log(`${path} written to`);
    } catch (e) {
      console.log("Error occured:", e);
    }
    fileHandler.close();
  };

  const commandFileHandler = await fs.open("./command.txt", "r");

  commandFileHandler.on("change", async () => {
    const size = (await commandFileHandler.stat()).size;
    const buff = Buffer.alloc(size);

    const offset = 0;
    const length = buff.byteLength;
    const position = 0;

    await commandFileHandler.read(buff, offset, length, position);
    const command = buff.toString("utf8");
    if (command.includes(CREATE_FILE)) {
      const filePath = command.substring(CREATE_FILE.length + 1);
      await createFile(filePath);
    }

    // delete a file
    if (command.includes(DELETE_FILE)) {
      const path = command.substring(DELETE_FILE.length + 1);
      console.log(`deleting ${path}...`);
      await deleteFile(path);
    }

    if (command.includes(RENAME_FILE)) {
      const pathStrings = command.substring(RENAME_FILE.length + 1);
      const [oldPath, newPath] = pathStrings.split(" to ");
      console.log(`Renaming ${oldPath}...`);
      await renameFile(oldPath, newPath);
    }

    if (command.includes(ADD_TO_FILE)) {
      const directive = command.substring(ADD_TO_FILE.length + 1);
      const [filePath, content] = directive.split(" this content: ");
      console.log(`writing to ${filePath}...`);
      await addToFile(filePath, content);
    }
  });

  const watcher = fs.watch("./command.txt");
  for await (const event of watcher) {
    if (event.eventType === "change") {
      commandFileHandler.emit("change");
    }
  }
})();
