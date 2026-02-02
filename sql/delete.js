const db = require("./sqlite");

const DeleteTablecompany = () => {};
const DeleteTablecompanySub = () => {};
const DeleteTableChate = (type, id) => {
  db.run(`DELETE FROM  ${type} WHERE chatID=?`, [id], function (err) {
    if (err) {
      console.error(err.message);
    }
    // console.log(`Row with the ID ${this.lastID} has been inserted.`);
  });
};

const DeleteTablecompanySubProjectphase = (id) => {
  db.run(`DELETE FROM  StagesCUST WHERE ProjectID=?`, [id], function (err) {
    if (err) {
      console.error(err.message);
    }
    // console.log(`Row with the ID ${this.lastID} has been inserted.`);
  });
};
const DeleteTablecompany_subscriptions = (id) => {
  db.run(`DELETE FROM  company_subscriptions WHERE code_subscription=?`, [id], function (err) {
    if (err) {
      console.error(err.message);
    }
    // console.log(`Row with the ID ${this.lastID} has been inserted.`);
  });
};
const DeleteTablecompanyStageHome = (idProject, StageID) => {
  db.run(
    `DELETE FROM  StagesCUST WHERE StageID=? AND ProjectID=?`,
    [StageID, idProject],
    function (err) {
      if (err) {
        console.error(err.message);
      }
      // console.log(`Row with the ID ${this.lastID} has been inserted.`);
    }
  );
};
const DeleteTablecompanyStageSub = (idProject, StageID) => {
  db.run(
    `DELETE FROM  StagesSub WHERE StagHOMID=? AND ProjectID=?`,
    [StageID, idProject],
    function (err) {
      if (err) {
        console.error(err.message);
      }
      // console.log(`Row with the ID ${this.lastID} has been inserted.`);
    }
  );
};

const DeleteTablecompanySubProjectall = (table, type = "projectID", id) => {
  db.serialize(function () {
    db.run(`DELETE FROM ${table} WHERE  ${type}=?`, [id], function (err) {
      // console.log(`Row with the ID has been inserted.`,` ${table}, ${type}, ${id}`);
    });
  });
};
const DeleteTablecompanySubProjectallapi = (table,id,NumberCompany,IDcompanySub,Referencenumber) => {
  db.serialize(function () {
    db.run(`DELETE FROM ${table} WHERE Referencenumberfinanc=?  AND EXISTS (
    SELECT 1
    FROM companySubprojects  PR LEFT JOIN companySub RE ON  PR.IDcompanySub = RE.id WHERE RE.NumberCompany=? AND PR.IDcompanySub=?  AND PR.Referencenumber=?
    )`, [id,NumberCompany,IDcompanySub,Referencenumber], function (err) {
      // console.log(`Row with the ID has been inserted.`);
    });
  });
};
const DeleteTableSavepdf = (id) => {
  db.serialize(function () {
    db.run(`DELETE FROM Savepdf WHERE projectID =?`, [id], function (err) {
      // console.log(`Row with the ID has been inserted.`);
    });
  });
};
const DeleteTableNotifcation = () => {
  db.serialize(function () {
    db.run(
      `DELETE FROM Navigation  WHERE DateDay < CURRENT_DATE`,
      function (err) {
        // console.log(`Row with the ID has been inserted.`);
      }
    );
  });
};
const DeleteuserBransh = (id1,id2,type1="user_id",type2="idBransh",table="usersBransh",add="") => {
  db.serialize(function () {
    db.run(
      `DELETE FROM  ${table}  WHERE ${add} ${type1}=? AND ${type2}=? `,[id1,id2],
      function (err) {
        // console.log(`Row with the ID has been inserted.`);
      }
    );
  });
};

const DELETETableLoginActivaty = (data) => {
  db.serialize(function () {
    db.run(
      `DELETE FROM LoginActivaty  WHERE PhoneNumber=?`,
      data,
      function (err) {
        // console.log(`Row with the ID has been inserted.`);
      }
    );
  });
};
const DeleteTablecompanySubProjectarchives = (id) => {
  db.run(`DELETE FROM Archives WHERE ArchivesID=?`, [id], function (err) {
    if (err) {
      console.error(err);
    }
    // console.log(`Row with the ID ${this.lastID} has been inserted.`);
  });
};
const sqlDropOldTable = (tableName) => {
  const sqlDropOldTable = `DROP TABLE IF EXISTS ${tableName};`;
  db.serialize(() => {
    // Create a temporary table with the structure of the original table
    db.run(sqlDropOldTable, (err) => {
      if (err) {
        console.error("Error creating temporary table:", err.message);
        return;
      }
    });
  });
};

