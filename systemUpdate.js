

// db.run(`CREATE TABLE IF NOT EXISTS UpdateSystem (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         version TEXT NOT NULL,messageUpdate TEXT NOT NULL
//       )`);
// db.run(`CREATE TABLE IF NOT EXISTS Maintenance (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         Maintenance TEXT NOT NULL,messageMaintenance TEXT NOT NULL
//       )`);

const express = require("express");
const db = require("./sql/sqlite");
const router = express.Router();

router.get("/UpdateSystem", async (req, res) => {
  const { version,messageUpdate } = req.query;
    const result = await SELECTTable("UpdateSystem");
    if (!result) {
      await UpdateSystem([version,messageUpdate]);
    } else {
      await UpdateSystem([version,messageUpdate, result.id], "update");
    }
 
  res.send({ success: "تمت العملية بنجاح" }).status(200);
});

router.get("/", async (req, res) => {

  const UpdateSystem = await SELECTTable("UpdateSystem");
  res
    .send({
      success: {
        Update: UpdateSystem?.version,
        messageMaintenance: false,
        messageUpdate: UpdateSystem?.messageUpdate,
      },
    })
    .status(200);
});


const UpdateSystem = async (data, string = "insert") => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.run(
        string === "insert"
          ? `INSERT INTO UpdateSystem (version,messageUpdate) VALUES (?,?)`
          : `UPDATE UpdateSystem SET version=? ,messageUpdate=? WHERE id=?`,
        data,
        function (err) {
          if (err) {
            resolve(false);
            console.error(err.message);
          } else {
            resolve(true);
          }
        }
      );
    });
  });
};


const SELECTTable = (type = "UpdateSystem") => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(`SELECT * FROM ${type} `, [], function (err, result) {
        if (err) {
          resolve(false);
          // console.error(err.message);
        } else {
          resolve(result);
        }
      });
    });
  });
};



module.exports = router
