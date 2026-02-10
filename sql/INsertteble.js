const db = require("./sqlite");
// already
const insertTablecompanycompanyRegistration = async (data) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.run(
        `INSERT INTO companyRegistration (CommercialRegistrationNumber,NameCompany, BuildingNumber, StreetName,NeighborhoodName,PostalCode,City,Country,TaxNumber,Api,PhoneNumber,userName) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
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
const insertTablecompany = async (data) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.run(
        `INSERT INTO company (CommercialRegistrationNumber,NameCompany, BuildingNumber, StreetName,NeighborhoodName,PostalCode,City,Country,TaxNumber,Api,NumberOFbranchesAllowed,NumberOFcurrentBranches) VALUES (?,?,?,?,?,?,?,?,?,?,0,0)`,
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
const insertTablecompanySub = async (data) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.run(
        `INSERT INTO companySub (NumberCompany, NameSub, BranchAddress,Email,PhoneNumber) VALUES (?, ?, ?,?,?)`,
        data,
        function (err) {
          if (err) {
            resolve(false);
          } else {
            resolve(this.lastID);
          }
          // console.log(`Row with the ID has been inserted.`);
        }
      );
      // db.close();
    });
  });
};
const insertTableLinkevaluation = async (data) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.run(
        `INSERT INTO Linkevaluation (IDcompanySub, urlLink) VALUES (?, ?)`,
        data,
        function (err) {
          if (err) {
            resolve(false);
            console.log(err.message);
          } else {
            resolve(true);
          }
          // console.log(`Row with the ID has been inserted.`);
        }
      );
      // db.close();
    });
  });
};
const insertTableuserComppany = (data) => {
  try {
    db.serialize(function () {
      db.run(
        `INSERT INTO usersCompany (IDCompany,userName,IDNumber,PhoneNumber,job,jobdiscrption,jobHOM,Validity) VALUES (?,?,?,?,?,?,?,?)`,
        data,
        function (err) {
          if (err) {
            console.error(err.message);
          }
          // console.log(`Row with the ID  has been inserted.`);
        }
      );
    });
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};
const insertTableusersBranshAcceptingcovenant = (data) => {
  try {
    console.log(data);
    db.serialize(function () {
      db.run(
        `INSERT INTO usersBransh (idBransh,user_id,job,Acceptingcovenant) VALUES (?,?,?,?)`,
        data,
        function (err) {
          if (err) {
            console.error(err.message);
          }
          // console.log(`Row with the ID  has been inserted.`);
        }
      );
    });
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};
const insertTableusersBransh = (data) => {
  try {

    db.serialize(function () {
      db.run(
        `INSERT INTO usersBransh (idBransh,user_id,job) VALUES (?,?,?)`,
        data,
        function (err) {
          if (err) {
            console.error(err.message);
          }
          console.log(`Row with the ID  has been inserted.`, this.lastID);
        }
      );
    });
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

const insertTableusersProject = (data) => {
  try {
    db.serialize(function () {
      db.run(
        `INSERT INTO usersProject (idBransh,ProjectID,user_id,ValidityProject) VALUES (?,?,?,?)`,
        data,
        function (err) {
          if (err) {
            console.error(err.message);
          }
          // console.log(`Row with the ID  has been inserted.`);
        }
      );
    });
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

const insertTableLoginActivaty = (data) => {
  db.serialize(function () {
    db.run(
      `INSERT INTO LoginActivaty (IDCompany,userID,userName,IDNumber,PhoneNumber,image,DateOFlogin,DateEndLogin,job,jobdiscrption,codeVerification,token) VALUES (?,?, ?,?,?,?,?,?,?,?,?,?)`,
      data,
      function (err) {
        if (err) {
          console.error(err.message);
        } else {
          // console.log(`Row with the ID  has been inserted.`);
          return true;
        }
      }
    );
  });
};

const insertTablecompanySubProject = (data) => {
  db.serialize(function () {
    db.run(
      `INSERT INTO companySubprojects (IDcompanySub, Nameproject, Note,TypeOFContract,GuardNumber,LocationProject,numberBuilding) VALUES (?,?,?,?,?,?,?)`,
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
const insertTablecompanySubProjectv2 = (data) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.run(
        `INSERT INTO companySubprojects (IDcompanySub, Nameproject, Note,TypeOFContract,GuardNumber,LocationProject,numberBuilding,Referencenumber,Cost_per_Square_Meter,Project_Space,cost,rate,countuser) VALUES (?,?,?,?,?,?,?,?,?,?,0,0,0)`,
        data,
        function (err) {
          if (err) {
            console.error(err.message);
          };
          // console.log(`Row with the ID ${this.lastID} has been inserted.`);
          resolve(this.lastID);
        }
      );
    });
  });
};

// Templet************

const insertTableStagestype = async (IDCompany,type) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      // حاول تجيب id إذا موجود
      db.get(
        "SELECT id FROM Stagestype WHERE IDCompany=? AND trim(Type) = trim(?)",
        [IDCompany,type],
        async function (err, row) {
          if (row) {
            resolve(row.id); // إذا موجود نرجع الـ id
          } else {
            // إذا غير موجود نضيف ونرجع id الجديد
            db.run(
              "INSERT INTO Stagestype (IDCompany,Type) VALUES (?,?)",
              [IDCompany,type],
              function (err, result) {
                resolve(this.lastID);
              }
            );
          }
        }
      );
    });
  });
};
const insertTableallStagestype = () => {
  db.serialize(() => {
    db.all(
      `SELECT Type,IDCompany
       FROM StagesTemplet st
       WHERE st.rowid = (
         SELECT MIN(s2.rowid) 
         FROM StagesTemplet s2 
         WHERE TRIM(s2.Type) = TRIM(st.Type)
       );`,
      (err, rows) => {
        if (err) {
          console.error("Select error:", err);
          return;
        }

        rows.forEach((element) => {
          // إدخال في Stagestype
          db.run(
            "INSERT INTO Stagestype (IDCompany,Type) VALUES (?,?)",
            [element.IDCompany,element.Type],
            function (err) {
              if (err) {
                console.error("Insert error:", err);
                return;
              }

              const newTypeId = this.lastID;

              // تحديث StagesTemplet
              db.run(
                `UPDATE StagesTemplet 
                 SET Stagestype_id = ? 
                 WHERE TRIM(Type) = TRIM(?)`,
                [newTypeId, element.Type],
                function (err) {
                  if (err) {
                    console.error("Update StagesTemplet error:", err);
                    return;
                  }

                  // جلب StageID
                  db.all(
                    "SELECT StageID FROM StagesTemplet WHERE Stagestype_id = ?",
                    [newTypeId],
                    (err, stageRows) => {
                      if (err) {
                        console.error("Select StageID error:", err);
                        return;
                      }

                      stageRows.forEach((stage) => {
                        // تحديث StagesSubTemplet
                        db.run(
                          `UPDATE StagesSubTemplet 
                           SET Stagestype_id = ? 
                           WHERE StageID = ?`,
                          [newTypeId, stage.StageID],
                          function (err) {
                            if (err) {
                              console.error("Update SubTemplet error:", err);
                              return;
                            }
                            console.log(
                              `Updated StagesSubTemplet for StageID ${stage.StageID}`
                            );
                          }
                        );
                      });
                    }
                  );
                }
              );
            }
          );
        });
      }
    );
  });
};


const insertTablecompanySubProjectStagetemplet = (data) => {
  db.serialize(function () {
    db.run(
      `INSERT INTO StagesTemplet (StageID,Type, StageName, Days,Ratio,attached,IDCompany,Stagestype_id) VALUES (?,?,?,?,?,?,?,?)`,
      data,
      function (err) {
        if (err) {
          console.error(err.message);
        }
        console.log(`Row with the ID ${this.lastID} has been inserted.`);
      }
    );
  });
};
const insertTablecompanySubProjectStageSubtemplet = (data) => {
  db.serialize(function () {
    db.run(
      `INSERT INTO StagesSubTemplet (StageID, StageSubName,IDCompany,Stagestype_id) VALUES (?,?,?,?)`,
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
const insertTablecompanySubProjectStageSubtemplet2 = (data) => {
 
  db.serialize(function () {
    db.run(
      `INSERT INTO StagesSubTemplet (StageID, StageSubName,attached,IDCompany,Stagestype_id) VALUES (?,?,?,?,?)`,
      data,
      function (err) {
        if (err) {
          console.error(err.message);
        }
        console.log(`Row with the ID ${this.lastID} has been inserted.`);
      }
    );
  });
};
// ****^*****^

// STAGE WITH DATA SUB STAGE AND NOTES STAGE AND NOTES SUB STAGE

const insertTablecompanySubProjectStageCUST = (data) => {
  db.serialize(function () {
    db.run(
      `INSERT INTO StagesCUST (StageID, ProjectID, Type,StageName,Days,StartDate,EndDate,OrderBy,Ratio,attached,rate) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
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
const insertTablecompanySubProjectStageCUSTv2 = (data) => {
  db.serialize(function () {
    db.run(
      `INSERT INTO StagesCUST (StageID, ProjectID, Type,StageName,Days,StartDate,EndDate,OrderBy,Referencenumber,Ratio,attached,rate) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
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
const insertTableStageCUST_IMAGE = (data) => {
  db.serialize(function () {
    db.run(
      `INSERT INTO StagesCUST_Image (StageID, ProjectID, url,addedby) VALUES (?,?,?,?)`,
      data,
      function (err) {
        if (err) {
          console.error(err.message);
        }
      }
    );
  });
};
const insertTablecompanySubProjectStageNotes = (data) => {
  db.serialize(function () {
    db.run(
      `INSERT INTO StageNotes (StagHOMID,ProjectID,Type,Note,RecordedBy,countdayDelay,ImageAttachment) VALUES (?,?,?,?,?,?,?)`,
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
const insertTablecompanySubProjectStagesSub = (data) => {
  db.serialize(function () {
    db.run(
      `INSERT INTO StagesSub (StagHOMID, ProjectID, StageSubName,attached) VALUES (?,?,?,?)`,
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
const insertTablecompanySubProjectStagesSubv2 = (data) => {
  db.serialize(function () {
    db.run(
      `INSERT INTO StagesSub (StagHOMID, ProjectID, StageSubName,attached,Referencenumber) VALUES (?,?,?,?,?)`,
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
const insertTablecompanySubProjectStageSubNotes = (data) => {
  db.serialize(function () {
    db.run(
      `INSERT INTO StageSubNotes (StagSubHOMID,StagHOMID,ProjectID,Type,Note,RecordedBy,countdayDelay,ImageAttachment) VALUES (?, ?,?,?,?,?,?,?)`,
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

// ****^***^*****

// المصروف
const insertTablecompanySubProjectexpense = (data) => {
  db.serialize(function () {
    db.run(
      `INSERT INTO Expense (projectID, Amount, Data,ClassificationName,Image,InvoiceNo,Taxable) VALUES (?, ?, ?,?,?,?,?)`,
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
const insertTablecompanySubProjectexpenseapi = (data) => {
  db.serialize(function () {
    db.run(
      `INSERT INTO Expense (Referencenumberfinanc,projectID, Amount, Data,ClassificationName,InvoiceNo,Taxable,Date) VALUES (?,?,?,?,?,?,?,?)`,
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

// المقبوض
const insertTablecompanySubProjectREVENUE = (data) => {
  db.serialize(function () {
    db.run(
      `INSERT INTO Revenue (projectID, Amount, Data,Bank,Image) VALUES (?,?, ?, ?,?)`,
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
const insertTablecompanySubProjectREVENUEapi = (data) => {
  db.serialize(function () {
    db.run(
      `INSERT INTO Revenue (Referencenumberfinanc,projectID, Amount, Data,Bank,Date) VALUES (?,?,?,?,?,?)`,
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

// المرتجع
const insertTablecompanySubProjectReturned = (data) => {
  db.serialize(function () {
    db.run(
      `INSERT INTO Returns (projectID, Amount, Data,Image) VALUES (?,?, ?, ?)`,
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
const insertTablecompanySubProjectReturnedapi = (data) => {
  db.serialize(function () {
    db.run(
      `INSERT INTO Returns (Referencenumberfinanc,projectID, Amount, Data,Date) VALUES (?,?,?,?,?)`,
      data,
      function (err) {
        if (err) {
          console.error(err.message);
        }
      }
    );
  });
};

const insertTableSabepdf = (
  data,
  typename = "namefileall",
  typeTotal = "Total"
) => {
  db.serialize(function () {
    db.run(
      `INSERT INTO Savepdf (projectID,${typename}, ${typeTotal}) VALUES (?,?,?)`,
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

// الارشيف**********************
const insertTablecompanySubProjectarchivesFolder = (data) => {
  db.serialize(function () {
    db.run(
      `INSERT INTO Archives (ProjectID, FolderName) VALUES (?, ?)`,
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
const insertTablecompanySubProjectarchivesFolderforcreatproject = (data) => {
  db.serialize(function () {
    db.run(
      `INSERT INTO Archives (ProjectID, FolderName,ActivationHome,Activationchildren) VALUES (?,?,?,?)`,
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

// ******************************************
// ****************الطلبيات ****************

const insertTablecompanySubProjectRequestsForcreatOrder = async (data) => {
  db.serialize(function () {
    db.run(
      `INSERT INTO Requests (ProjectID,Type, Data,InsertBy,Image,DateTime) VALUES (?,?,?,?,?,?)`,
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

// اليوميات
// المنشورات

const insertTablePostPublic = (data) => {
  db.serialize(function () {
    db.run(
      `INSERT INTO Post (postBy,url,Type,Data,timeminet,StageID,ProjectID,brunshCommpanyID,CommpanyID) VALUES (?,?,?,?,?,?,?,?,?)`,
      data,
      function (err) {
        if (err) {
          console.error(err.message);
        }
        console.log(`Row with the ID ${this.lastID} has been inserted.`);
      }
    );
  });
};
// platforms: {
//   ios: {
//     project: './platforms/ios/SQLite.xcodeproj'
//   },
//   android: {
//     sourceDir: './platforms/android'
//   },
//   windows: {
//     sourceDir: './platforms/windows',
//     solutionFile: 'SQLitePlugin.sln',
//     projects: [
//       {
//       projectFile: 'SQLitePlugin/SQLitePlugin.vcxproj',
//       directDependency: true,
//       }
//     ],
//   }
// }
const insertTableCommentPostPublic = (data) => {
  db.serialize(function () {
    db.run(
      `INSERT INTO Comment (PostId,commentText,Date,userName) VALUES (?,?,?,?)`,
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
const insertTableLikesPostPublic = (data) => {
  db.serialize(function () {
    db.run(
      `INSERT INTO Likes (PostId,userName) VALUES (?,?)`,
      data,
      function (err) {
        if (err) {
          console.log(err.message);
        }
        // console.log(`Row with the ID ${this.lastID} has been inserted.`);
      }
    );
  });
};

// دردشة المراحل
const insertTableChateStage = (data) => {
  return new Promise((resolve,reject)=>{
    db.serialize(function () {
      db.run(
        `INSERT INTO ChatSTAGE (idSendr,StageID, ProjectID, Sender,message,timeminet,File,Reply) VALUES (?,?,?,?,?,?,?,?)`,
        data,
        function (err) {
          if (err) {
            console.error(err);
          }
          console.log(this.lastID);
          resolve(this.lastID);
        }
      );
    });
  })
};
const insertTableChat_private = (data) => {
  return new Promise((resolve,reject)=>{

    db.serialize(function () {
      db.run(
        `INSERT INTO Chat_private (conversationId,companyId,idSendr, Sender,message,timeminet,File,Reply) VALUES (?,?,?,?,?,?,?,?)`,
        data,
        function (err) {
          if (err) {
            console.error(err);
          }
          resolve(this.lastID)
          
        }
      );
    });
  })
};
const insertTableChat_project = (data) => {
  return new Promise((resolve,reject)=>{

    db.serialize(function () {
      db.run(
        `INSERT INTO Chat_project (conversationId,ProjectID,idSendr, Sender,message,timeminet,File,Reply) VALUES (?,?,?,?,?,?,?,?)`,
        data,
        function (err) {
          if (err) {
            console.error(err);
          }
          resolve(this.lastID)
          
        }
      );
    });
  })
};
const insertTableViewsChateStage = (data,type='ViewsCHATSTAGE') => {
  db.serialize(function () {
    db.run(
      `INSERT INTO ${type} (chatID, userName) VALUES (?,?)`,
      data,
      function (err) {
        if (err) {
          console.log(err.message);
        }
        // console.log(`Row with the ID ${this.lastID} has been inserted.`);
      }
    );
  });
};
// دردشة المشروع مالية وطلبات
const insertTableChate = (data) => {
  return new Promise((resolve,reject)=>{
    db.serialize(function () {
      db.run(
        `INSERT INTO Chat (idSendr,Type, ProjectID, Sender,message,timeminet,File,Reply) VALUES (?,?,?,?,?,?,?,?)`,
        data,
        function (err) {
          if (err) {
            console.error(err.message);
          }
          resolve(this.lastID)
        }
      );
    });

  })
};

const insertTableViewsChate = (data,type='Views') => {
  
  db.serialize(function () {
    db.run(
      `INSERT INTO ${type} (chatID, userName) VALUES (?,?)`,
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

const insertTableNavigation = (data) => {
  db.serialize(function () {
    db.run(
      `INSERT INTO Navigation (IDCompanySub,ProjectID,notification,tokens,data,Date) VALUES (?,?,?,?,?,?)`,
      data,
      function (err) {
        if (err) {
          console.log(err.message);
        }
        // console.log(`Row with the ID ${this.lastID} has been inserted.`);
      }
    );
  });
};
const insertTableProjectdataforchat = (data) => {
  db.serialize(function () {
    db.run(
      `INSERT INTO Projectdataforchat (ProjectID,Nameproject,PhoneNumber,Disabled) VALUES (?,?,?,?)`,
      data,
      function (err) {
        if (err) {
          console.log(err.message);
        }
        // console.log(`Row with the ID ${this.lastID} has been inserted.`);
      }
    );
  });
};

//  عمليات طلبات العهد

const insertTableFinancialCustody = (data) => {
  try {
    db.serialize(function () {
      db.run(
        "INSERT INTO FinancialCustody (idOrder,IDCompany,IDCompanySub,Requestby,Amount,Statement) VALUES (?,?,?,?,?,?)",
        data,
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

// عمليات طلب حذف الفرع
const insertTableBranchdeletionRequests = (data) => {
  try {
    db.serialize(function () {
      db.run(
        "INSERT INTO BranchdeletionRequests (IDBranch,IDCompany,checkVerification,PhoneNumber) VALUES (?,?,?,?)",
        data,
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

// عمليات التحضير

const insertTablecheckPreparation = (
  data,
  type1 = "CheckIntime",
  type2 = "CheckInFile"
) => {
  try {
    db.serialize(function () {
      db.run(
        `INSERT INTO Prepare (IDCompany,idUser,${type1},${type2}) VALUES (?,?,?,?)`,
        data,
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

const inserttableAvailabilityday = (data) => {
  try {
    db.serialize(function () {
      db.run(
        "INSERT INTO Prepare (IDCompany,idUser,Overtimeassignment,DateDay) VALUES (?,?,?,?)",
        data,
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
const inserttableFlowmove = (data) => {
  try {
    db.serialize(function () {
      db.run(
        "INSERT INTO Flowmove (userName,PhoneNumber,Movementtype,Time) VALUES (?,?,?,?)",
        data,
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
const inserttableUserPrepare = (data) => {
  try {
    db.serialize(function () {
      db.run(
        "INSERT INTO UserPrepare (idUser,IDCompany) VALUES (?,?)",
        data,
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


const insert_table_subscription_types = (data) => {
  try {
    db.serialize(function () {  
      db.run(
        "INSERT INTO subscription_types (name, duration_in_months, price_per_project,discraption) VALUES (?,?,?,?)",
        data,
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



const insert_table_company_subscription = (data) => {
  try {
    db.serialize(function () {
      db.run(
        `INSERT INTO company_subscriptions (
         company_id,
         subscription_type_id,
         code_subscription,
         project_count, 
         price, 
         end_date,status) VALUES (?,?,?,?,?,?,?)`,
        data,
        function (err) {
          if (err) {
            console.log(err.message,data);
          }
        }
      );
    });
  } catch (error) {
    console.log(error);
  }
};


const insert_table_project_subscription = (data) => {
  try {
    db.serialize(function () {
      db.run(
        `INSERT INTO project_subscription (
         company_subscriptions_id,
          project_id
          ) VALUES (?,?)`,
        data,
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




const inserTableSubscripation = (data) => {
  try {
    db.serialize(function () {
      db.run(
        "INSERT INTO subscripation (IDCompany,ProjectID,StartDate,EndDate) VALUES (?,?,?,?)",
        data,
        function (err) {
          console.log(data);
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
const inserTableInvoice = (data) => {
  try {
    db.serialize(function () {
      db.run(
        "INSERT INTO Invoice (IDCompany,Amount,Subscription_end_date,State) VALUES (?,?,?,?)",
        data,
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
//
module.exports = {
  inserTableInvoice,
  inserTableSubscripation,
  inserttableUserPrepare,
  insertTablecheckPreparation,
  inserttableAvailabilityday,
  insertTablecompany,
  insertTablecompanySub,
  insertTablecompanySubProject,
  insertTablecompanySubProjectv2,
  insertTablecompanySubProjectStagetemplet,
  insertTablecompanySubProjectStageSubtemplet,
  insertTablecompanySubProjectStageNotes,
  insertTablecompanySubProjectStageSubNotes,
  insertTablecompanySubProjectStagesSub,
  insertTablecompanySubProjectStageCUST,
  insertTablecompanySubProjectReturned,
  insertTablecompanySubProjectREVENUE,
  insertTablecompanySubProjectexpense,
  insertTablecompanySubProjectarchivesFolder,
  insertTablePostPublic,
  insertTableCommentPostPublic,
  insertTableuserComppany,
  insertTableusersBransh,
  insertTableusersProject,
  insertTableLoginActivaty,
  insertTableChateStage,
  insertTableViewsChateStage,
  insertTableChate,
  insertTableViewsChate,
  insertTableLikesPostPublic,
  insertTablecompanySubProjectarchivesFolderforcreatproject,
  insertTableSabepdf,
  insertTablecompanySubProjectRequestsForcreatOrder,
  insertTableNavigation,
  insertTableLinkevaluation,
  insertTableProjectdataforchat,
  insertTableFinancialCustody,
  insertTablecompanySubProjectexpenseapi,
  insertTablecompanySubProjectREVENUEapi,
  insertTablecompanySubProjectReturnedapi,
  insertTablecompanycompanyRegistration,
  insertTableBranchdeletionRequests,
  inserttableFlowmove,
  insertTablecompanySubProjectStageSubtemplet2,
  insertTablecompanySubProjectStageCUSTv2,
  insertTablecompanySubProjectStagesSubv2,
  insertTableusersBranshAcceptingcovenant,
  insertTableStagestype,
  insertTableallStagestype,
  insertTableStageCUST_IMAGE,

  insert_table_subscription_types,
  insert_table_company_subscription,
  insert_table_project_subscription,


  insertTableChat_private,
  insertTableChat_project
};