// sqlDropOldTable("StagesTemplet");
// sqlDropOldTable("StagesSubTemplet");
const DeletTableuserComppanyCorssUpdateActivationtoFalse = (
  data,
  type = "usersCompany"
) => {
  return new Promise((resolve, reject) => {
    try {
      db.serialize(function () {
        db.run(
          ` DELETE FROM  ${type} WHERE PhoneNumber=?`,
          data,
          function (err) {
            // console.log("updatetableusercompany", data);
            if (err) {
              reject(err);
            }
            resolve(true);
            // console.log(`Row with the ID  has been inserted.`);
          }
        );
      });
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
};

const DeleteTablecompanySubProjectPublic = () => {};

const DeleteTableCommentPostPublic = (data) => {
  db.serialize(function () {
    db.run(`Delete FROM Comment WHERE CommentID=?`, data, function (err) {
      if (err) {
        console.error(err.message);
      }
      // console.log(`Row with the ID ${this.lastID} has been Deleteed.`);
    });
  });
};
const DeleteTableLikesPostPublic = (data) => {
  db.serialize(function () {
    db.run(
      `Delete FROM Likes WHERE PostId=? AND userName=?`,
      data,
      function (err) {
        if (err) {
          console.error(err.message);
        }
        // console.log(`Row with the ID ${this.lastID} has been Deleteed.`);
      }
    );
  });
};
const DeleteTableProjectdataforchat = (data,type='PhoneNumber=?') => {
  db.serialize(function () {
    db.run(
      `Delete FROM Projectdataforchat WHERE ${type}`,
      data,
      function (err) {
        if (err) {
          console.error(err.message);
        }
        // console.log(`Row with the ID ${this.lastID} has been Deleteed.`);
      }
    );
  });
};
const DeleteTableFinancialCustody = (data) => {
  db.serialize(function () {
    db.run(`Delete FROM FinancialCustody WHERE id=?`, data, function (err) {
      if (err) {
        console.error(err.message);
      }
      // console.log(`Row with the ID ${this.lastID} has been Deleteed.`);
    });
  });
};
const deletePostFromDatabase = (data) => {
  db.serialize(function () {
    db.run(`Delete FROM Post WHERE url=?`, data, function (err) {
      if (err) {
        console.error(err.message);
      }
      // console.log(`Row with the ID ${this.lastID} has been Deleteed.`);
    });
  });
};
const DeleteUserPrepare = (data) => {
  db.serialize(function () {
    db.run(`Delete FROM UserPrepare WHERE idUser=?`, data, function (err) {
      if (err) {
        console.error(err.message);
      }
      // console.log(`Row with the ID ${this.lastID} has been Deleteed.`);
    });
  });
};

const DeleteTablecompanySubProjectChate = () => {};

module.exports = {
  DeleteUserPrepare,
  DeleteTablecompany,
  DeleteTablecompanySub,
  DeleteTableChate,
  DeleteTablecompanySubProjectphase,
  DeleteTablecompanySubProjectall,
  DeleteTableSavepdf,
  DeleteTablecompanySubProjectarchives,
  DeleteTablecompanySubProjectPublic,
  DeleteTablecompanySubProjectChate,
  DeleteTableLikesPostPublic,
  DeleteTableCommentPostPublic,
  DELETETableLoginActivaty,
  DeleteTableNotifcation,
  DeletTableuserComppanyCorssUpdateActivationtoFalse,
  DeleteTablecompanyStageHome,
  DeleteTablecompanyStageSub,
  DeleteTableProjectdataforchat,
  DeleteTableFinancialCustody,
  DeleteTablecompanySubProjectallapi,
  deletePostFromDatabase,
  DeleteuserBransh,
  DeleteTablecompany_subscriptions
};
