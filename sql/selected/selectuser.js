const db = require("../sqlite");

//  مستخدمي الشركة
const SELECTTableusersall = () => {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      db.all(`SELECT PhoneNumber FROM usersCompany`, function (err, result) {
        if (err) {
          reject(err);
          console.error(err.message);
        } else {
          resolve(result);
        }
      });
    });
  });
};
const SELECTTableusersCompanyall = () => {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      db.all(`SELECT * FROM usersCompany `, function (err, result) {
        if (err) {
          reject(err);
          console.error(err.message);
        } else {
          resolve(result);
        }
      });
    });
  });
};
const SELECTTableusersCompany = (
  id,
  type = "",
  LIMIT = "ORDER BY us.id ASC LIMIT 20",
  kind = "",
  add = "",
  pro = ""
) => {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      db.all(
        `
        SELECT us.*,
    json_group_array(DISTINCT 
                  CASE  WHEN cs.NameSub IS NOT NULL THEN
        json_object(
            'NameBransh', cs.NameSub,
            'job', ub.job,
            'idBransh', ub.idBransh
        ) ELSE json_object() END
    ) AS Validity
   ${add}
FROM usersCompany us
LEFT JOIN usersBransh ub ON (ub.user_id = us.id ${kind} )
LEFT JOIN usersProject up ON up.idBransh = ub.idBransh AND up.user_id= us.id ${pro}
LEFT JOIN companySub cs ON cs.id = ub.idBransh
WHERE IDCompany = ? 
AND us.Activation = "true"
  ${type} 
GROUP BY us.id ${LIMIT}
      `,
        [id],
        function (err, result) {
          let array = [];
          if (err) {
            reject(err);
            console.error(err.message);
          } else {
            result.forEach((row) => {
              const user = {
                ...row,
                Validity: row.Validity ? JSON.parse(row.Validity) : [], // فك المصفوفة JSON هنا
                ValidityProject: row.ValidityProject
                  ? JSON.parse(row.ValidityProject)
                  : [], // فك المصفوفة JSON هنا
                ValidityBransh: row.ValidityBransh
                  ? JSON.parse(row.ValidityBransh)
                  : [], // فك المصفوفة JSON هنا
              };
              array.push(user);
            });
            resolve(array);
          }
        }
      );
    });
  });
};
const SELECTTableusersBransh = (
  data,
  table = "usersBransh",
  type1 = "user_id",
  type2 = "idBransh"
) => {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      db.get(
        `SELECT * FROM ${table} WHERE ${type1}=? AND ${type2}=? `,
        data,
        function (err, result) {
          if (err) {
            resolve(false);
            console.error(err.message);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
const SELECTTableusersBranshmanger = (
  data,
  table = "usersBransh",
  type2 = "idBransh"
) => {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      db.get(
        `SELECT uC.userName,cy.NameCompany FROM ${table} us LEFT JOIN usersCompany uC ON uC.id = us.user_id LEFT JOIN company cy ON cy.id = uC.IDCompany WHERE us.job='مدير الفرع' AND us.${type2}=?  `,
        data,
        function (err, result) {
          if (err) {
            reject(err);
            console.error(err.message);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};

//  مستخدم الشركة
const SELECTTableusersCompanyonObject = (PhoneNumber, type = "*") => {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      db.get(
        `SELECT us.${type}, MAX(br.Acceptingcovenant) AS Acceptingcovenant FROM usersCompany us LEFT JOIN usersBransh br ON br.user_id = us.id   WHERE trim(us.PhoneNumber)=trim(?) `,
        [PhoneNumber],
        function (err, result) {
          if (err) {
            reject(err);
            console.error(err.message);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};

//  التحقق من دخول المستخدم
const SELECTusersCompany = (userName, IDCompany) => {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      db.get(
        `SELECT job FROM usersCompany WHERE trim(userName)=trim(?) AND IDCompany=?`,
        [userName, IDCompany],
        function (err, result) {
          if (err) {
            console.log(err.message);
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
//  التحقق من دخول المستخدم
const SELECTTableusersCompanyVerification = (PhoneNumber) => {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      db.all(
        `SELECT * FROM usersCompany WHERE trim(PhoneNumber)=trim(?) AND Activation="true"`,
        [PhoneNumber],
        function (err, result) {
          if (err) {
            reject(err);
            console.log(err.message);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
const SELECTTablevalidityuserinBransh = (PhoneNumber, idBransh, number) => {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      db.all(
        `SELECT CASE WHEN  (SELECT pr.ProjectID FROM usersProject pr  LEFT JOIN usersCompany us ON us.id = pr.user_id WHERE ProjectID=ps.id AND trim(us.PhoneNumber)=trim(?) ) THEN 'true' ELSE 'false' END  AS cheack,ps.id  ,ps.Nameproject FROM companySubprojects  ps  WHERE ps.Disabled="true" AND ps.IDcompanySub=? AND ps.id > ? ORDER BY ps.id ASC LIMIT 20`,
        [PhoneNumber, idBransh, parseInt(number)],
        function (err, result) {
          if (err) {
            reject(err);
            console.log(err.message);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};

const SELECTTableusersCompanyVerificationobject = (PhoneNumber, ProjectID) => {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      db.get(
        `SELECT * FROM usersProject pr LEFT JOIN usersCompany us ON us.id = pr.user_id  WHERE trim(us.PhoneNumber)=trim(?) AND pr.ProjectID =?`,
        [PhoneNumber, ProjectID],
        function (err, result) {
          if (err) {
            reject(err);
            console.log(err.message);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};

//  استخراج مدير الفرع
const SELECTTableusersCompanyboss = (IDCompany) => {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      db.all(
        `SELECT Validity,userName,NameCompany FROM usersCompany LEFT JOIN company WHERE job="مدير الفرع" AND IDCompany=?`,
        [IDCompany],
        function (err, result) {
          if (err) {
            reject(err);
            console.log(err.message);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
const SELECTTableusersCompanyVerificationIDUpdate = (PhoneNumber, id) => {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      db.all(
        `SELECT * FROM usersCompany WHERE trim(PhoneNumber)=trim(?) AND id !=?`,
        [PhoneNumber, id],
        function (err, result) {
          if (err) {
            reject(err);
            console.log(err.message);
            resolve([]);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
const SELECTTableusersCompanyVerificationID = (id) => {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      db.all(
        `SELECT * FROM usersCompany WHERE id=? AND Activation="true"`,
        [id],
        function (err, result) {
          if (err) {
            reject(err);
            console.error(err.message);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
const specialStages = ["قرارات", "استشارات", "اعتمادات"];

//  التحقق من صلاحيات المستخد
// const SELECTTableusersCompanySub = (
//   IDCompany,
//   IDcompanySub,
//   ProjectID,
//   type = "all",
//   kind = "sub"
// ) => {
//   return new Promise((resolve, reject) => {
//     const params = [IDCompany];

//     let querys = "";
//     // نجمع الشروط (OR) داخل قوس واحد
//     const filters = ["uC.job = 'Admin'"];

//     if (specialStages.includes(IDcompanySub)) {
//       // صلاحيات خاصة للمراحل
//       filters.push(`ca.jobdiscrption = 'موظف' `);
//     }else if (IDcompanySub == null || IDcompanySub === 0) {
//       // بدون تقييد على فرع معيّن
//       filters.push("uC.job = 'مدير الفرع'");
//     } else {
//             querys =
//         `
//         LEFT JOIN usersBransh uB       ON uB.user_id = uC.id
//         LEFT JOIN companySub Su        ON Su.id = uB.idBransh
//         LEFT JOIN usersProject uP      ON uP.idBransh = Su.id AND uP.user_id = uC.id AND uP.ProjectID= ${ProjectID}`;

//       filters.push("(uC.job = 'مدير الفرع' AND uB.idBransh = ?)");
//       params.push(IDcompanySub);
//     }

//     // المنشورات (الموظفون) – مشروع مطلوب لأي من الوظيفتين
//     if (ProjectID != null && type !== "Finance") {
//       querys =
//         `
//         LEFT JOIN usersBransh uB       ON uB.user_id = uC.id
//         LEFT JOIN companySub Su        ON Su.id = uB.idBransh
//         LEFT JOIN usersProject uP      ON uP.idBransh = Su.id AND uP.user_id = uC.id AND uP.ProjectID= ${ProjectID}`;
//       filters.push(
//         "((ca.jobdiscrption = 'موظف' OR ca.jobdiscrption = 'مستخدم') AND uP.ProjectID = ?)"
//       );
//       params.push(ProjectID);
//     }

//     // العهد
//     if (kind === "CovenantBrinsh") {
//       filters.push("(ca.job IN ('مالية') OR uB.Acceptingcovenant = 'true')");
//     }

//     // المالية
//     if (type === "Finance" && ProjectID != null) {
//       querys = `
//       LEFT JOIN usersBransh uB       ON uB.user_id = uC.id
//       LEFT JOIN companySub Su        ON Su.id = uB.idBransh
//       LEFT JOIN usersProject uP      ON uP.idBransh = Su.id AND uP.user_id = uC.id AND uP.ProjectID= ${ProjectID}`;
//       filters.push("(uP.ValidityProject LIKE ? AND uP.ProjectID = ?)");
//       params.push("%إشعارات المالية%");
//       params.push(ProjectID);
//     }

//     // العملاء المرتبطون بمشروع (إن لم تكن حالة المنشورات)

//     const query = `
// SELECT DISTINCT
//     ca.token,
//     ca.userName,
//     ca.Validity,
//     ca.job,
//     ca.jobdiscrption,
//     RE.id AS IDcompany,
//     ${querys.length > 0 && `uP.ProjectID ,   Su.id AS IDcompanySub,
//     Su.NameSub,
//     Su.PhoneNumber,
//     Su.Email,
//     uC.id AS UserCompanyID,
//     uC.job AS UserJob,

    
//     `} 
// FROM LoginActivaty ca
// LEFT JOIN company RE           ON RE.id = ca.IDCompany
// LEFT JOIN usersCompany uC      ON uC.PhoneNumber = ca.PhoneNumber

// ${querys}
// -- ✅ اربط المشاريع على نفس الفرع والمستخدم
// WHERE ca.IDCompany = ?
//   AND (${filters.join(" OR ")})
// `;

//     db.serialize(() => {
//       db.all(query, params, (err, result) => {
//         if (err) {
//           console.error(err);
//           return reject(err);
//         }
//         resolve(result);
//       });
//     });
//   });
// };






const SELECTTableusersCompanySub = (
  IDCompany,
  IDcompanySub,
  ProjectID,
  type = "all",
  kind = "sub"
) => {
  return new Promise((resolve, reject) => {
    const params = [IDCompany];

    // نجمع الشروط (OR) داخل قوس واحد
    const filters = ["uC.job = 'Admin'"];

    if(specialStages.includes(IDcompanySub)){
      // صلاحيات خاصة للمراحل
      filters.push(`ca.jobdiscrption = 'موظف' `);
    }else if (IDcompanySub == null || IDcompanySub === 0) {
      // بدون تقييد على فرع معيّن
      filters.push("uC.job = 'مدير الفرع'");
    } else {
      filters.push("(uC.job = 'مدير الفرع' AND uB.idBransh = ?)");
      params.push(IDcompanySub);
    }

    // المنشورات (الموظفون) – مشروع مطلوب لأي من الوظيفتين
    if (ProjectID != null && type !== "Finance") {
      filters.push("((ca.jobdiscrption = 'موظف' OR ca.jobdiscrption = 'مستخدم') AND uP.ProjectID = ?)");
      params.push(ProjectID);
    }

    // العهد
    if (kind === "CovenantBrinsh") {
      filters.push("(ca.job IN ('مالية') OR uB.Acceptingcovenant = 'true')");
    }

    // المالية
    if (type === "Finance" && ProjectID != null) {
      filters.push(`(
          EXISTS (
            SELECT 1
            FROM usersProject uP2
            WHERE uP2.user_id = uC.id
              AND uP2.ProjectID = ?
              AND uP2.ValidityProject LIKE ?
          )
        )`);
      params.push("%إشعارات المالية%");
      params.push(ProjectID);
    }

    // العملاء المرتبطون بمشروع (إن لم تكن حالة المنشورات)

    const query = `
SELECT DISTINCT
    ca.userID,
    ca.token,
    ca.userName,
    ca.Validity,
    ca.job,
    ca.jobdiscrption,
    RE.id AS IDcompany,
    Su.id AS IDcompanySub,
    Su.NameSub,
    Su.PhoneNumber,
    Su.Email,
    uC.id AS UserCompanyID,
    uC.job AS UserJob,
    uP.ProjectID
FROM LoginActivaty ca
LEFT JOIN company RE           ON RE.id = ca.IDCompany
LEFT JOIN usersCompany uC      ON uC.PhoneNumber = ca.PhoneNumber
LEFT JOIN usersBransh uB       ON uB.user_id = uC.id
-- ✅ اربط الفرع على فرع المستخدم نفسه
LEFT JOIN companySub Su        ON Su.id = uB.idBransh
-- ✅ اربط المشاريع على نفس الفرع والمستخدم
LEFT JOIN usersProject uP      ON uP.idBransh = Su.id AND uP.user_id = uC.id AND uP.ProjectID= ${ProjectID}
LEFT JOIN companySubprojects cS ON cS.id = uP.ProjectID
WHERE ca.IDCompany = ?
  AND (${filters.join(" OR ")})
  GROUP BY uC.id
`;

    db.serialize(() => {
      db.all(query, params, (err, result) => {
        if (err) {
          console.error(err);
          return reject(err);
        }
        resolve(result);
      });
    });
  });
};

// WHERE value LIKE '%مرحلة%'
// SELECT JSON_SEARCH(ValidityProject, 'one', 'إشعارات المالية') AS found_path
// FROM usersProject ;

// SELECT *
// FROM usersProject, json_each(ValidityProject)
// WHERE ValidityProject LIKE '%إشعارات المالية%'
// التحقق من كود الدخول

const SELECTTableLoginActivaty = (codeVerification, PhoneNumber) => {
  return new Promise((resolve, reject) => {
    let types = String(codeVerification).startsWith(5697)
      ? `ca.PhoneNumber=${PhoneNumber}`
      : `ca.codeVerification=${codeVerification} AND trim(ca.PhoneNumber)=trim(${PhoneNumber})`;
    db.serialize(async () => {
      db.get(
        `SELECT ca.userID,ca.id,ca.IDCompany,ca.userName,ca.IDNumber,ca.PhoneNumber,ca.Image,ca.DateOFlogin,ca.DateEndLogin,ca.Activation,ca.job,ca.jobdiscrption,ca.Validity,ca.token, RE.CommercialRegistrationNumber FROM LoginActivaty ca  LEFT JOIN 
        company RE ON RE.id = ca.IDCompany  WHERE ${types}`,
        [],
        function (err, result) {
          if (err) {
            reject(err);
            console.error(err.message);
            resolve(null);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
//  التحقق من انتهاء صلاحية دخول المستخدم
const SELECTTableLoginActivatActivaty = (PhoneNumber, type = "*") => {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      db.get(
        `SELECT ${type} FROM LoginActivaty WHERE trim(PhoneNumber)=trim(?) AND Activation="true"`,
        [PhoneNumber],
        function (err, result) {
          if (err) {
            reject(err);
            console.error(err.message);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
const SELECTTableLoginActivatActivatyall = (type = "*") => {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      db.all(
        `SELECT id,userName,PhoneNumber,job,jobdiscrption,codeVerification FROM LoginActivaty WHERE TRIM(PhoneNumber)!='502464530'   `,
        [],
        function (err, result) {
          if (err) {
            reject(err);
            console.error(err.message);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};

const SELECTTABLEHR = async (
  IDCompany,
  Dateday,
  LastID,
  search = "",
  LIMIT = "LIMIT 10"
) => {
  return new Promise((resolve, reject) => {
    const plase = parseInt(LastID) === 0 ? ">" : "<";

    db.serialize(function () {
      db.all(
        `SELECT pr.*, us.userName FROM Prepare pr LEFT JOIN usersCompany us ON us.id = pr.idUser  WHERE pr.IDCompany=? AND strftime("%Y-%m",pr.Dateday)=? AND pr.id ${plase} ? AND pr.CheckIntime IS NOT NULL ${search} ORDER BY pr.id DESC ${LIMIT}`,
        [IDCompany, Dateday, LastID],
        function (err, result) {
          if (err) {
            reject(err);
            console.log(err.message);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};

const SELECTTABLEObjectHR = async (IDCompany, Dateday, search = "") => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        `SELECT pr.*, us.userName FROM Prepare pr LEFT JOIN usersCompany us ON us.id = pr.idUser  WHERE pr.IDCompany=${IDCompany} AND strftime("%Y-%m-%d",pr.Dateday)= '${Dateday}'  ${search}  `,
        function (err, result) {
          if (err) {
            reject(err);
            console.log(err.message);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
const SELECTTABLEHRuser = async (IDCompany, idUser, DateDay) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        `SELECT * FROM Prepare WHERE IDCompany = ${IDCompany} AND idUser = ${idUser} AND strftime("%Y-%m-%d", Dateday) = '${DateDay}'`,
        // <-- FIXED: Added missing comma
        function (err, result) {
          if (err) {
            console.log(err.message);
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
const SELECTuserjustforHR = async (IDCompany, idUser) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(
        `SELECT Dateday FROM Prepare WHERE IDCompany = ${IDCompany} AND idUser = ${idUser} AND Overtimeassignment="true"`,
        function (err, result) {
          if (err) {
            console.log(err.message);
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
const SELECTUserPrepare = async (IDCompany, type) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(
        `SELECT 
        us.*, 
        CASE 
        WHEN up.idUser IS NULL THEN "false"  
        ELSE "true" 
        END AS Prepare
        FROM 
        usersCompany us
        LEFT JOIN 
        UserPrepare up ON us.id = up.idUser
        WHERE 
        us.IDCompany = ? AND us.Activation = 'true' ${type}  ORDER BY id ASC LIMIT 20`,
        [IDCompany],
        function (err, result) {
          if (err) {
            console.log(err.message);
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};

const SelectTableUserPrepareObject = async (IDCompany, idUser) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        `SELECT idUser FROM UserPrepare WHERE IDCompany = ? AND idUser = ?`,
        [IDCompany, idUser],
        function (err, result) {
          if (err) {
            console.log(err.message);
            reject(err);
          } else {
            resolve(result?.idUser || null);
          }
        }
      );
    });
  });
};
const SelectTableUserPrepareObjectcheck = async (IDCompany, PhoneNumber) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        `SELECT idUser FROM UserPrepare  LEFT JOIN usersCompany us ON us.id = idUser WHERE us.IDCompany = ? AND us.PhoneNumber = ?`,
        [IDCompany, PhoneNumber],
        function (err, result) {
          if (err) {
            console.log(err.message);
            reject(err);
          } else {
            resolve(result?.idUser || null);
          }
        }
      );
    });
  });
};
const Select_report_prepare = async () => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(
        `  
        SELECT *,JSON_EXTRACT(File,'$') AS File
          FROM Chat
          WHERE Sender = 'م / محمد يحيى القحطاني'
            AND (
                  Type = 'تحضير' AND      strftime('%Y-%m', Date) IN (                     
                      '2024-01','2024-02','2024-06','2024-10','2024-11','2024-12'
                  )
                  OR ( Type = 'تحضير' AND                            
                      strftime('%Y-%m', Date) IN ('2025-01','2025-02')
                  )
                )
          ORDER BY Date, timeminet;`,
        function (err, result) {
          if (err) {
            console.log(err.message);
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
module.exports = {
  SelectTableUserPrepareObjectcheck,
  SelectTableUserPrepareObject,
  SELECTUserPrepare,
  SELECTTABLEHR,
  SELECTTABLEHRuser,
  SELECTTableLoginActivatActivatyall,
  SELECTTableusersCompany,
  SELECTTableusersCompanySub,
  SELECTTableusersCompanyVerification,
  SELECTTableLoginActivaty,
  SELECTTableLoginActivatActivaty,
  SELECTTableusersCompanyVerificationID,
  SELECTTableusersCompanyonObject,
  SELECTTableusersCompanyVerificationIDUpdate,
  SELECTTableusersCompanyboss,
  SELECTusersCompany,
  SELECTTABLEObjectHR,
  SELECTuserjustforHR,
  SELECTTableusersCompanyVerificationobject,
  SELECTTableusersall,
  SELECTTableusersBransh,
  SELECTTableusersCompanyall,
  SELECTTableusersBranshmanger,
  SELECTTablevalidityuserinBransh,
  Select_report_prepare,
};
