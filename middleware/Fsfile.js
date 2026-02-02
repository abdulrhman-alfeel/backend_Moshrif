const fs = require("fs").promises;
const path = require("path");

async function deleteFilesInFolder(folderPath) {
  // Get a list of files in the folder
  try {
    // Get a list of files and directories in the folder
    const files = await fs.readdir(folderPath);

    // Loop through each file or directory
    for (let file of files) {
      const filePath = path.join(folderPath, file);
      const stat = await fs.stat(filePath);

      // If it's a directory, call this function recursively to delete its contents
      if (stat.isDirectory()) {
        await deleteFilesInFolder(filePath); // Recurse into subdirectory
      } else if (stat.isFile()) {
        await fs.unlink(filePath); // Delete file
        // console.log(`Deleted file: ${filePath}`);
      }
    }
  } catch (err) {
    console.error("Error deleting files:", err);
  }
}
const deleteFileSingle = async (Pathfolder, folderPath, type="jpge") => {
  try {
    if (String(type).includes("video")) {
      let matchvideo = Pathfolder.match(/\.([^.]+)$/)[1];

      const filename = String(Pathfolder).replace(matchvideo, "png");

      await implmentOpreationSingle(folderPath, Pathfolder);
      
      const timeout = setTimeout(async()=>await implmentOpreationSingle(folderPath, filename),1500);
      return () => clearTimeout(timeout);
    } else {
      implmentOpreationSingle(folderPath, Pathfolder);
    }
  } catch (error) {
    console.log(error);
  }
};
const implmentOpreationSingle = async (folderPath, Pathfolder) => {
  try {
    const filePath = path.join(folderPath, Pathfolder);
    const stat = await fs.stat(filePath);
    if (stat.isFile()) {
      await fs.unlink(filePath);
      // console.log("success full");
    }
  } catch (error) { 
    console.log(error);
  }
};

module.exports = { deleteFilesInFolder, deleteFileSingle,implmentOpreationSingle };
