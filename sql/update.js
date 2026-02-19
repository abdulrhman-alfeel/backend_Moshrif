const db = require("./sqlite");
// already

const UpdateStateComany = (
  updat,
  updatwhere,
  typename = "subscriptionEndDate"
) => {
  return new Promise((resolve, reject) => {
    try {
      db.serialize(function () {
        db.run(
          `UPDATE company SET ${typename}=? WHERE id=?`,
          [updat, updatwhere],
          function (err) {
            if (err) {
              console.log(err.message);
              reject(err);
            }
            resolve(true);
            console.log(`Row with the ID  has been inserted.`);
          }
        );
      });
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
};
const Updatesubscripationwhendeletproject = (updatwhere) => {
  return new Promise((resolve, reject) => {
    try {
      db.serialize(function () {
        db.run(
          `UPDATE subscripation SET EndDate= CURRENT_DATE  WHERE ProjectID=? AND strftime('%Y-%m',StartDate)=strftime('%Y-%m',CURRENT_DATE )`,
          [updatwhere],
          function (err) {
            if (err) {
              console.log(err.message);
              reject(err);
            }
            resolve(true);
            console.log(`Row with the ID  has been inserted.`);
          }
        );
      });
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
};
const Updatesubscripation = (updat, updatwhere, typename = "price") => {
  return new Promise((resolve, reject) => {
    try {
      db.serialize(function () {
        db.run(
          `UPDATE subscripation SET ${typename}=? WHERE id=?`,
          [updat, updatwhere],
          function (err) {
            if (err) {
              console.log(err.message);
              reject(err);
            }
            resolve(true);
            console.log(`Row with the ID  has been inserted.`);
          }
        );
      });
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
};
const UpdateMoveingDataBranshtoBrinsh = (
  fromId,
  toId,
  type,
  typename = "IDcompanySub"
) => {
  return new Promise((resolve, reject) => {
    try {
      db.serialize(function () {
        db.run(
          `UPDATE ${type} SET ${typename}=? WHERE ${typename}=?`,
          [toId, fromId],
          function (err) {
            if (err) {
              console.log(err.message);
              reject(err);
            }
            resolve(true);
            console.log(`Row with the ID  has been inserted.`);
          }
        );
      });
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
};
const Updaterateandcost = (
  fromId,
  toId,
  type,
  typedata,
  typename = "IDcompanySub"
) => {
  return new Promise((resolve, reject) => {
    try {
      db.serialize(function () {
        db.run(
          `UPDATE ${type} SET ${typedata}=? WHERE ${typename}=?`,
          [toId, fromId],
          function (err) {
            if (err) {
              console.log(err.message);
              reject(err);
            }
            resolve(true);
            console.log(`Row with the ID  has been inserted.`);
          }
        );
      });
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
};
const UpdaterateandcostStage = (rate, StageID, ProjectID) => {
  return new Promise((resolve, reject) => {
    try {
      db.serialize(function () {
        db.run(
          `UPDATE StagesCUST SET rate=? WHERE StageID=? AND ProjectID=?`,
          [rate, StageID, ProjectID],
          function (err) {
            if (err) {
              console.log(err.message);
              reject(err);
            }
            resolve(true);
            console.log(`Row with the ID  has been inserted.`);
          }
        );
      });
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
};

const UpdateTablecompany = (data, type = "") => {
  return new Promise((resolve, reject) => {
    try {
      db.serialize(function () {
        db.run(
          `UPDATE company SET NameCompany=?, BuildingNumber=?, StreetName=?,NeighborhoodName=?,PostalCode=?,City=?,Country=?,TaxNumber=?,Cost=? ${type} WHERE id=?`,
          data,
          function (err) {
            if (err) {
              console.log(err.message);
              reject(err);
            }
            resolve(true);
            console.log(`Row with the ID  has been inserted.`);
          }
        );
      });
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
};
const UpdateTablecompanyRegistration = (data) => {
  return new Promise((resolve, reject) => {
    try {
      db.serialize(function () {
        db.run(
          `UPDATE companyRegistration SET CommercialRegistrationNumber=?, NameCompany=?, BuildingNumber=?, StreetName=?,NeighborhoodName=?,PostalCode=?,City=?,Country=?,TaxNumber=?,PhoneNumber=?,userName=? ,Api=? WHERE id=?`,
          data,
          function (err) {
            if (err) {
              console.log(err.message);
              reject(err);
            }
            resolve(true);
            console.log(`Row with the ID  has been inserted.`);
          }
        );
      });
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
};
const UpdateTableinnuberOfcurrentBranchescompany = (
  data,
  type = "NumberOFcurrentBranches"
) => {
  return new Promise((resolve, reject) => {
    try {
      db.serialize(function () {
        db.run(`UPDATE company SET ${type}=? WHERE id=?`, data, function (err) {
          if (err) {
            console.log(err.message);
            reject(err);
          }
          resolve(true);
          console.log(`Row with the ID  has been inserted.`);
        });
      });
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
};
const UpdateTablecompanySub = (data) => {
  return new Promise((resolve, reject) => {
    try {
      db.serialize(function () {
        db.run(
          `UPDATE companySub SET NumberCompany=?, NameSub=?, BranchAddress=?,Email=?,PhoneNumber=? WHERE id=?`,
          data,
          function (err) {
            if (err) {
              console.log(err.message);
              reject(err);
            }
            resolve(true);
            console.log(`Row with the ID  has been inserted.`);
          }
        );
      });
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
};
const UpdateTableLinkevaluation = (data) => {
  return new Promise((resolve, reject) => {
    try {
      db.serialize(function () {
        db.run(
          `UPDATE Linkevaluation SET urlLink=? WHERE IDcompanySub=?`,
          data,
          function (err) {
            if (err) {
              console.log(err.message);
              reject(err);
            }
            resolve(true);
            console.log(`Row with the ID  has been inserted.`);
          }
        );
      });
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
};

const UpdateTableuserComppany = (data, type = "job=?") => {
  return new Promise((resolve, reject) => {
    try {
      db.serialize(function () {
        db.run(
          `UPDATE usersCompany SET IDCompany=?, userName=?, IDNumber=?,PhoneNumber=?,${type} WHERE id=?`,
          data,
          function (err) {
            // console.log("updatetableusercompany", data);
            if (err) {
              console.log(err.message);
              reject(err);
            }
            resolve(true);
            console.log(`Row with the ID  has been inserted.`);
          }
        );
      });
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
};
const UpdateTableuserComppanyValidity = (data, type = "Validity") => {
  return new Promise((resolve, reject) => {
    try {
      db.serialize(function () {
        db.run(
          `UPDATE usersCompany SET ${type}=? WHERE id=?`,
          data,
          function (err) {
            // console.log("updatetableusercompany", data);
            if (err) {
              console.log(err.message);
              reject(err);
            }
            resolve(true);
            console.log(`Row with the ID  has been inserted.`);
          }
        );
      });
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
};
const UpdateTableusersBransh = (data, type = "job=?") => {
  return new Promise((resolve, reject) => {
    try {
      console.log(
        `UPDATE usersBransh SET ${type} WHERE user_id=? AND idBransh=?`,
        data
      );
      db.serialize(function () {
        db.run(
          `UPDATE usersBransh SET ${type} WHERE user_id=? AND idBransh=?`,
          data,
          function (err) {
            // console.log("updatetableusercompany", data);
            if (err) {
              console.log(err.message);
              reject(err);
            }
            resolve(true);
            console.log(`Row with the ID  has been inserted.`);
          }
        );
      });
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
};
const UpdateTableusersProject = (data) => {
  return new Promise((resolve, reject) => {
    try {
      db.serialize(function () {
        db.run(
          `UPDATE usersProject SET ValidityProject=? WHERE user_id=? AND ProjectID=?`,
          data,
          function (err) {
            // console.log("updatetableusercompany", data);
            if (err) {
              console.log(err.message);
              reject(err);
            }
            resolve(true);
            console.log(`Row with the ID  has been inserted.`);
          }
        );
      });
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
};

const UpdateTablecompanySubProjectapi = (data, type = "id") => {
  db.run(
    `UPDATE companySubprojects  SET Nameproject=?, Note=?,GuardNumber=?,LocationProject=?,numberBuilding=? WHERE   IDcompanySub=?  AND  ${type}=?   AND EXISTS (
        SELECT 1
        FROM companySub AS RE
        WHERE 
            RE.id = companySubprojects.IDcompanySub
            AND RE.NumberCompany = ?
    );`,
    data,
    function (err) {
      if (err) {
        console.log(err.message);
      }
      console.log(`Row with the ID ${this.lastID} has been inserted.`);
    }
  );
};
const UpdateTablecompanySubProject = (data, type = "id") => {
  db.run(
    `UPDATE companySubprojects SET IDcompanySub=?, Nameproject=?, Note=?,TypeOFContract=?,GuardNumber=?,LocationProject=?,numberBuilding=?, Referencenumber=? , Cost_per_Square_Meter=? , Project_Space=? WHERE ${type}=?`,
    data,
    function (err) {
      if (err) {
        console.log(err.message);
      }
      
      console.log(`Row with the ID ${this.lastID} has been inserted.`);
      return true;
    }
  );
};
const UpdateProjectStartdateinProject = (data) => {
  db.run(
    `UPDATE companySubprojects SET ProjectStartdate=? WHERE id=?`,
    data,
    function (err) {
      if (err) {
        console.log(err.message);
      }
      console.log(`Row with the ID ${this.lastID} has been inserted.`);
    }
  );
};
const UpdateProjectClosorOpen = (data) => {
  db.run(
    `UPDATE companySubprojects SET Disabled=? WHERE id=?`,
    data,
    function (err) {
      if (err) {
        console.log(err.message);
      }
      console.log(`Row with the ID ${this.lastID} has been inserted.`);
    }
  );
};

// لاغلاق جميع نشاط المستخدم
const UpdateTableLoginActivaty = (data) => {
  db.serialize(function () {
    db.run(
      `UPDATE LoginActivaty SET Activation="false"  WHERE PhoneNumber=?`,
      data,
      function (err) {
        // console.log(`Row with the ID has been inserted.`);
      }
    );
  });
};
// لاغلاق جميع نشاط المستخدم
const UpdateTableLoginActivatyValidityORtoken = (data, PhoneNumber, type) => {
  db.serialize(function () {
    db.run(
      `UPDATE LoginActivaty SET ${type}=?  WHERE PhoneNumber=?`,
      [data, PhoneNumber],
      function (err) {
        if (err) return console.error(err);
        console.log(`Row with the ID has been upadate.`);
      }
    );
  });
};
const UpdateTableLoginActivatytoken = (PhoneNumber, tokennew, tokenold) => {
  db.serialize(function () {
    db.run(
      `UPDATE LoginActivaty SET token=?  WHERE token=? AND PhoneNumber=?`,
      [tokennew, tokenold, PhoneNumber],
      function (err) {
        if (err) return console.error(err);
        console.log(`Row with the ID has been upadate.`);
      }
    );
  });
};

// Templet************

const UPDATETablecompanySubProjectStagetemplet = (data, IDCompany, res) => {
  const { StageIDtemplet, Type, StageName, Days, Ratio, attached } = data;

  let update = [];
  let value = [];
  let query = "UPDATE StagesTemplet SET ";

  if (Type) {
    update.push(" Type=?");
    value.push(Type);
  }
  if (StageName) {
    update.push("StageName=?");
    value.push(StageName);
  }
  if (Days) {
    update.push("Days=?");
    value.push(Days);
  }
  if (Ratio) {
    update.push("Ratio=?");
    value.push(Ratio);
  }

  if (attached && attached?.startsWith("http")) {
    update.push("attached=?");
    value.push(attached);
  }
  if (update.length === 0) {
    return res.status(400).json({ message: "لا توجد بيانات لتحديثها" });
  }

  query += update.join(",  ");
  query += "WHERE StageIDtemplet=? AND IDCompany=?";
  value.push(StageIDtemplet, IDCompany);
  console.log(query, value);
  db.run(query, value, function (err) {
    if (err) {
      console.log(err.message);
    }
    console.log(`Row with the ID ${this.lastID} has been inserted.`);
  });
};

const UPDATETablecompanySubProjectStageSubtemplet = (
  data,
  type = "StageSubName=?"
) => {
  db.run(
    `UPDATE StagesSubTemplet SET ${type} WHERE StageSubID=? AND IDCompany=? `,
    data,
    function (err) {
      if (err) {
        console.log(err.message);
      }
      console.log(`Row with the ID ${this.lastID} has been inserted.`);
    }
  );
};
const UPDATETableStagetype = (Type, id, IDCompany) => {
  db.serialize(function () {
    // 1. تحديث الجدول Stagestype
    db.run(`UPDATE Stagestype SET Type=? WHERE id=?`, [Type, id], function (err) {
      if (err) {
        return console.error("Error updating Stagestype:", err.message);
      }

      console.log(`Updated Stagestype where id=${id}`);

      // 2. تحديث الجدول StagesSubTemplet
      db.run(
        `UPDATE StagesTemplet SET Type=? WHERE Stagestype_id=? AND IDCompany=?`,
        [Type, id, IDCompany],
        function (err) {
          if (err) {
            return console.error("Error updating StagesSubTemplet:", err.message);
          }

          console.log(`Updated StagesTemplet where Stagestype_id=${id} and IDCompany=${IDCompany}`);
          
          // 3. تحديث الجدول StagesCUST
    
        }
      );


      db.all(`SELECT  StageIDtemplet FROM StagesTemplet WHERE Stagestype_id=${id}`,function(err,row){
        console.log(row);
        const sqlString = `UPDATE StagesCUST SET Type=? WHERE Referencenumber=?`;
        for (let index = 0; index < row.length; index++) {
          const element = row[index];
          console.log(element);
          db.run(sqlString, [Type, element.StageIDtemplet], function (err) {
            if (err) {
              return console.error("Error updating StagesCUST:", err.message);
            }
      
            console.log(`Updated StagesCUST where Referencenumber=${id}`);
          });
        }
      })

    });
  });
};

// ****^*****^

// STAGE WITH DATA SUB STAGE AND NOTES STAGE AND NOTES SUB STAGE

const UPDATETablecompanySubProjectStageCUST = (data) => {
  db.run(
    `UPDATE StagesCUST SET StageName=?,Days=?,Ratio=?,attached=? WHERE StageID=? AND ProjectID=?`,
    data,
    function (err) {
      if (err) {
        console.log(err.message);
      }
      console.log(`Row with the ID ${this.lastID} has been inserted.`);
    }
  );
};
// اغلاق المراحل
const UPDATEStopeProjectStageCUST = (data, kind = "Closed") => {
  let sqlString =
    kind === "Closed"
      ? `UPDATE StagesCUST SET CloseDate=?,Difference=?,Done=?, NoteClosed=?,ClosedBy=? WHERE StageID=? AND ProjectID=?`
      : `UPDATE StagesCUST SET CloseDate=?,Difference=?,Done=?,NoteOpen=?,OpenBy=? WHERE StageID=? AND ProjectID=?`;
  db.run(sqlString, data, function (err) {
    if (err) {
      console.log(err.message);
    }
    console.log(`Row with the ID ${this.lastID} has been inserted.`);
  });
};
const UPDATEStopeProjectStageCUSTv2 = (data) => {
  let sqlString = `UPDATE StagesCUST SET Type=?, StageName=?, Days=?,Ratio=?,attached=? WHERE Referencenumber=? `;
  db.run(sqlString, data, function (err) {
    if (err) {
      console.log(err.message);
    }
    console.log(`Row with the ID ${this.lastID} has been inserted.`);
  });
};

const UPDATETablecompanySubProjectStageNotes = (data) => {
  db.run(
    `UPDATE StageNotes SET Type=?,Note=?,RecordedBy=?,countdayDelay=?,ImageAttachment=? WHERE StageNoteID=?`,
    data,
    function (err) {
      if (err) {
        console.log(err.message);
      }
      console.log(`Row with the ID ${this.lastID} has been inserted.`);
    }
  );
};
// ALTER TABLE StagesCUST ADD COLUMN date_iso TEXT;

// UPDATE StagesCUST
// SET CloseDate =
//   substr(CloseDate,12,4) || '-' ||
//   (CASE substr(CloseDate,5,3)
//      WHEN 'Jan' THEN '01' WHEN 'Feb' THEN '02' WHEN 'Mar' THEN '03'
//      WHEN 'Apr' THEN '04' WHEN 'May' THEN '05' WHEN 'Jun' THEN '06'
//      WHEN 'Jul' THEN '07' WHEN 'Aug' THEN '08' WHEN 'Sep' THEN '09'
//      WHEN 'Oct' THEN '10' WHEN 'Nov' THEN '11' WHEN 'Dec' THEN '12'
//    END)
//   || '-' || printf('%02d', CAST(substr(CloseDate,9,2) AS INT));
const UPDATECONVERTDATE = (type = "EndDate", table = "StagesCUST") => {
  db.run(
    `UPDATE ${table}
SET ${type} =
  substr(${type},12,4) || '-' ||
  (CASE substr(${type},5,3)
     WHEN 'Jan' THEN '01' WHEN 'Feb' THEN '02' WHEN 'Mar' THEN '03'
     WHEN 'Apr' THEN '04' WHEN 'May' THEN '05' WHEN 'Jun' THEN '06'
     WHEN 'Jul' THEN '07' WHEN 'Aug' THEN '08' WHEN 'Sep' THEN '09'
     WHEN 'Oct' THEN '10' WHEN 'Nov' THEN '11' WHEN 'Dec' THEN '12'
   END)
  || '-' || printf('%02d', CAST(substr(${type},9,2) AS INT));`,
    function (err) {
      if (err) {
        console.log(err.message);
      }
      console.log(`Row with the ID ${this.lastID} has been inserted.`);
    }
  );
};
const UPDATETablecompanySubProjectStagesSub = (
  data,
  kind = "Name",
  namecolmn = "StageSubName=?"
) => {
  let stringSql =
    kind === "Name"
      ? `UPDATE StagesSub SET ${namecolmn} WHERE StageSubID=?`
      : kind === "Note"
      ? `UPDATE StagesSub SET Note=? WHERE StageSubID=?`
      : `UPDATE StagesSub SET closingoperations=?,CloseDate=?, Done=?  WHERE StageSubID=?`;
  db.run(stringSql, data, function (err) {
    if (err) {
      console.log(err.message);
    }
    console.log(`Row with the ID ${this.lastID} has been inserted.`);
  });
};
const UPDATETablecompanySubProjectStagesSubv2 = (data) => {
  db.run(
    `UPDATE StagesSub SET StageSubName=?,attached=? WHERE Referencenumber=?`,
    data,
    function (err) {
      if (err) {
        console.log(err.message);
      }
      console.log(`Row with the ID ${this.lastID} has been inserted.`);
    }
  );
};

const UPDATETablecompanySubProjectStageSubNotes = (data) => {
  db.run(
    `UPDATE StageSubNotes  SET Type=?,Note=?,RecordedBy=?,countdayDelay=?,ImageAttachment=? WHERE StagSubHOMID=? AND StagHOMID=? AND ProjectID=?`,
    data,
    function (err) {
      if (err) {
        console.log(err.message);
      }
      console.log(`Row with the ID ${this.lastID} has been inserted.`);
    }
  );
};

// المصروف
const UPDATETablecompanySubProjectexpense = (data) => {
  db.run(
    `UPDATE Expense SET Amount=?, Data=?,ClassificationName=?,Image=? WHERE Expenseid=?`,
    data,
    function (err) {
      if (err) {
        console.log(err.message);
      }
      console.log(`Row with the ID ${this.lastID} has been UPDATEed.`);
    }
  );
};
const UPDATETablecompanySubProjectexpenseapi = (data) => {
  db.run(
    `UPDATE Expense SET Amount=?, Data=?,ClassificationName=?,Date=?,Taxable=?,InvoiceNo=? WHERE Referencenumberfinanc=? AND EXISTS (
    SELECT 1
    FROM companySubprojects  PR LEFT JOIN companySub RE ON  PR.IDcompanySub = RE.id WHERE RE.NumberCompany=? AND PR.IDcompanySub=?  AND PR.Referencenumber=?
    ) `,
    data,
    function (err) {
      if (err) {
        console.log(err.message);
      }
      console.log(`Row with the ID ${this.lastID} has been UPDATEed.`);
    }
  );
};
const UPDATETablecompanySubProjectexpenseInvoiceNoapi = (data) => {
  db.run(
    `UPDATE Expense SET InvoiceNo=? WHERE Referencenumberfinanc=? AND EXISTS (
    SELECT 1
    FROM companySubprojects  PR LEFT JOIN companySub RE ON  PR.IDcompanySub = RE.id WHERE RE.NumberCompany=? AND PR.IDcompanySub=?  AND PR.Referencenumber=?
    ) `,
    data,
    function (err) {
      if (err) {
        console.log(err.message);
      }
      console.log(`Row with the ID ${this.lastID} has been UPDATEed.`);
    }
  );
};

// المقبوض
const UPDATETablecompanySubProjectREVENUE = (data) => {
  db.run(
    `UPDATE Revenue SET  Amount=?, Data=?,Bank=?,Image=? WHERE RevenueId=? `,
    data,
    function (err) {
      if (err) {
        console.log(err.message);
      }
      console.log(`Row with the ID ${this.lastID} has been UPDATEed.`);
    }
  );
};

const UPDATETablecompanySubProjectREVENUEapi = (data) => {
  db.run(
    `UPDATE Revenue SET  Amount=?, Data=?,Bank=?,Date=? WHERE Referencenumberfinanc=? AND EXISTS (
    SELECT 1
    FROM companySubprojects  PR LEFT JOIN companySub RE ON  PR.IDcompanySub = RE.id WHERE RE.NumberCompany=? AND PR.IDcompanySub=?  AND PR.Referencenumber=?
    )`,
    data,
    function (err) {
      if (err) {
        console.log(err.message);
      }
      console.log(`Row with the ID ${this.lastID} has been UPDATEed.`);
    }
  );
};

//  حفظ الملفات
const UPDATETablecompanySubProjectFinancial = (data, type = "Revenue") => {
  db.run(
    `UPDATE ${type} SET  Image=? WHERE Referencenumberfinanc=? AND EXISTS (
    SELECT 1
    FROM companySubprojects  PR LEFT JOIN companySub RE ON  PR.IDcompanySub = RE.id WHERE RE.NumberCompany=? AND PR.IDcompanySub=?  AND PR.Referencenumber=?
    )`,
    data,
    function (err) {
      if (err) {
        console.log(err.message);
      }
      console.log(`Row with the ID ${this.lastID} has been UPDATEed.`);
    }
  );
};
// المرتجع
const UPDATETablecompanySubProjectReturned = (data) => {
  db.run(
    `UPDATE Returns SET Amount=?, Data=?,Image=? WHERE  ReturnsId=?`,
    data,
    function (err) {
      if (err) {
        console.log(err.message);
      }
      console.log(`Row with the ID ${this.lastID} has been UPDATEed.`);
    }
  );
};
const UPDATETablecompanySubProjectReturnedapi = (data) => {
  db.run(
    `UPDATE Returns SET Amount=?, Data=?,Date=? WHERE  Referencenumberfinanc=? AND EXISTS (
    SELECT 1
    FROM companySubprojects  PR LEFT JOIN companySub RE ON  PR.IDcompanySub = RE.id WHERE RE.NumberCompany=? AND PR.IDcompanySub=?  AND PR.Referencenumber=?
    )`,
    data,
    function (err) {
      if (err) {
        console.log(err.message);
      }
      console.log(`Row with the ID ${this.lastID} has been UPDATEed.`);
    }
  );
};
// حفظ pdf
const UPDATETableSavepdf = (data, typename, type = "Total") => {
  db.run(
    `UPDATE Savepdf SET ${typename}=?, ${type}=?  WHERE  projectID=?`,
    data,
    function (err) {
      if (err) {
        console.log(err.message);
      }
      console.log(`Row with the ID ${this.lastID} has been UPDATEed.`);
    }
  );
};

// الارشيف ***************
const UPDATETablecompanySubProjectarchivesFolder = (data) => {
  db.run(
    `UPDATE Archives SET  FolderName=? WHERE ArchivesID=?`,
    data,
    function (err) {
      if (err) {
        console.log(err.message);
      }
      console.log(`Row with the ID ${this.lastID} has been inserted.`);
    }
  );
};
// الارشيف ***************
const UPDATETablecompanySubProjectarchivesFolderinChildern = (data) => {
  db.run(
    `UPDATE Archives SET children=? WHERE ArchivesID=?`,
    data,
    function (err) {
      if (err) {
        console.log(err.message);
      }
      console.log(`Row with the ID ${this.lastID} has been inserted.`);
    }
  );
};

//  *********************************************************
//  ************************* الطلبيات *********************

const UPDATETableinRequests = (data) => {
  try {
    db.run(
      `UPDATE Requests SET Type=?,Data=?,InsertBy=?,Image=? WHERE RequestsID=?`,
      data,
      function (err) {
        if (err) {
          console.log(err.message);
        }
        console.log(`Row with the ID ${this.lastID} has been inserted.`);
      }
    );
  } catch (error) {
    console.log(error);
  }
};
const UPDATETableinRequestsDone = (data, type = "Done=?,Implementedby=?") => {
  try {
    db.run(
      `UPDATE Requests SET ${type} WHERE RequestsID=?`,
      data,
      function (err) {
        if (err) {
          console.log(err.message);
        }
        console.log(`Row with the ID ${this.lastID} has been inserted.`);
      }
    );
  } catch (error) {
    console.log(error);
  }
};

// المنشورات
const UPDATETablePostPublic = (data) => {
  // const data = ["sammy", "blue", 1900];
  db.run(
    `UPDATE Post SET postBy=?,url=?,Type=?,Location=?,StageID=?,ProjectID=?,brunshCommpanyID=?,CommpanyID=? WHERE PostID=?`,
    data,
    function (err) {
      if (err) {
        console.log(err.message);
      }
      console.log(`Row with the ID ${this.lastID} has been inserted.`);
    }
  );
};

const UPDATETableCommentPostPublic = (data) => {
  // const data = ["sammy", "blue", 1900];
  db.run(
    `UPDATE Comment SET commentText=? WHERE CommentID=?`,
    data,
    function (err) {
      if (err) {
        console.log(err.message);
      }
      console.log(`Row with the ID ${this.lastID} has been inserted.`);
    }
  );
};

//

const UPDATETableChateStage = (data) => {
  db.run(
    `UPDATE ChatSTAGE  SET message=?,File=?,Reply=? WHERE chatID=? `,
    data,
    function (err) {
      if (err) {
        console.log(err.message);
      }
      console.log(`Row with the ID ${this.lastID} has been UPDATEed.`);
    }
  );
};

const UPDATETableChate = (data) => {
  db.run(
    `UPDATE Chat SET message=?, File=?, Reply=? WHERE chatID=?`,
    data,
    function (err) {
      if (err) {
        console.log(err.message);
      }
      console.log(`Row with the ID ${this.lastID} has been UPDATEed.`);
    }
  );
};

const UpdateTableViewsChate = (data,chate_type,setUpdat="count_read_message = count_read_message + 1") => {
  
  db.serialize(function () {
    db.run(
      `UPDATE ${chate_type} SET ${setUpdat} WHERE chatID = ? `,
      data,
      function (err) {
        if (err) {
          console.error(err.message);
        }
        // console.log(`Row with the ID ${this.lastID} has been inserted.`);
      }
    );
  });
};
const UPDATETableProjectdataforchat = (data) => {
  db.run(
    `UPDATE Projectdataforchat SET Disabled=? WHERE ProjectID=? AND PhoneNumber=?`,
    data,
    function (err) {
      if (err) {
        console.log(err.message);
      }
      // console.log(`Row with the ID ${this.lastID} has been UPDATEed.`);
    }
  );
};
// Approvingperson=?,ApprovalDate=?,OrderStatus=?
const UPDATETableFinancialCustody = (type, id) => {
  try {
    db.serialize(function () {
      db.run(
        `UPDATE FinancialCustody  SET ${type} WHERE id =${id}`,
        function (err) {
          if (err) {
            console.log(err.message);
          }
        }
      );
    });
  } catch (error) {
    console.log(error);
  }
};
const UPDATETableprepareOvertimeassignment = (
  Overtimeassignment,
  id,
  DateDay
) => {
  try {
    db.serialize(function () {
      db.run(
        `UPDATE Prepare  SET Overtimeassignment='${Overtimeassignment}' WHERE id =${id} AND  strftime("%Y-%m-%d", Dateday) = '${DateDay}'`,
        function (err) {
          if (err) {
            console.log(err.message);
          }
        }
      );
    });
  } catch (error) {
    console.log(error);
  }
};
const UPDATETablecheckPreparation = (
  checktime,
  checkfile,
  id,
  type1 = "CheckIntime",
  type2 = "CheckInFile",
  Numberofworkinghours = ""
) => {
  try {
    db.serialize(function () {
      db.run(
        `UPDATE Prepare  SET ${type1}='${checktime}',${type2}='${checkfile}' ${Numberofworkinghours}  WHERE id =${id}`,
        function (err) {
          if (err) {
            console.log(err.message);
          }
        }
      );
    });
  } catch (error) {
    console.log(error);
  }
};

const update_company_subscription = (id,plus='+') => {
  // , status = CASE 
  //     WHEN project_count_used ${plus} 1 >= project_count THEN 'inactive'
  //     ELSE status
  //     END
  return new Promise((resolve,reject)=>{
    db.run(
      `UPDATE company_subscriptions SET 
      project_count_used=project_count_used ${plus} 1
      WHERE id=?  AND project_count_used < project_count `,  
      [id],
      function (err) {
        if (err) {
          resolve('فشل العملية بسبب اكتمال عدد المشاريع في الباقة او انتهاء تاريخ الباقة')
          console.log(err.message);
        }
        resolve('تم اضافة المشروع للباقة بنجاح')
        console.log(`Row with the ID ${this.lastID} has been UPDATEed.`);
      }
    );
  })

}




const UPDATE_project_subscriptions = (data) => {
  db.run(
    `UPDATE project_subscription SET company_subscriptions_id=? WHERE project_id=? `,
    data,
    function (err) {
      if (err) {
        console.log(err.message);
      }
      console.log(`Row with the ID ${this.lastID} has been UPDATEed.`);
    } 
  );

}


const UpdateState_Comany_all = () => {
  return new Promise((resolve, reject) => {
    try {

      db.serialize(function () {
        db.run(
          `UPDATE company_subscriptions SET 
          status='inactive WHERE DATE(end_date) = DATE('now') AND status <> 'inactive'`,
          [],
          function (err) {
            if (err) {
              console.log(err.message);
              reject(err);
            }
            resolve(true);
            console.log(`Row with the ID  has been inserted.`);
          }

        );
      }
      );
    }
    catch (err) {
      console.log(err);
      reject(err);
    } 
  });
}
const UpdateState_company_subscriptions = (code_subscription) => {
  return new Promise((resolve, reject) => {
    try {

      db.serialize(function () {
        db.run(
          `UPDATE company_subscriptions SET 
          status="active" WHERE trim(code_subscription) = trim(?) `,
          [code_subscription],
          function (err) {
            if (err) {
              console.log(err.message);
              reject(err);
            }
            resolve(true);
            console.log(`Row with the ID  has been inserted.`);
          }

        );
      }
      );
    }
    catch (err) {
      console.log(err);
      reject(err);
    } 
  });
}
const Updatetran_ref_company_subscriptions = (tran_ref,code_subscription) => {
  return new Promise((resolve, reject) => {
    try {

      db.serialize(function () {
        db.run(
          `UPDATE company_subscriptions SET 
          tran_ref=? WHERE trim(code_subscription) = trim(?) `,
          [tran_ref,code_subscription],
          function (err) {
            if (err) {
              console.log(err.message);
              reject(err);
            }
            resolve(true);
            console.log(`Row with the ID  has been inserted.`);
          }

        );
      }
      );
    }
    catch (err) {
      console.log(err);
      reject(err);
    } 
  });
}



const Update_subscription_types = (data) => {
  return new Promise((resolve, reject) => {
    try {
      db.serialize(function () {
        db.run(
          `UPDATE subscription_types SET name=?, duration_in_months=?, price_per_project=?,discraption=? WHERE id=?`,
          data,
          function (err) {
            if (err) {
              console.log(err.message);
              reject(err);
            }
            resolve(true);
            console.log(`Row with the ID  has been inserted.`);
          }
        );
      }
      );
    }
    catch (err) {
      console.log(err);
      reject(err);
    }
  });
}


module.exports = {
  UPDATETablecheckPreparation,
  UPDATETableprepareOvertimeassignment,
  UpdateTablecompany,
  UpdateTablecompanySub,
  UpdateTablecompanySubProject,
  UPDATETablecompanySubProjectStagetemplet,
  UPDATETablecompanySubProjectStageSubtemplet,
  UPDATETablecompanySubProjectStageCUST,
  UPDATETablecompanySubProjectStageNotes,
  UPDATETablecompanySubProjectStagesSub,
  UPDATETablecompanySubProjectStageSubNotes,
  UPDATETablecompanySubProjectexpense,
  UPDATETablecompanySubProjectREVENUE,
  UPDATETablecompanySubProjectReturned,
  UPDATETablecompanySubProjectarchivesFolder,
  UPDATETablePostPublic,
  UPDATETableCommentPostPublic,
  UpdateTableuserComppany,
  UPDATETableChateStage,
  UPDATETableChate,
  UpdateTableLoginActivaty,
  UpdateTableinnuberOfcurrentBranchescompany,
  UpdateProjectStartdateinProject,
  UPDATEStopeProjectStageCUST,
  UPDATETablecompanySubProjectarchivesFolderinChildern,
  UPDATETableSavepdf,
  UPDATETableinRequests,
  UPDATETableinRequestsDone,
  UpdateTableLoginActivatyValidityORtoken,
  UpdateTableLoginActivatytoken,
  UpdateTableLinkevaluation,
  UpdateProjectClosorOpen,
  UPDATETableProjectdataforchat,
  UPDATETableFinancialCustody,
  UpdateMoveingDataBranshtoBrinsh,
  UpdateTableuserComppanyValidity,
  UPDATETablecompanySubProjectexpenseapi,
  UPDATETablecompanySubProjectREVENUEapi,
  UPDATETablecompanySubProjectReturnedapi,
  UPDATETablecompanySubProjectFinancial,
  UpdateTablecompanySubProjectapi,
  UpdateTablecompanyRegistration,
  UPDATETablecompanySubProjectexpenseInvoiceNoapi,
  Updaterateandcost,
  UpdaterateandcostStage,
  UPDATEStopeProjectStageCUSTv2,
  UPDATETablecompanySubProjectStagesSubv2,
  UpdateStateComany,
  Updatesubscripation,
  Updatesubscripationwhendeletproject,
  UpdateTableusersBransh,
  UpdateTableusersProject,
  UPDATECONVERTDATE,
  UPDATETableStagetype,
  UPDATE_project_subscriptions,
  update_company_subscription,
  UpdateState_Comany_all,
  Update_subscription_types,
  UpdateState_company_subscriptions,
  Updatetran_ref_company_subscriptions,
  UpdateTableViewsChate
};
