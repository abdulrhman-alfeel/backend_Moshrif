const { roomKey } = require("../../middleware/Aid");
const db = require("../sqlite");
// الشركة

const SELECTTablecompany = (id, type = "*") => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        `SELECT ${type} FROM company WHERE id=?`,
        [id],
        function (err, result) {
          if (err) {
            reject(err);
            // console.error(err.message);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
const SELECTTablecompanyall = (type = "*") => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(
        `SELECT ${type} FROM company WHERE  Suptype!='مجاني' `,
        function (err, result) {
          if (err) {
            reject(err);
            // console.error(err.message);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
const SELECTTablecompanyRegistrationall = (
  type = "companyRegistration",
  count = 0
) => {
  return new Promise((resolve, reject) => {
    let Plus = parseInt(count) === 0 ? ">" : "<";
    db.serialize(function () {
      db.all(
        `SELECT * FROM ${type} WHERE  id ${Plus} ?  ORDER BY id DESC LIMIT 10`,
        [parseInt(count)],
        function (err, result) {
          if (err) {
            reject(err);
            // console.error(err.message);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
const SELECTTablecompanyRegistration = (id, type = "*") => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        `SELECT ${type} FROM companyRegistration WHERE id=?`,
        [id],
        function (err, result) {
          if (err) {
            reject(err);
            // console.error(err.message);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
const SELECTTablecompanyApi = (id, type = "*") => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        `SELECT ${type} FROM company WHERE Api=?`,
        [id],
        function (err, result) {
          if (err) {
            reject(err);
            // console.error(err.message);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};

const SELECTTablecompanyName = (id) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        `SELECT NameCompany,CommercialRegistrationNumber,Country FROM company WHERE id=?`,
        [id],
        function (err, result) {
          if (err) {
            reject(err);
            // console.error(err.message);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
const SelectVerifycompanyexistence = (
  CommercialRegistrationNumber,
  type = "company"
) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        `SELECT * FROM ${type} WHERE CommercialRegistrationNumber=?`,
        [CommercialRegistrationNumber],
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
const SelectVerifycompanyexistencePhonenumber = (PhoneNumber) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        `SELECT * FROM companyRegistration WHERE PhoneNumber=?`,
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

// عدد فروع الشركة
const SELECTTablecompanySubCount = (id) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(
        `SELECT COUNT(*) FROM companySub WHERE NumberCompany=?`,
        [id],
        function (err, result) {
          if (err) {
            reject(err);
            // console.error(err.message);
          } else {
            resolve(result);
          }
          // console.log(result, "selecttable");
        }
      );
    });
  });
};

// فروع الشركة
const SELECTTablecompanySubuser = (PhoneNumber) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(
        `WITH u AS (
  SELECT id, IDCompany, job
  FROM usersCompany
  WHERE TRIM(PhoneNumber) = TRIM(${PhoneNumber})
),
authorized AS (
  -- إذا كان Admin: كل فروع شركته
  SELECT DISTINCT RE.id
  FROM u
  JOIN companySub RE
    ON RE.NumberCompany = u.IDCompany
  WHERE u.job = 'Admin'

  UNION

  -- إذا لم يكن Admin: الفروع المصرّح بها فقط (ومقيدة بنفس الشركة)
  SELECT DISTINCT uB2.idBransh
  FROM u
  JOIN usersBransh uB2
    ON uB2.user_id = u.id
  JOIN companySub RE2
    ON RE2.id = uB2.idBransh
   AND RE2.NumberCompany = u.IDCompany
)
SELECT
  RE.*,
  (
    SELECT COUNT(*)
    FROM companySubprojects p
    WHERE p.IDcompanySub = RE.id
      AND p.Disabled = 'true'   -- أو TRUE إن كان منطقيًا
  ) AS CountProject
FROM companySub RE
JOIN authorized A
  ON A.id = RE.id
ORDER BY RE.id;
 `,

        function (err, result) {
          if (err) {
            reject(err);
            // console.error(err.message);
          } else {
            resolve(result);
          }
          // console.log(result, "selecttable");
        }
      );
    });
  });
};

const SELECTTablecompanySub = (
  id,
  type = "*",
  where = `NumberCompany=${id}`
) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(
        `SELECT ${type} FROM companySub WHERE ${where}`,

        function (err, result) {
          if (err) {
            reject(err);
            // console.error(err.message);
          } else {
            resolve(result);
          }
          // console.log(result, "selecttable");
        }
      );
    });
  });
};
// جلب معرف الفرع
const SELECTTablecompanySubID = (NameSub, NumberCompany) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        `SELECT id FROM companySub WHERE NameSub=? AND NumberCompany=? `,
        [NameSub, NumberCompany],
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

//  استدعاء اسم الفرع

const SELECTTableUsernameBrinsh = (id) => {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      db.get(
        `SELECT NameSub FROM companySub WHERE id=?`,
        [id],
        function (err, result) {
          if (err) {
            reject(err);
            // console.error(err.message);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
// طريقة اخرى لجلب الفروع
const SELECTTablecompanySubAnotherway = (id) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        `SELECT * FROM companySub WHERE id=?`,
        [id],
        function (err, result) {
          if (err) {
            reject(err);
            // console.error(err.message);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
const SELECTTablecompanySubLinkevaluation = (id) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        `SELECT * FROM Linkevaluation WHERE IDcompanySub=?`,
        [id],
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
// `UPDATE Projectdataforchat
// SET ProjectID = subquery.ProjectID,
//     Nameproject = subquery.Nameproject
// FROM
//     (SELECT ca.id AS ProjectID,
//             ca.Nameproject
//      FROM companySubprojects ca
//      LEFT JOIN companySub RE ON RE.id = ca.IDcompanySub
//      WHERE ca.IDcompanySub = 1) AS subquery`

// مشاريع الفرع
// من اجل حذف الفرع جلب جميع مشاريع الفرع
const SELECTTusersProjectProjectall = (PhoneNumber) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(
        "SELECT ProjectID FROM usersProject ut LEFT JOIN usersCompany uy ON uy.id = ut.user_id  WHERE trim(uy.PhoneNumber)=trim(?)",
        [PhoneNumber],
        function (err, result) {
          if (err) {
            reject(err);
            // console.log(err.message);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
// مشاريع الفرع
// من اجل حذف الفرع جلب جميع مشاريع الفرع
const SELECTTABLEcompanyProjectall = (id) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(
        "SELECT id FROM companySubprojects WHERE IDcompanySub=?",
        [id],
        function (err, result) {
          if (err) {
            reject(err);
            // console.log(err.message);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};

const selecttablecompanySubProjectall = (
  id,
  IDfinlty,
  PhoneNumber,
  Disabled = "true",
  Limit = "LIMIT 7",
  kind = "all"
) => {
  return new Promise((resolve, reject) => {
    let plase = parseInt(IDfinlty) === 0 ? ">" : "<";

    db.serialize(function () {
      db.all(
        kind === "all"
          ? `
SELECT
  CASE
    WHEN uC.job = 'Admin' THEN 'Admin'
    WHEN EXISTS (
      SELECT 1
      FROM usersBransh bX
      WHERE bX.user_id = uC.id
        AND bX.idBransh = cS.IDcompanySub
        AND bX.job = 'مدير الفرع'
    ) THEN 'مدير الفرع'
    ELSE (
      SELECT MAX(bY.job)
      FROM usersBransh bY
      WHERE bY.user_id = uC.id
        AND bY.idBransh = cS.IDcompanySub
    )
  END AS job,
  cS.id,
  cS.IDcompanySub,
  cS.Nameproject,
  cS.Note,
  cS.TypeOFContract,
  cS.GuardNumber,
  cS.LocationProject,
  cS.ProjectStartdate,
  cS.numberBuilding,
  cS.Contractsigningdate,
  cS.Disabled,
  cS.Referencenumber,
  cS.rate,
  cS.cost,
  (SELECT COUNT(*) FROM usersProject ut WHERE ut.ProjectID = cS.id) AS countuser,
  EX.Cost AS ConstCompany,
  EX.DisabledFinance,
  JSON_EXTRACT((
    SELECT MAX(bZ.ValidityBransh)
    FROM usersBransh bZ
    WHERE bZ.user_id = uC.id
      AND bZ.idBransh = cS.IDcompanySub
  ), '$') AS ValidityBransh,
  CASE WHEN EXISTS (
  SELECT 1
  FROM project_subscription ps
  JOIN company_subscriptions st
    ON st.id = ps.company_subscriptions_id
  AND st.status = 'active'
  WHERE ps.project_id = cS.id
) THEN 'true' ELSE 'true' END AS status_subscription,
( SELECT st.id
  FROM project_subscription ps
  JOIN company_subscriptions st
    ON st.id = ps.company_subscriptions_id
  AND st.status = 'active'   WHERE ps.project_id = cS.id )  AS company_subscriptions_id
FROM usersCompany uC
JOIN company EX
  ON EX.id = uC.IDCompany
JOIN companySub RE
  ON RE.NumberCompany = EX.id
JOIN companySubprojects cS
  ON cS.IDcompanySub = RE.id
WHERE
  REPLACE(TRIM(uC.PhoneNumber), ' ', '') = TRIM(${PhoneNumber})
  AND cS.id > ${IDfinlty}
  AND cS.Disabled = 'true'     -- إن كان منطقيًا استخدم TRUE
 AND (
       (uC.job = 'Admin' AND cS.IDcompanySub = ${id})         -- لو أردتها لفرع محدد
       OR EXISTS (                                         -- مدير الفرع يرى مشاريع فروعه فقط
            SELECT 1
            FROM usersBransh b1
            WHERE b1.user_id  = uC.id
              AND b1.job      = 'مدير الفرع'
              AND b1.idBransh = ${id}   AND cS.IDcompanySub = ${id}
      )
       OR EXISTS (                                         -- المستخدم العادي يرى المشاريع المكلف بها
            SELECT 1
            FROM usersProject up1
            WHERE up1.user_id   = uC.id
              AND up1.idBransh  = ${id}       AND cS.IDcompanySub = ${id}
              AND up1.ProjectID = cS.id
      )
  )
ORDER BY cS.id ASC
${Limit}
;
        `
          : `SELECT 
        cS.id AS ProjectID,cS.Nameproject
        FROM usersCompany uC
        LEFT JOIN usersBransh uB 
            ON uC.id = uB.user_id 
            AND uC.job NOT IN ('Admin') 
        LEFT JOIN usersProject uP 
            ON uB.idBransh = uP.idBransh 
            AND uB.user_id = uP.user_id
        LEFT JOIN companySubprojects cS 
        ON (
          (uC.job = 'Admin' )
          OR (uB.job = 'مدير الفرع' )
          OR (uC.job NOT IN ('Admin','مدير الفرع') 
              AND uP.ProjectID = cS.id )
        )
        WHERE trim(uC.PhoneNumber) =trim(${PhoneNumber})  AND (cS.id) ${plase} ${IDfinlty}   AND (cS.Disabled) =${Disabled}  ORDER BY cS.id ASC  ${Limit}`,

        function (err, result) {
          if (err) {
            reject(err);
            // console.log(err.message);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
// const selecttablecompanySubProjectall = (
//   id,
//   IDfinlty,
//   PhoneNumber,
//   Disabled = "true",
//   Limit = "LIMIT 7",
//   kind = "all"
// ) => {
//   return new Promise((resolve, reject) => {
//     let plase = parseInt(IDfinlty) === 0 ? ">" : "<";

//     db.serialize(function () {
//       db.all(
//         kind === "all"
//           ? `
// SELECT
//   CASE
//     WHEN uC.job = 'Admin' THEN 'Admin'
//     WHEN EXISTS (
//       SELECT 1
//       FROM usersBransh bX
//       WHERE bX.user_id = uC.id
//         AND bX.idBransh = cS.IDcompanySub
//         AND bX.job = 'مدير الفرع'
//     ) THEN 'مدير الفرع'
//     ELSE (
//       SELECT MAX(bY.job)
//       FROM usersBransh bY
//       WHERE bY.user_id = uC.id
//         AND bY.idBransh = cS.IDcompanySub
//     )
//   END AS job,
//   cS.id,
//   cS.IDcompanySub,
//   cS.Nameproject,
//   cS.Note,
//   cS.TypeOFContract,
//   cS.GuardNumber,
//   cS.LocationProject,
//   cS.ProjectStartdate,
//   cS.numberBuilding,
//   cS.Contractsigningdate,
//   cS.Disabled,
//   cS.Referencenumber,
//   cS.rate,
//   cS.cost,
//   (SELECT COUNT(*) FROM usersProject ut WHERE ut.ProjectID = cS.id) AS countuser,
//   EX.Cost AS ConstCompany,
//   EX.DisabledFinance,
//   JSON_EXTRACT((
//     SELECT MAX(bZ.ValidityBransh)
//     FROM usersBransh bZ
//     WHERE bZ.user_id = uC.id
//       AND bZ.idBransh = cS.IDcompanySub
//   ), '$') AS ValidityBransh,
//   CASE WHEN EXISTS (
//   SELECT 1
//   FROM project_subscription ps
//   JOIN company_subscriptions st
//     ON st.id = ps.company_subscriptions_id
//   AND st.status = 'active'
//   WHERE ps.project_id = cS.id
// ) THEN 'true' ELSE 'false' END AS status_subscription,
// ( SELECT st.id
//   FROM project_subscription ps
//   JOIN company_subscriptions st
//     ON st.id = ps.company_subscriptions_id
//   AND st.status = 'active'   WHERE ps.project_id = cS.id )  AS company_subscriptions_id
// FROM usersCompany uC
// JOIN company EX
//   ON EX.id = uC.IDCompany
// JOIN companySub RE
//   ON RE.NumberCompany = EX.id
// JOIN companySubprojects cS
//   ON cS.IDcompanySub = RE.id
// WHERE
//   REPLACE(TRIM(uC.PhoneNumber), ' ', '') = TRIM(${PhoneNumber})
//   AND cS.id > ${IDfinlty}
//   AND cS.Disabled = 'true'     -- إن كان منطقيًا استخدم TRUE
//  AND (
//        (uC.job = 'Admin' AND cS.IDcompanySub = ${id})         -- لو أردتها لفرع محدد
//        OR EXISTS (                                         -- مدير الفرع يرى مشاريع فروعه فقط
//             SELECT 1
//             FROM usersBransh b1
//             WHERE b1.user_id  = uC.id
//               AND b1.job      = 'مدير الفرع'
//               AND b1.idBransh = ${id}   AND cS.IDcompanySub = ${id}
//       )
//        OR EXISTS (                                         -- المستخدم العادي يرى المشاريع المكلف بها
//             SELECT 1
//             FROM usersProject up1
//             WHERE up1.user_id   = uC.id
//               AND up1.idBransh  = ${id}       AND cS.IDcompanySub = ${id}
//               AND up1.ProjectID = cS.id
//       )
//   )
// ORDER BY cS.id ASC
// ${Limit}
// ;
//         `
//           : `SELECT 
//         cS.id AS ProjectID,cS.Nameproject
//         FROM usersCompany uC
//         LEFT JOIN usersBransh uB 
//             ON uC.id = uB.user_id 
//             AND uC.job NOT IN ('Admin') 
//         LEFT JOIN usersProject uP 
//             ON uB.idBransh = uP.idBransh 
//             AND uB.user_id = uP.user_id
//         LEFT JOIN companySubprojects cS 
//         ON (
//           (uC.job = 'Admin' )
//           OR (uB.job = 'مدير الفرع' )
//           OR (uC.job NOT IN ('Admin','مدير الفرع') 
//               AND uP.ProjectID = cS.id )
//         )
//         WHERE trim(uC.PhoneNumber) =trim(${PhoneNumber})  AND (cS.id) ${plase} ${IDfinlty}   AND (cS.Disabled) =${Disabled}  ORDER BY cS.id ASC  ${Limit}`,

//         function (err, result) {
//           if (err) {
//             reject(err);
//             // console.log(err.message);
//           } else {
//             resolve(result);
//           }
//         }
//       );
//     });
//   });
// };

// جلب المشاريع للمنصة
const SELECTTablecompanySubProject = (
  id,
  kind = "all",
  Disabled = "true",
  type = ""
) => {
  return new Promise((resolve, reject) => {
    let stringSql =
      kind === "difference"
        ? `SELECT Contractsigningdate,ProjectStartdate,Nameproject,IDcompanySub,TypeOFContract FROM companySubprojects WHERE id=? AND Disabled =?`
        : kind === "forchat"
        ? `SELECT ca.id AS ProjectID,ca.Nameproject FROM companySubprojects ca  LEFT JOIN companySub RE ON RE.id = ca.IDcompanySub  WHERE  ca.IDcompanySub=? AND ca.Disabled=? ${type} `
        : `SELECT COUNT(*) FROM companySubprojects WHERE IDcompanySub=? AND Disabled =?`;

    let data = [id, Disabled];
    db.serialize(function () {
      db.all(stringSql, data, function (err, result) {
        if (err) {
          reject(err);
          // console.log(err.message);
        } else {
          resolve(result);
        }
      });
    });
  });
};

const SELECTTablecompanySubProjectLast_id = (
  id,
  kind = "all",
  type = "RE.id"
) => {
  return new Promise((resolve, reject) => {
    let stringSql =
      kind === "all"
        ? `SELECT MAX(id) AS last_id,numberBuilding FROM companySubprojects WHERE  Disabled ='true' AND IDcompanySub=?`
        : kind === "max"
        ? `SELECT MAX(ca.id) AS last_id, ca.id,ca.IDcompanySub,ca.Nameproject,ca.Note,ca.TypeOFContract,ca.GuardNumber,ca.LocationProject,ca.ProjectStartdate,ca.Contractsigningdate,ca.Disabled,EX.Cost AS ConstCompany, Li.urlLink AS Linkevaluation,RE.NumberCompany FROM companySubprojects ca LEFT JOIN companySub RE ON RE.id = ca.IDcompanySub LEFT JOIN Linkevaluation Li ON Li.IDcompanySub =RE.id LEFT JOIN company EX ON EX.id = RE.NumberCompany  WHERE Disabled ='true' AND ${type}=?`
        : kind === "forchat"
        ? `SELECT ca.id AS ProjectID,ca.Nameproject FROM companySubprojects ca WHERE ca.Disabled="true" AND ca.id=?`
        : `SELECT ca.id,ca.IDcompanySub,ca.Nameproject,ca.Note,ca.TypeOFContract,ca.GuardNumber,ca.LocationProject,ca.ProjectStartdate,ca.numberBuilding,ca.Contractsigningdate,ca.Disabled,EX.Cost AS ConstCompany, Li.urlLink AS Linkevaluation ,ca.Referencenumber,ca.Cost_per_Square_Meter,
        ca.Project_Space FROM companySubprojects ca LEFT JOIN companySub RE ON RE.id = ca.IDcompanySub LEFT JOIN Linkevaluation Li ON Li.IDcompanySub =RE.id LEFT JOIN  company EX ON EX.id = RE.NumberCompany  WHERE Disabled ='true' AND ca.id=?`;
    db.serialize(function () {
      db.get(stringSql, [id], function (err, result) {
        if (err) {
          reject(err);
          // console.error(err.message);
        } else {
          resolve(result);
        }
      });
    });
  });
};
// طلب المشاريع حسب صلاحية المستخدم
const SELECTTablecompanySubProjectindividual = (id, IDcompanySub) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(
        `SELECT * FROM companySubprojects WHERE id=?  AND IDcompanySub=?`,
        [id, IDcompanySub],
        function (err, result) {
          if (err) {
            reject(err);
            // console.error(err.message);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
// فلتر المشاريع
const SELECTTablecompanySubProjectFilter = (
  search,
  IDcompanySub,
  PhoneNumber,
  type = "app"
) => {
  return new Promise((resolve, reject) => {
    let stringSql =
      `SELECT 
        CASE  
        WHEN uC.job = 'Admin' THEN uC.job
        WHEN cS.Nameproject IS NULL  THEN NULL
        ELSE uB.job
        END AS job,
        cS.id,
        cS.IDcompanySub,
        cS.Nameproject,
        cS.Note,
        cS.TypeOFContract,
        cS.GuardNumber,
        cS.LocationProject,
        cS.ProjectStartdate,
        cS.numberBuilding,
        cS.Contractsigningdate,
        cS.Disabled,
        cS.Referencenumber, 
        cS.rate,
        cS.cost,
        cS.countuser,
        EX.Cost AS ConstCompany,
        EX.DisabledFinance,
        Li.urlLink AS Linkevaluation,
        CASE WHEN EXISTS (
        SELECT 1
        FROM project_subscription ps
        JOIN company_subscriptions st
          ON st.id = ps.company_subscriptions_id
        AND st.status = 'active'
        WHERE ps.project_id = cS.id
      ) THEN 'true' ELSE 'true' END AS status_subscription
        FROM usersCompany uC
        LEFT JOIN usersBransh uB 
            ON uC.id = uB.user_id 
            AND uC.job NOT IN ('Admin') 
        LEFT JOIN usersProject uP 
            ON uB.idBransh = uP.idBransh 
            AND uB.user_id = uP.user_id
        LEFT JOIN companySubprojects cS 
      ON (
          (uC.job = 'Admin' AND cS.IDcompanySub = ${IDcompanySub})
          OR (uB.job = 'مدير الفرع' AND uB.idBransh = ${IDcompanySub})
          OR (uC.job NOT IN ('Admin','مدير الفرع') 
          AND uP.ProjectID = cS.id 
          AND uB.idBransh = ${IDcompanySub})
      )
      LEFT JOIN Linkevaluation Li ON Li.IDcompanySub = cS.IDcompanySub
      LEFT JOIN companySub RE ON RE.id = cS.IDcompanySub
      LEFT JOIN company EX ON EX.id = RE.NumberCompany
      ` +
      (type === "app"
        ? ` WHERE REPLACE(TRIM(uC.PhoneNumber), ' ', '') = TRIM(${PhoneNumber}) AND cS.Disabled = 'true' AND cS.IDcompanySub=${IDcompanySub} AND (cS.Nameproject LIKE '%${search}%' OR cS.numberBuilding LIKE '%${search}%') ORDER BY cS.id ASC`
        : ` WHERE cS.Disabled = 'true' AND cS.IDcompanySub=${IDcompanySub} AND (cS.Nameproject LIKE '%${search}%' OR cS.numberBuilding LIKE '%${search}%') ORDER BY cS.id ASC`);
    db.serialize(function () {
      db.all(stringSql, function (err, result) {
        if (err) {
          reject(err);
          console.log(err.message);
        } else {
          resolve(result);
        }
      });
    });
  });
};
// طلب تاريخ المشروع
const SELECTProjectStartdate = (id, kind = "all", type = "id") => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        kind === "all"
          ? `SELECT pr.ProjectStartdate,pr.Contractsigningdate,pr.Nameproject,pr.numberBuilding,pr.id,pr.IDcompanySub, RE.NumberCompany,pr.TypeOFContract FROM companySubprojects pr LEFT JOIN companySub RE ON RE.id = pr.IDcompanySub  WHERE pr.${type}=? `
          : "SELECT ca.id,EX.Cost AS ConstCompany FROM companySubprojects ca LEFT JOIN companySub RE ON RE.id = ca.IDcompanySub LEFT JOIN company EX ON EX.id = RE.NumberCompany  WHERE ca.id=?",
        [id],
        function (err, result) {
          if (err) {
            reject(err);
            // console.error(err.message);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
const SELECTProjectStartdateapis = (id, idSub) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        `SELECT ProjectStartdate,Contractsigningdate,Nameproject,numberBuilding,id,IDcompanySub FROM companySubprojects   WHERE Referencenumber=? AND IDcompanySub=? `,
        [id, idSub],
        function (err, result) {
          if (err) {
            // console.error(err.message);
            // reject(err);
            resolve(false);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
const SELECTProjectid = () => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(`SELECT id FROM companySubprojects  `, function (err, result) {
        if (err) {
          // console.error(err.message);
          // reject(err);
          resolve(false);
        } else {
          resolve(result);
        }
      });
    });
  });
};
const SELECTStageid = () => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(
        `SELECT ProjectID, StageID FROM StagesCUST  `,
        function (err, result) {
          if (err) {
            // console.error(err.message);
            // reject(err);
            resolve(false);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
const SELECTStageallid = (id) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(
        `SELECT StageCustID FROM StagesCUST  WHERE ProjectID =${id}`,
        function (err, result) {
          if (err) {
            // console.error(err.message);
            // reject(err);
            resolve(false);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
const SELECTStageSubid = (
  type = "StagesCUST",
  data = "ProjectID, StageID",
  WHERE = "StageID=?"
) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        `SELECT ${data} FROM ${type} WHERE  ${WHERE} `,
        function (err, result) {
          if (err) {
            // console.error(err.message);
            // reject(err);
            resolve(false);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};

// حساب رصيد المشروع
const SELECTSUMAmountandBring = (id) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        `SELECT 
        ca.Nameproject AS 'Nameproject', 
        ca.id AS 'ProjectID',
        COALESCE(RE.total_revenue, 0.00) AS 'TotalRevenue', 
        COALESCE(EX.landers_count, 0.00) AS 'TotalExpense', 
        COALESCE(RT.total_Returns, 0.00) AS 'TotalReturns', 
        COALESCE((COALESCE(RE.total_revenue, 0.00) - COALESCE(EX.landers_count, 0.00) + COALESCE(RT.total_Returns, 0.00)), 0.00) AS 'RemainingBalance'
        FROM companySubprojects ca
        LEFT JOIN (
        SELECT projectID, COALESCE(SUM(Amount), 0.00) AS landers_count
        FROM Expense
        GROUP BY projectID
        ) EX ON EX.projectID = ca.id
        LEFT JOIN (
        SELECT projectID, COALESCE(SUM(Amount), 0.00) AS total_revenue
        FROM Revenue
        GROUP BY projectID
        ) RE ON RE.projectID = ca.id
        LEFT JOIN (
        SELECT projectID, COALESCE(SUM(Amount), 0.00) AS total_Returns
        FROM Returns
        GROUP BY projectID
        ) RT ON RT.projectID = ca.id
        WHERE ca.id =?`,
        [id],
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

// طلب بيانات الشركة والفرع والمشروع
const SELECTdataprojectandbrinshandcompany = (id) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        `SELECT 
        ca.Nameproject AS 'Nameproject', 
        EX.NameSub AS "NameBranch",
        RE.NameCompany AS "NameCompany",
        EX.Email,EX.PhoneNumber
        FROM companySubprojects ca
        LEFT JOIN (
        SELECT id,NumberCompany,NameSub,Email,PhoneNumber
        FROM companySub
        ) EX ON EX.id = ca.IDcompanySub
        LEFT JOIN (
        SELECT *
        FROM company
        ) RE ON RE.id = EX.NumberCompany
        WHERE ca.id =?`,
        [id],
        function (err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
// طلب بيانات معرفات المشاريع والشركة
const SELECTIDcompanyANDpreoject = (id) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(
        `SELECT EX.id AS IDCompany,ca.id AS ProjectID FROM companySubprojects  ca LEFT JOIN companySub RE ON RE.id = ca.IDcompanySub LEFT JOIN company EX ON EX.id = RE.NumberCompany`,

        function (err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
const selectprojectdatabycompany = (id) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(
        `SELECT EX.id AS IDCompany,ca.id AS ProjectID FROM companySubprojects  ca LEFT JOIN companySub RE ON RE.id = ca.IDcompanySub LEFT JOIN company EX ON EX.id = RE.NumberCompany WHERE EX.id = ?`,
        [id],

        function (err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};

//  سنبل المراحل والفروع

// المراحل
const SELECTFROMTableStageTempletall = (Type, number = 0) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(
        `SELECT * FROM StagesTemplet WHERE Type='${Type}' AND StageIDtemplet  > ${number} ORDER BY StageIDtemplet ASC lIMIT 10`,
        function (err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
const SELECTFROMTableStageTempletaObject = (number, IDCompany, add = "") => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        `SELECT te.StageIDtemplet,us.StageName,te.attached ${add} FROM StagesTemplet te LEFT JOIN StagesCUST us ON us.StageID = te.StageID WHERE te.StageIDtemplet='${number}' AND te.IDCompany=${IDCompany}`,
        function (err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
const SELECTFROMTableStageTempletadays = (StageID, type, IDCompany) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        `SELECT Days FROM StagesTemplet WHERE StageID=${StageID} Type =${type} AND IDCompany=${IDCompany}`,
        function (err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
// SELECT * FROM StagesSubTemplet WHERE StageID=A1  AND Stagestype_id=92  AND  StageSubID  > 0 ORDER BY StageSubID ASC liMIT 10
const SELECTFROMTableSubStageTempletall = (
  StageID,
  Stagestype_id,
  number = 0
) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(
        `SELECT * FROM StagesSubTemplet WHERE StageID='${StageID}'  AND Stagestype_id=${Stagestype_id}  AND  StageSubID  > ${number} ORDER BY StageSubID ASC liMIT 10`,
        function (err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};

const SELECTFROMTableStageTempletmax = (type, IDCompany) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      let arrays =
        type === "عام"
          ? `SELECT max(StageIDtemplet) AS StageIDtemplet , StageID
        FROM StagesTemplet WHERE  IDCompany=${IDCompany}  AND StageID !='A1'`
          : `SELECT max(StageIDtemplet) , StageID,
            (SELECT SUM(Ratio) FROM StagesTemplet WHERE trim(Type) = trim('${type}') AND IDCompany=${IDCompany}) AS TotalRatio 
        FROM StagesTemplet WHERE  IDCompany=${IDCompany} `;
      db.get(arrays, function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  });
};
const SELECTFROMTablecompanysubprojectStageTemplet = (Type, IDCompany) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(
        `SELECT * 
FROM StagesTemplet 
WHERE TRIM(Type) = TRIM("${Type}") 
  AND IDCompany = 
    (SELECT IDCompany 
     FROM StagesTemplet 
     WHERE TRIM(Type) = TRIM("${Type}") 
     AND IDCompany = ${IDCompany} 
     LIMIT 1) 
UNION
SELECT * 
FROM StagesTemplet 
WHERE TRIM(Type) = TRIM("${Type}") 
  AND IDCompany = 1
  AND NOT EXISTS (
      SELECT 1 
      FROM StagesTemplet 
      WHERE TRIM(Type) = TRIM("${Type}") 
      AND IDCompany = ${IDCompany}
  );`,
        function (err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};

const selectStagestypeforProject = (IDCompany) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(
        `SELECT * FROM Stagestype WHERE IDCompany = ${IDCompany} AND trim(Type) != trim('عام') OR IDCompany = 1 AND trim(Type) != trim('عام')`,
        function (err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
const selectStagestypeTemplet = (IDCompany) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(
        `SELECT * FROM Stagestype WHERE IDCompany = ${IDCompany} `,
        function (err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};

// المراحل الفرعية

const SELECTFROMTablecompanysubprojectStagesubTeplet = (
  StageID,
  Stagestype_id,
  IDCompany
) => {
  // console.log(StageID, "helll stageID");
  return new Promise((resolve, reject) => {
    const sql = `
  SELECT * 
  FROM StagesSubTemplet 
  WHERE StageID = ? AND Stagestype_id = ? AND IDCompany = ?

  UNION

  SELECT * 
  FROM StagesSubTemplet 
  WHERE StageID = ? AND Stagestype_id = ? AND IDCompany = 1
    AND NOT EXISTS (
        SELECT 1 
        FROM StagesSubTemplet 
        WHERE StageID = ? AND IDCompany = ?
    );
`;

    const params = [
      StageID,
      Stagestype_id,
      IDCompany,
      StageID,
      Stagestype_id,
      StageID,
      IDCompany,
    ];

    db.serialize(function () {
      db.all(sql, params, function (err, result) {
        if (err) {
          console.log(err, "err");
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  });
};

// مراحل المشروع
const SELECTTableStageCUST_IMAGE = (ProjectID, StageID, count = 0) => {
  let stringSql = `SELECT * FROM StagesCUST_Image cu   WHERE  cu.id > ? AND  cu.ProjectID=? AND cu.StageID=? ORDER BY cu.id ASC LIMIT 10`;

  let data = [count, ProjectID, StageID];
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(stringSql, data, function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  });
};
const SELECTTablecompanySubProjectStageCUST = (
  id,
  kind = "all",
  type = "*"
) => {
  let stringSql =
    kind === "all"
      ? `SELECT ${type} FROM StagesCUST cu LEFT JOIN companySubprojects pr ON pr.id = cu.ProjectID  WHERE cu.ProjectID=?`
      : kind === "CountDate"
      ? `SELECT EndDate , StartDate FROM StagesCUST WHERE ProjectID=?`
      : `SELECT * FROM StagesCUST WHERE ProjectID=? AND trim(StageName)=trim(?)`;
  let data = kind === "all" ? [id] : kind === "CountDate" ? [id] : [id, kind];
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(stringSql, data, function (err, result) {
        if (err) {
          reject(err);
          // console.error(err.message);
        } else {
          resolve(result);
        }
      });
    });
  });
};
const SELECTTablecompanySubProjectStageCUSTv2 = (id, kind = "") => {
  
let stringSql = `
SELECT
  cu.StageCustID,
  cu.StageID,
  cu.ProjectID,
  cu.Type,
  cu.StageName,
  cu.Days,
  cu.StartDate,
  cu.EndDate,
  cu.CloseDate,
  cu.OrderBy,
  cu.Difference,
  cu.Done,
  cu.NoteOpen,
  cu.OpenBy,
  cu.NoteClosed,
  cu.ClosedBy,
  -- إجمالي عناصر المرحلة
  (
    SELECT COUNT(*)
    FROM StagesSub s
    WHERE s.StagHOMID = cu.StageID
      AND s.ProjectID = ${id}
  ) AS count,
  -- النسبة
  CASE
    WHEN (
      SELECT COUNT(*)
      FROM StagesSub s
      WHERE s.StagHOMID = cu.StageID
        AND s.ProjectID = ${id}
    ) = 0 THEN 0
    ELSE ROUND(
      (
        (
          SELECT COUNT(*)
          FROM StagesSub s
          WHERE s.StagHOMID = cu.StageID
            AND s.ProjectID = ${id}
            AND TRIM(s.Done) = 'true'
        ) * 100.0
      ) /
      (
        SELECT COUNT(*)
        FROM StagesSub s
        WHERE s.StagHOMID = cu.StageID
          AND s.ProjectID = ${id}
      ),
      2
    )
  END AS rate,
  -- عدد مراحل المشروع في StagesCUST
  (
    SELECT COUNT(*)
    FROM StagesCUST
    WHERE ProjectID = ${id}
  ) AS count_all_stages

FROM StagesCUST cu
LEFT JOIN companySubprojects pr ON pr.id = cu.ProjectID
WHERE cu.ProjectID = ?
${kind || ''}
`;

  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(stringSql, [id], function (err, result) {
        if (err) {
          reject(err);
          // console.error(err.message);
        } else {
          resolve(result);
        }
      });
    });
  });
};

// `SELECT
//     pr.cost,
//     pr.Nameproject,
//     pr.Contractsigningdate,
//     pr.ProjectStartdate,
//     pr.IDcompanySub,
//     cu.StageID,
//     cu.ProjectID,
//     cu.StageName,
//     cu.Days,
//     cu.OrderBy,
//     cu.Done,
//     cu.StartDate,
//     cu.EndDate,
//     cu.CloseDate,
//     cu.Ratio,
//     cu.attached,
//     cu.Type,
//     cu.rate,
//     cu.OpenBy,
//     cu.NoteOpen,
//     cu.ClosedBy,
//     cu.NoteClosed,
//     RE.NumberCompany,
//     (SELECT SUM(Ratio)
//      FROM StagesTemplet
//      WHERE Type = "عظم بدون قبو" ) AS TotalRatio,
//     (SELECT JSON_OBJECT('Done', SC.Done, 'Days', SC.Days)
//      FROM StagesCUST SC
//      WHERE SC.ProjectID = cu.ProjectID AND SC.Done = "true"
//      LIMIT 1) AS verify,

//     -- إضافة CASE مع json_group_array
//     CASE
//         WHEN (SELECT COUNT(*)
//               FROM StagesCUST SC
//               WHERE SC.ProjectID = cu.ProjectID AND SC.Done = "true") <= 0 THEN
//             (SELECT json_group_array(
//                 DISTINCT JSON_OBJECT(
//                     'StageID', SC.StageID,
//                     'ProjectID', SC.ProjectID,
//                     'Done', SC.Done,
//                     'Days', SC.Days,
//                     'StartDate', SC.StartDate,
//                     'EndDate', SC.EndDate,
//                     'Ratio', SC.Ratio,
//                     'attached', SC.attached,
//                     'OrderBy', SC.OrderBy,
//                     'Type', SC.Type,
//                     'rate', SC.rate,
//                     'OpenBy', SC.OpenBy,
//                     'NoteOpen', SC.NoteOpen,
//                     'ClosedBy', SC.ClosedBy,
//                     'NoteClosed', SC.NoteClosed
//                 )
//             )
//             FROM StagesCUST SC
//             WHERE SC.ProjectID = cu.ProjectID )
//         ELSE NULL
//     END AS verifyDetails -- إضافة اسم للعمود الجديد

// FROM
//     StagesCUST cu
// LEFT JOIN
//     companySubprojects pr ON pr.id = cu.ProjectID
// LEFT JOIN
//     companySub RE ON RE.id = pr.IDcompanySub
// WHERE
//     cu.ProjectID = 45 AND cu.StageID = 53;
// ;
// `
// جلب كائن واحد من المراحل
const SELECTTablecompanySubProjectStageCUSTONe = (
  ProjectID,
  StageID,
  kind = "all",
  type = ""
) => {
  const stringSql =
    kind === "all"
      ? `SELECT cu.rate,pr.cost,cu.StageName, pr.Nameproject,pr.Contractsigningdate,pr.ProjectStartdate,pr.IDcompanySub, cu.StageID
      ,cu.ProjectID,cu.Type,cu.StageName,cu.Days,cu.StartDate,cu.EndDate,cu.CloseDate,cu.OrderBy,cu.Done,cu.OpenBy,cu.NoteOpen,cu.ClosedBy,cu.NoteClosed,
      RE.NumberCompany,cu.Ratio,cu.attached ${type} FROM StagesCUST cu LEFT JOIN companySubprojects pr ON pr.id = cu.ProjectID LEFT JOIN companySub RE ON RE.id = pr.IDcompanySub WHERE  cu.ProjectID=? AND cu.StageID=? `
      : kind === "notifcation"
      ? `SELECT max(cu.StageID) AS StageID,pr.Nameproject,pr.IDcompanySub, cu.ProjectID,
      cu.Type,cu.StageName,cu.Days,cu.StartDate,cu.EndDate,cu.CloseDate,cu.OrderBy,cu.Done,cu.OpenBy,cu.NoteOpen,cu.ClosedBy,cu.NoteClosed ,
      RE.NumberCompany FROM StagesCUST cu LEFT JOIN companySubprojects pr ON pr.id = cu.ProjectID LEFT JOIN companySub RE ON RE.id = pr.IDcompanySub WHERE cu.StageID != 'A1' AND ${type} `
      : `SELECT Done,Days FROM StagesCUST WHERE ProjectID=? AND Done = "true"`;
  const data =
    kind === "all" || type === "cu.projectID=? AND cu.StageID=?"
      ? [ProjectID, StageID]
      : [ProjectID];
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(stringSql, data, function (err, result) {
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
const SELECTTableStagesCUST_Image = (ProjectID, StageID) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(
        `SELECT * FROM StagesCUST_Image WHERE ProjectID=? AND StageID = ?`,
        [ProjectID, StageID],
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

const SELECTTableStageStageSub = (ProjectID, StageID) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(
        `SELECT StageSubName,CloseDate,Done,    
            REPLACE(JSON_EXTRACT(closingoperations, '$[0].userName'), '"', '') AS userName FROM StagesSub WHERE ProjectID=? AND StagHOMID =?`,
        [ProjectID, StageID],
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

// جلب اجمالي عدد المراحل الرئيسية المغلقة والمفتوحة
const SELECTTablecompanySubProjectStageCUSTCount = (id, kind = "all") => {
  let stringSql =
    kind === "all"
      ? `SELECT COUNT(Type) FROM StagesCUST WHERE ProjectID=?`
      : `SELECT COUNT(Type) FROM StagesCUST WHERE ProjectID=? AND trim(Done)=trim(?)`;
  let data = kind === "all" ? [id] : [id, kind];
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(stringSql, data, function (err, result) {
        if (err) {
          reject(err);
          // console.error(err.message);
        } else {
          resolve(result);
        }
      });
    });
  });
};
// جلب اجمالي عدد المراحل الفرعية المغلقة والمفتوحة
const SELECTTablecompanySubProjectStageCUSTSubCount = (
  StagHOMID,
  ProjectID,
  kind = "all"
) => {
  let stringSql =
    kind === "all"
      ? `SELECT COUNT(StageSubName) FROM StagesSub WHERE StagHOMID=? AND ProjectID=?`
      : `SELECT COUNT(StageSubName) FROM StagesSub WHERE StagHOMID=? AND ProjectID=? AND trim(Done)=trim(?)`;
  let data =
    kind === "all" ? [StagHOMID, ProjectID] : [StagHOMID, ProjectID, kind];
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(stringSql, data, function (err, result) {
        if (err) {
          reject(err);
          // console.error(err.message);
        } else {
          resolve(result);
        }
      });
    });
  });
};

// جمع المراحل الفرعية للمشروع ككل
const SELECTTablecompanybrinshStagesSubAll = (ProjectID, kind = "all") => {
  // console.log(ProjectID, kind)
  return new Promise((resolve, reject) => {
    let stringSql =
      kind === "all"
        ? `SELECT COUNT(StageSubName) FROM StagesSub WHERE ProjectID=?`
        : `SELECT COUNT(StageSubName) FROM StagesSub WHERE  ProjectID=? AND Done = ?`;
    let data = kind === "all" ? [ProjectID] : [ProjectID, kind];
    db.serialize(function () {
      db.get(stringSql, data, function (err, result) {
        if (err) {
          reject(err);
          console.log(err.message);
          resolve([]);
        } else {
          resolve(result);
        }
      });
    });
  });
};

// جلب مراحل المشروع حسب تاريخ النهاية والترتيب ومعرف اخر مرحلة في نفس المشروع
const SELECTTablecompanySubProjectStageCUSTAccordingEndDateandStageIDandStartDate =
  (id) => {
    return new Promise((resolve, reject) => {
      db.serialize(function () {
        db.get(
          `SELECT MAX(StageID) AS StageID ,MAX(OrderBy) AS OrderBy,EndDate, (SELECT SUM(Ratio) FROM StagesCUST WHERE ProjectID=? ) AS TotalRatio  FROM StagesCUST WHERE ProjectID=? AND  StageID != "A1" `,
          [id, id],
          function (err, result) {
            if (err) {
              reject(err);
              // console.error(err.message);
            } else {
              resolve(result);
            }
          }
        );
      });
    });
  };
//  ملاحظات مراحل المشروع
const SELECTTablecompanySubProjectStageNotes = (ProjectID, StageID) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(
        `SELECT * FROM StageNotes WHERE StagHOMID=? AND ProjectID=?`,
        [StageID, ProjectID],
        function (err, result) {
          if (err) {
            reject(err);
            // console.error(err.message);
          } else {
            // console.log(result);
            resolve(result);
          }
        }
      );
    });
  });
};
const SELECTTableStageNotesAllproject = (ProjectID) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(
        `SELECT countdayDelay,Type,Note,DateNote FROM StageNotes WHERE  ProjectID=?`,
        [ProjectID],
        function (err, result) {
          if (err) {
            reject(err);
            // console.error(err.message);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
const SELECTTablecompanySubProjectStageNotesOneObject = (
  data,
  type = "sn.StagHOMID=? AND sn.ProjectID=?"
) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        `SELECT cu.StageName,pr.Nameproject,sn.StageNoteID,sn.StagHOMID,sn.ProjectID,sn.Type,sn.Note,sn.DateNote,sn.RecordedBy,sn.UpdatedDate,sn.countdayDelay,sn.ImageAttachment,pr.IDcompanySub, MAX(sn.StageNoteID) AS last_id ,RE.NumberCompany FROM StageNotes sn LEFT JOIN companySubprojects pr ON pr.id = sn.ProjectID  LEFT JOIN StagesCUST cu ON cu.StageID = sn.StagHOMID AND cu.ProjectID = sn.ProjectID  LEFT JOIN companySub RE ON RE.id = pr.IDcompanySub WHERE ${type}`,
        data,
        function (err, result) {
          if (err) {
            reject(err);
            // console.error(err.message);
          } else {
            // console.log(result);
            resolve(result);
          }
        }
      );
    });
  });
};

//  المراحل الفرعية للمراحل الرئيسية في المشروع
const SELECTTablecompanySubProjectStagesSub = (
  ProjectID,
  StageID,
  kind = "all",
  type = "su.StagHOMID=? AND su.ProjectID=?",
  where = ""
) => {
  return new Promise((resolve, reject) => {
    let stringSql =
      kind === "all"
        ? `SELECT * FROM StagesSub WHERE StagHOMID=? AND ProjectID=? ${where}`
        : kind === "accomplished"
        ? `SELECT closingoperations FROM StagesSub WHERE Done="true" AND ProjectID=?`
        : kind === "notification"
        ? `SELECT cu.StageName,pr.Nameproject ,pr.IDcompanySub,su.ProjectID,su.StagHOMID AS StageID, MAX(su.StageSubID) AS StageSubID ,su.StagHOMID,su.ProjectID,su.StageSubName, su.closingoperations,su.Note,su.Done,su.CloseDate FROM StagesSub su LEFT JOIN StagesCUST cu ON cu.ProjectID = su.ProjectID AND cu.StageID = su.StagHOMID LEFT JOIN companySubprojects pr ON pr.id = su.ProjectID  WHERE  ${type}`
        : `SELECT * FROM StagesSub WHERE StagHOMID=? AND ProjectID=? AND trim(StageSubName) = trim(?)`;
    let data =
      kind === "all"
        ? [StageID, ProjectID]
        : kind === "notification" &&
          type !== "su.StagHOMID=? AND su.ProjectID=?"
        ? [ProjectID]
        : kind === "notification" &&
          type === "su.StagHOMID=? AND su.ProjectID=?"
        ? [StageID, ProjectID]
        : kind === "accomplished"
        ? [ProjectID]
        : [StageID, ProjectID, kind];
    db.serialize(function () {
      db.all(stringSql, data, function (err, result) {
        if (err) {
          reject(err);
          console.log(err.message);
          resolve([]);
        } else {
          // console.log(result);
          resolve(result);
        }
      });
    });
  });
};

//  جلب احد المراحل الفرعية
const SELECTTablecompanySubProjectStagesSubSingl = (StageSubID) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        `SELECT StagHOMID,ProjectID, closingoperations,Note,Done,CloseDate FROM StagesSub WHERE StageSubID=?`,
        [StageSubID],
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

//  الملاحظات للمراحل الفرعية للمراحل الرئيسية في المشروع
const SELECTTablecompanySubProjectStageSubNotes = (
  ProjectID,
  StageID,
  StagSubHOMID
) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(
        `SELECT * FROM StageSubNotes WHERE StagSubHOMID=? AND StagHOMID=? AND ProjectID=?`,
        [StagSubHOMID, StageID, ProjectID],
        function (err, result) {
          if (err) {
            reject(err);
            // console.error(err.message);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};

// SELECT
//   COALESCE(json_group_array(DISTINCT json_object(
//     'Nameproject',    cs.Nameproject,
//     'Type',           rs.Type,
//     'Data',           rs.Data,
//     'Date',           rs.Date,
//     'Done',           rs.Done,
//     'InsertBy',       u1.userName,
//     'Implementedby',  u2.userName,
//     'checkorderout',  rs.checkorderout,
//     'DateTime',       rs.DateTime
//   )), '[]')                         AS items,
//   COUNT(*)                                                               AS total,
//   SUM(CASE WHEN lower(COALESCE(rs.Done,'false')) = 'false' THEN 1 ELSE 0 END) AS open_count,
//   SUM(CASE WHEN lower(COALESCE(rs.Done,'false')) = 'true'
//             AND lower(COALESCE(rs.checkorderout,'false')) = 'false' THEN 1 ELSE 0 END) AS closed_count,
//   SUM(CASE WHEN lower(COALESCE(rs.checkorderout,'false')) = 'true' THEN 1 ELSE 0 END)   AS confirmed_count
// FROM Requests rs
// JOIN companySubprojects cs ON cs.id = rs.ProjectID
// LEFT JOIN usersCompany u1 ON trim(u1.PhoneNumber) = trim(rs.InsertBy)
// LEFT JOIN usersCompany u2 ON trim(u2.PhoneNumber) = trim(rs.Implementedby)
// WHERE cs.IDcompanySub = 1;

const SelectOrdertabletotalreport = (type = "IDcompanySub") => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        `SELECT
  COUNT(*) AS total,
  SUM(CASE WHEN lower(COALESCE(rs.Done,'false')) = 'false' THEN 1 ELSE 0 END) AS open_count,
  SUM(CASE WHEN lower(COALESCE(rs.Done,'false')) = 'true'
  AND lower(COALESCE(rs.checkorderout,'false')) = 'false' THEN 1 ELSE 0 END) AS closed_count,
  SUM(CASE WHEN lower(COALESCE(rs.checkorderout,'false')) = 'true' THEN 1 ELSE 0 END)   AS confirmed_count
  FROM Requests rs
  LEFT JOIN usersCompany u1 ON trim(u1.PhoneNumber) = trim(rs.InsertBy)
  JOIN companySubprojects cs ON cs.id = rs.ProjectID
  WHERE ${type} ;
`,
        function (err, result) {
          if (err) {
            reject(err);
            // console.error(err.message);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
const SelectdetailsOrders = (type = "IDcompanySub") => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(
        `
SELECT
  cs.id           AS project_id,
  cs.Nameproject  AS project_name,
  cb.NameSub,

  -- العناصر الخاصة بهذا المشروع فقط
  COALESCE(
    json_group_array(DISTINCT json_object(
      'Type',          rs.Type,
      'Data',          rs.Data,
      'Date',          rs.Date,
      'Done',          rs.Done,
      'InsertBy',      u1.userName,
      'Implementedby', u2.userName,
      'checkorderout', rs.checkorderout,
      'DateTime',      rs.DateTime
    )),
    '[]'
  ) AS items,

  COUNT(*) AS total,
  SUM(CASE WHEN lower(COALESCE(rs.Done,'false')) = 'false' THEN 1 ELSE 0 END) AS open_count,
  SUM(CASE WHEN lower(COALESCE(rs.Done,'false')) = 'true'
            AND lower(COALESCE(rs.checkorderout,'false')) = 'false' THEN 1 ELSE 0 END) AS closed_count,
  SUM(CASE WHEN lower(COALESCE(rs.checkorderout,'false')) = 'true' THEN 1 ELSE 0 END) AS confirmed_count

FROM Requests rs
JOIN companySubprojects cs ON cs.id = rs.ProjectID
JOIN companySub cb ON cb.id = cs.IDcompanySub
LEFT JOIN usersCompany u1 ON trim(u1.PhoneNumber) = trim(rs.InsertBy)
LEFT JOIN usersCompany u2 ON trim(u2.PhoneNumber) = trim(rs.Implementedby)
WHERE ${type}
GROUP BY  cs.id, cs.Nameproject, rs.Type
ORDER BY cs.Nameproject, rs.Type ;
`,

        function (err, result) {
          if (err) {
            reject(err);
            // console.error(err.message);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
//  المصروفات
const SELECTTablecompanySubProjectexpense = (
  idproject,
  type = "all",
  lastID = 0
) => {
  return new Promise((resolve, reject) => {
    let plus = parseInt(lastID) === 0 ? ">" : "<";

    let stringSql =
      type === "all"
        ? "SELECT * FROM Expense WHERE projectID=?  AND InvoiceNo " +
          plus +
          " '" +
          parseInt(lastID) +
          "' ORDER BY InvoiceNo DESC LIMIT 10"
        : type === "pdf"
        ? "SELECT * FROM Expense WHERE projectID=? "
        : `SELECT InvoiceNo FROM Expense WHERE projectID=?`;
    db.serialize(function () {
      db.all(stringSql, [idproject], function (err, result) {
        if (!err) {
          resolve(result);
        }
      });
    });
  });
};
//  للارشيف طلب كائن واحد من المصروفات
const SELECTTablecompanySubProjectexpenseObjectOneforArchif = (
  InvoiceNo,
  projectID,
  type = "all"
) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        type === "all"
          ? `SELECT * FROM Expense WHERE InvoiceNo=? AND projectID=?`
          : `SELECT PR.Nameproject,  MAX(Expenseid) AS Expenseid , projectID ,InvoiceNo,Amount,Date,Data,ClassificationName,Image,Taxable,CreatedDate FROM Expense ex 
          LEFT JOIN companySubprojects PR ON PR.id = ex.projectID 
          LEFT JOIN companySub RE ON RE.id = PR.IDcompanySub
          WHERE InvoiceNo=? AND projectID=?`,
        [InvoiceNo, projectID],
        function (err, result) {
          if (err) {
            reject(err);
            // console.error(err.message);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
const SELECTTablecompanySubProjectfornotification = (
  projectID,
  type = "Expense"
) => {
  return new Promise((resolve, reject) => {
    let project = type === "RequestsID" ? "ProjectID" : "projectID";
    let projecttype = type === "Requests" ? " ex.projectID" : " ex.ProjectID";

    let SqlString =
      type === "Expense"
        ? ` max(Expenseid) AS Expenseid , projectID,InvoiceNo,Amount, Date,Data,Taxable,CreatedDate FROM Expense`
        : type === "Returns"
        ? ` max(ReturnsId) AS ReturnsId , projectID,Amount,Date,Data,Image FROM Returns`
        : type === "Revenue"
        ? ` max(RevenueId) AS RevenueId, projectID,Amount,Date,Data,Bank,Image FROM Revenue`
        : `max(RequestsID) AS RequestsID, ProjectID AS projectID,Type,Data,Date,InsertBy,Implementedby,Image FROM Requests`;
    db.serialize(function () {
      db.get(
        `SELECT PR.Nameproject,PR.IDcompanySub,RE.NumberCompany,${SqlString} ex 
          LEFT JOIN companySubprojects PR ON PR.id = ${projecttype} 
          LEFT JOIN companySub RE ON RE.id = PR.IDcompanySub
          WHERE  ${project}=?`,
        [projectID],
        function (err, result) {
          if (err) {
            reject(err);
            // console.error(err.message);
          } else {
            // console.log(result, "hello");
            resolve(result);
          }
        }
      );
    });
  });
};

const SELECTTablecompanySubProjectfornotificationEdit = (
  id,
  type = "Expense",
  kind = "Expenseid"
) => {
  return new Promise((resolve, reject) => {
    let project = type === "Requests" ? " ex.projectID" : " ex.ProjectID";
    let SqlString =
      type === "Expense"
        ? `  Expenseid ,projectID,InvoiceNo,Amount, Date,Data,Taxable,CreatedDate FROM Expense`
        : type === "Returns"
        ? ` ReturnsId , projectID,Amount,Date,Data,Image FROM Returns`
        : type === "Revenue"
        ? `RevenueId, projectID,Amount,Date,Data,Bank,Image FROM Revenue`
        : `RequestsID, ProjectID AS projectID,Type,Data,Date,InsertBy,Implementedby,Image FROM Requests`;
    db.serialize(function () {
      db.get(
        `SELECT PR.Nameproject,PR.IDcompanySub,RE.NumberCompany,${SqlString} ex 
          LEFT JOIN companySubprojects PR ON PR.id = ${project}
          LEFT JOIN companySub RE ON RE.id = PR.IDcompanySub
          WHERE ${kind}=?`,
        [id],
        function (err, result) {
          if (err) {
            reject(err);
            // console.error(err.message);
          } else {
            // console.log(result, "hello");
            resolve(result);
          }
        }
      );
    });
  });
};

//  طلب كائن واحد من المصروفات
const SELECTTablecompanySubProjectexpenseObjectOne = (
  ID,
  kind = "all",
  type = "projectID"
) => {
  return new Promise((resolve, reject) => {
    let stringSql =
      kind === "all"
        ? `SELECT * FROM Expense WHERE Expenseid=?`
        : `SELECT MAX(Expenseid), InvoiceNo FROM Expense WHERE ${type}=?`;
    db.serialize(function () {
      db.get(stringSql, [ID], function (err, result) {
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

// العهد
const SELECTTablecompanySubProjectREVENUE = (
  idproject,
  lastID = 0,
  types = "all"
) => {
  return new Promise((resolve, reject) => {
    let plus = parseInt(lastID) === 0 ? ">" : "<";
    db.serialize(function () {
      db.all(
        types === "pdf"
          ? "SELECT * FROM Revenue WHERE projectID=? "
          : "SELECT * FROM Revenue WHERE projectID=?  AND RevenueId " +
              plus +
              " '" +
              parseInt(lastID) +
              "' ORDER BY RevenueId DESC LIMIT 10",
        [idproject],
        function (err, result) {
          if (err) {
            reject(err);
            // console.error(err.message);
          } else {
            // console.log(result);
            resolve(result);
          }
        }
      );
    });
  });
};
const SELECTTablecompanySubProjectREVENUEObjectOne = (RevenueId) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        `SELECT * FROM Revenue  WHERE RevenueId=?`,
        [RevenueId],
        function (err, result) {
          if (err) {
            reject(err);
            // console.error(err.message);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};

// المرتجعات
const SELECTTablecompanySubProjectReturned = (
  idproject,
  lastID = 0,
  types = "all"
) => {
  return new Promise((resolve, reject) => {
    let plus = parseInt(lastID) === 0 ? ">" : "<";

    db.serialize(function () {
      db.all(
        types === "pdf"
          ? "SELECT * FROM Returns WHERE projectID=? "
          : "SELECT * FROM Returns WHERE projectID=?  AND ReturnsId " +
              plus +
              " '" +
              parseInt(lastID) +
              "' ORDER BY ReturnsId DESC LIMIT 10",
        [idproject],
        function (err, result) {
          if (err) {
            reject(err);
            // console.error(err.message);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
const SELECTTablecompanySubProjectReturnedObjectOne = (idproject) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        `SELECT * FROM Returns WHERE ReturnsId=?`,
        [idproject],
        function (err, result) {
          if (err) {
            reject(err);
            // console.error(err.message);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
const SELECTTableFinance = (id, type = "Returns", typeid = "ReturnsId") => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        `SELECT * FROM ${type} WHERE ${typeid}=?`,
        [id],
        function (err, result) {
          if (err) {
            reject(err);
            // console.error(err.message);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
const SELECTTableFinanceapi = (
  type = "Returns",
  id,
  NumberCompany,
  IDcompanySub,
  Referencenumber
) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        `SELECT * FROM ${type}  fi  LEFT JOIN companySubprojects pr ON pr.id = fi.projectID   LEFT JOIN companySub RE ON RE.id = pr.IDcompanySub  WHERE fi.Referencenumberfinanc=? AND RE.NumberCompany=? AND PR.IDcompanySub=?  AND PR.Referencenumber=?
    `,
        [id, NumberCompany, IDcompanySub, Referencenumber],
        function (err, result) {
          if (err) {
            resolve({});
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
// معرفة بيانات عن اخر عملية حفظ كشف pdf
const SELECTTableSavepdf = (idproject) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        `SELECT * FROM Savepdf WHERE projectID=?`,
        [idproject],
        function (err, result) {
          if (err) {
            reject(err);
            console.log(err.message);
            resolve(0);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};

// عملية فلتر البحث في المالية
const SELECTSEARCHINFINANCE = (
  type,
  projectID,
  from,
  to,
  fromtime,
  totime,
  count
) => {
  // console.log(type, projectID, from, to, fromtime, totime);
  // console.log(type);
  return new Promise((resolve, reject) => {
    let plus = parseInt(count) === 0 ? ">" : "<";
    let idtype =
      type === "Returns"
        ? "ReturnsId"
        : type === "Expense"
        ? "Expenseid"
        : "RevenueId";

    db.serialize(() => {
      db.all(
        `SELECT * FROM ${type} WHERE projectID = ? AND Amount BETWEEN ? AND ? AND Date BETWEEN ? AND ?  AND  ${idtype} ${plus} ? ORDER BY Date DESC lIMIT 10`,
        [projectID, from, to, fromtime, totime, count],
        (err, rows) => {
          if (err) {
            // console.error("Database query error:", err.message);
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  });
};

// الارشيف
const SELECTTablecompanySubProjectarchives = (idproject) => {
  // console.log(idproject);
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(
        `SELECT ArchivesID,ProjectID,FolderName,Date,ActivationHome,Activationchildren FROM Archives WHERE ProjectID=?`,
        [idproject],
        function (err, result) {
          if (err) {
            reject(err);
            // console.error(err.message);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
const SELECTTablearchivesNamefolder = (FolderName, idproject) => {
  // console.log(idproject);
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        `SELECT ArchivesID,children FROM Archives WHERE trim(FolderName) = trim(?) AND ProjectID=?`,
        [FolderName, idproject],
        function (err, result) {
          if (err) {
            // reject(err);
            // console.error(err.message);
            resolve(false);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};

//  الارشيف الجلب حسب معرف الجدول
const SELECTTablecompanySubProjectarchivesotherroad = async (ArchivesID) => {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      db.get(
        `SELECT children,FolderName FROM Archives WHERE ArchivesID=?`,
        [ArchivesID],
        function (err, rows) {
          if (err) {
            reject(err);
            // console.error(err.message);
          } else {
            resolve(rows);
          }
          // client.sAdd("Archives", JSON.stringify(rows));
        }
      );
    });
  });
};
// SELECT * FROM Requests WHERE  ProjectID=? AND Type LIKE "%خفيفة%"

//  جلب بيانات الطلبيات
const SELECTallDatafromTableRequests = async (Type, ProjectID) => {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      db.all(
        "SELECT * FROM Requests WHERE  ProjectID=? AND Type LIKE '%" +
          Type +
          "%' ",
        [ProjectID],
        function (err, rows) {
          if (err) {
            reject(err);
            console.log(err.message);
            resolve([]);
          } else {
            resolve(rows);
          }
          // client.sAdd("Archives", JSON.stringify(rows));
        }
      );
    });
  });
};
const SELECTDataAndTaketDonefromTableRequests = async (
  RequestsID,
  type = "all"
) => {
  // console.log(type, "hhhhhhhhhhh");
  return new Promise((resolve, reject) => {
    let sqlString =
      type === "all"
        ? `SELECT * FROM Requests WHERE  RequestsID=?`
        : type === "allCount"
        ? `SELECT COUNT(Done) FROM Requests WHERE ProjectID=?`
        : `SELECT COUNT(Done) FROM Requests WHERE Done=? AND  ProjectID=?`;
    let data =
      type === "all" || type === "allCount" ? [RequestsID] : [type, RequestsID];
    db.serialize(async () => {
      db.get(sqlString, data, function (err, rows) {
        // console.log(RequestsID);

        if (err) {
          reject(err);
          console.log(err.message);
          resolve([]);
        } else {
          resolve(rows);
        }
        // client.sAdd("Archives", JSON.stringify(rows));
      });
    });
  });
};
const SELECTallDatafromTableRequestsV2 = async (
  Type,
  ProjectID,
  type = "part",
  Done,
  lastID,
  whereAdd
) => {
  return new Promise((resolve, reject) => {
    let plus = parseInt(lastID) === 0 ? ">" : "<";
    db.serialize(async () => {
      let add = `(SELECT us.userName FROM usersCompany us WHERE us.PhoneNumber =re.InsertBy) AS InsertBy ,(SELECT us.userName FROM usersCompany us WHERE us.PhoneNumber =re.Implementedby) AS Implementedby`;

      db.all(
        type === "part"
          ? `SELECT re.* ,${add}, CASE
        WHEN re.Image IS NOT NULL THEN json_extract(re.Image, '$') 
        ELSE NULL
    END AS Image FROM Requests re WHERE  re.ProjectID=? AND re.Type LIKE '%${Type}%'  AND re.Done='${Done}' AND re.RequestsID 
              ${plus} 
              ${parseInt(lastID)} 
            ORDER BY re.RequestsID DESC,datetime(re.Date) DESC LIMIT 10`
          : `SELECT 
    re.*, PR.Nameproject,    ${add},
    CASE
        WHEN re.Image IS NOT NULL THEN json_extract(re.Image, '$') 
        ELSE NULL
    END AS Image
FROM Requests re
LEFT JOIN companySubprojects PR ON PR.id = re.ProjectID
WHERE PR.IDcompanySub = ?
  AND re.Type LIKE '%${Type}%'
  AND re.Done = '${Done}'
  AND re.RequestsID ${plus}  ${parseInt(lastID)} 
    ${whereAdd}
ORDER BY re.RequestsID DESC, datetime(re.Date) DESC 
LIMIT 10`,
        [ProjectID],
        function (err, rows) {
          if (err) {
            reject(err);
            console.log(err.message);
            resolve([]);
          } else {
            resolve(rows);
          }
          // client.sAdd("Archives", JSON.stringify(rows));
        }
      );
    });
  });
};

const SELECTDataAndTaketDonefromTableRequests2 = async (
  RequestsID,
  type = "part",
  Done,
  whereAdd
) => {
  return new Promise((resolve, reject) => {
    let sqlString =
      type === "part"
        ? `SELECT COUNT(Done) FROM Requests WHERE Done=? AND  ProjectID=?`
        : `SELECT COUNT(Done) FROM Requests re LEFT JOIN companySubprojects PR ON PR.id = re.ProjectID WHERE  ${whereAdd} Done=? AND PR.IDcompanySub=? `;
    let data = [Done, RequestsID];
    db.serialize(async () => {
      db.get(sqlString, data, function (err, rows) {
        // console.log(RequestsID);
        if (err) {
          reject(err);
          console.log(err.message);
          resolve([]);
        } else {
          resolve(rows);
        }
        // client.sAdd("Archives", JSON.stringify(rows));
      });
    });
  });
};

// const SELECTDataAndTaketDonefromTableRequests2 = async (
//   RequestsID,
//   type = "all",
//   Done,

// ) => {
//   // console.log(type, "hhhhhhhhhhh");
//   return new Promise((resolve, reject) => {

//     let sqlString = type === "all"
//     ? `SELECT * FROM Requests WHERE  RequestsID=?`
//     : type === "allCount"
//     ? `SELECT COUNT(Done) FROM Requests WHERE ProjectID=?`
//     :type === 'partCount'? `SELECT COUNT(Done) FROM Requests WHERE Done=? AND  ProjectID=?`:`SELECT COUNT(Done) FROM Requests re LEFT JOIN companySubprojects PR ON PR.id = re.ProjectID WHERE Done=? AND PR.IDcompanySub=? ` ;
//     let data =
//     type === "all" || type === "allCount" ? [RequestsID] : [Done, RequestsID];
//     db.serialize(async () => {
//       db.get(sqlString, data, function (err, rows) {
//         if (err) {
//           reject(err);
//           console.log(err.message);
//           resolve([]);
//         } else {
//           resolve(rows);
//         }
//         // client.sAdd("Archives", JSON.stringify(rows));
//       });
//     });
//   });
// };

// let array = [16,55,56,60,56,54]
// const where = array.reduce((item,r) => `${String(item) + " AND "+ r}`);
// console.log(where);

//  جلب المنشورات للصفحة العامة
const SELECTTablePostPublic = (id, Date, PostID, where = "") => {
  return new Promise((resolve, reject) => {
    let plus = parseInt(PostID) === 0 ? ">" : "<";
    db.serialize(function () {
      db.all(
        `SELECT * FROM (SELECT PostID,postBy,Date,timeminet,url,Type,Data,StageID,NameCompany,NameSub,Nameproject
          ,cs.StageName FROM Post ca
          LEFT JOIN company EX ON EX.id = ca.CommpanyID
          LEFT JOIN companySub RE ON RE.id = ca.brunshCommpanyID
          LEFT JOIN companySubprojects PR ON PR.id = ca.ProjectID
          LEFT JOIN StagesCUST cs ON cs.ProjectID = ca.ProjectID

          WHERE ca.CommpanyID = ?
          AND Date(ca.Date)=? AND (ca.PostID) ${plus} ? ${where}
          ORDER BY ca.PostID ASC  ) AS subquery ORDER BY PostID DESC,datetime(Date) DESC LIMIT 10`,

        [id, Date, PostID],
        function (err, result) {
          if (err) {
            reject(err);
            // console.error(err.message);
          } else {
            // console.log(result);
            resolve(result);
          }
        }
      );
    });
  });
};

// جلب كائن واحد من المنشورات
const SELECTTablePostPublicOneObject = (PostID) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        `SELECT ca.PostID, ca.postBy, ca.Date, ca.timeminet, ca.url, ca.Type, ca.Data, ca.StageID, cs.StageName,
                  EX.NameCompany, RE.NameSub, PR.Nameproject
          FROM Post ca
          LEFT JOIN company EX ON EX.id = ca.CommpanyID
          LEFT JOIN companySub RE ON RE.id = ca.brunshCommpanyID
          LEFT JOIN companySubprojects PR ON PR.id = ca.ProjectID
          LEFT JOIN StagesCUST cs ON cs.ProjectID = ca.ProjectID AND cs.StageID = ca.StageID
          WHERE (ca.PostID) = ?`,
        [PostID],
        function (err, result) {
          if (err) {
            reject(err);
            console.log(err.message);
          } else {
            // console.log(result);
            resolve(result);
          }
        }
      );
    });
  });
};
const SELECTTablePostPublicSearch = (
  id,
  DateStart,
  DateEnd,
  type,
  nameProject,
  userName,
  branch,
  PostID,
  userJob = "موظف",
  user,
  PhoneNumber
) => {
  return new Promise((resolve, reject) => {
    const isAdminOrBranchManager = userJob === "موظف";

    let SearchSub =
      type === "بحسب المشروع والتاريخ"
        ? "PR.Nameproject"
        : type === "بحسب الفرع"
        ? "RE.NameSub"
        : "ca.postBy";
    let plus = parseInt(PostID) === 0 ? ">" : "<";
    let SqlStringOne =
      type === "بحسب المشروع والمستخدم والتاريخ"
        ? `AND  PR.Nameproject LIKE ?  AND ca.postBy LIKE ? AND (ca.PostID) ${plus} ?`
        : type === "بحسب التاريخ"
        ? `AND (ca.PostID) ${plus} ? `
        : `AND ${SearchSub} LIKE ?  AND (ca.PostID) ${plus} ?`;
    let data =
      type === "بحسب التاريخ"
        ? [id, DateStart, DateEnd, PostID]
        : type === "بحسب المشروع والمستخدم والتاريخ"
        ? [id, DateStart, DateEnd, `%${nameProject}%`, `%${userName}%`, PostID]
        : type === "بحسب المشروع والتاريخ"
        ? [id, DateStart, DateEnd, `%${nameProject}%`, PostID]
        : type === "بحسب الفرع"
        ? [id, DateStart, DateEnd, `%${branch}%`, PostID]
        : [id, DateStart, DateEnd, `%${userName}%`, PostID];
    let query = `SELECT * FROM (SELECT ca.PostID, ca.postBy, ca.Date, ca.timeminet, ca.url, ca.Type, ca.Data, ca.StageID, cs.StageName,
        EX.NameCompany, RE.NameSub, PR.Nameproject,
        (SELECT COUNT(userName) FROM Comment WHERE PostId = ca.PostID) AS Comment,
        (SELECT COUNT(userName) FROM Likes WHERE PostId = ca.PostID) AS Likes,
        (SELECT COUNT(userName) FROM Likes WHERE PostId = ca.PostID AND userName = '${user}') AS Likeuser

        FROM Post ca
        LEFT JOIN company EX ON EX.id = ca.CommpanyID
        LEFT JOIN companySub RE ON RE.id = ca.brunshCommpanyID
        LEFT JOIN companySubprojects PR ON PR.id = ca.ProjectID
        LEFT JOIN StagesCUST cs ON cs.ProjectID = ca.ProjectID AND cs.StageID = ca.StageID`;

    if (!isAdminOrBranchManager) {
      query += `
    LEFT JOIN usersCompany us ON us.PhoneNumber = ${PhoneNumber}
    INNER JOIN usersProject up ON up.ProjectID = ca.ProjectID  AND us.id = up.user_id
  `;
    }

    query += `
        WHERE ca.CommpanyID = ?
        AND Date(Date) BETWEEN ? AND ?  ${SqlStringOne} 
        ORDER BY ca.PostID ASC) AS subquery ORDER BY PostID DESC,datetime(Date) DESC LIMIT 10`;
    db.serialize(function () {
      db.all(query, data, function (err, result) {
        if (err) {
          reject(err);
          // console.error(err.message);
        } else {
          // console.log(result);
          resolve(result);
        }
      });
    });
  });
};
//  جلب معرف الفرع ومعرف الشركة
const SELECTTableIDcompanytoPost = (
  projectID,
  type = "pr.id",
  select = "pr.id"
) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        `SELECT su.NumberCompany,pr.IDcompanySub,${select} FROM companySubprojects pr INNER JOIN  companySub su ON su.id = pr.IDcompanySub WHERE ${type} =? `,
        [projectID],
        function (err, result) {
          if (err) {
            reject(err);
            // console.error(err.message);
          } else {
            resolve(result);
            // console.log(result, "hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh");
          }
        }
      );
    });
  });
};

const SELECTCOUNTCOMMENTANDLIKPOST = (PostID, type = "Comment") => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        `SELECT COUNT(userName) FROM ${type} WHERE PostId =?`,
        [PostID],
        function (err, result) {
          if (err) {
            reject(err);
            console.log(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};

const SELECTDataPrivatPost = (PostID, type = "Comment", idEdit = null) => {
  return new Promise((resolve, reject) => {
    let idString =
      idEdit === null
        ? type === "Likes"
          ? "max(fl.LikesID) AS LikesID"
          : "max(fl.CommentID) AS CommentID"
        : type === "Likes"
        ? "fl.LikesID"
        : "fl.CommentID";

    let Id = idEdit === null ? PostID : idEdit;
    let WhereID = idEdit === null ? "fl.PostId" : "fl.CommentID";
    // console.log(idEdit);

    let SqlString =
      type === "Likes"
        ? `${idString},fl.PostId,fl.Date,fl.userName`
        : `${idString},fl.PostId,fl.commentText,fl.Date,fl.userName`;
    db.serialize(function () {
      db.get(
        `SELECT po.ProjectID ,po.postBy,po.CommpanyID, ${SqlString} FROM ${type} fl  LEFT JOIN Post po ON po.PostID = fl.PostId  WHERE ${WhereID} =?`,
        [Id],
        function (err, result) {
          if (err) {
            reject(err);
            console.log(err);
            resolve({});
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
const SELECTDataPrivatPostonObject = (PostID) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        // `SELECT po.ProjectID ,po.postBy,COUNT(${WhereID}) FROM ${type} fl  LEFT JOIN Post po ON po.PostID = fl.PostId  WHERE po.PostID =?`,
        `SELECT po.ProjectID ,po.postBy,po.CommpanyID,po.StageID,po.url,po.timeminet FROM Post po  WHERE po.PostID =?`,
        [PostID],
        function (err, result) {
          if (err) {
            reject(err);
            console.log(err);
            resolve({});
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};

//  جلب تعليقات المنشورات للصفحة العامة
const SELECTTableCommentPostPublic = (PostId, count) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(
        `SELECT * FROM (SELECT * FROM Comment co  WHERE co.PostId =? AND (co.CommentID) > ? ORDER BY co.CommentID ASC LIMIT 10) AS subquery ORDER BY CommentID ASC, datetime(Date) ASC `,
        [PostId, count],
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

//  جلب معرف التعليق
const SELECTTableCommentID = (PostId) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        `SELECT MAX(CommentID),Date FROM Comment WHERE PostId =? `,
        [PostId],
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

//  جلب الاعجابات المنشورات للصفحة العامة
const SELECTTableLikesPostPublic = (PostId) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(
        `SELECT * FROM Likes WHERE PostId =?`,
        [PostId],
        function (err, result) {
          if (err) {
            reject(err);
            // console.error(err.message);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};

const SELECTTableLikesPostPublicotherroad = (PostId, userName) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        `SELECT * FROM Likes WHERE PostId =? AND userName=?`,
        [PostId, userName],
        function (err, result) {
          if (err) {
            // reject(err);
            // console.log(err.message);
            resolve(false);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
const SELECTTablepostAll = (
  id,
  formattedDate,
  PostID,
  user,
  userJob,
  PhoneNumber
) => {
  return new Promise((resolve, reject) => {
    let plus = parseInt(PostID) === 0 ? ">" : "<";

    // التحقق إذا كان مدير فرع أو admin
    const isAdminOrBranchManager = userJob === "موظف";

    // إعداد الاستعلام حسب نوع المستخدم
    let query = `
  SELECT * FROM (
    SELECT 
      ca.PostID,
      ca.postBy,
      ca.Date,
      ca.timeminet,
      ca.url,
      ca.Type,
      ca.Data,
      ca.StageID,
      cs.StageName,
      EX.NameCompany,
      RE.NameSub,
      PR.Nameproject,
      (SELECT COUNT(userName) FROM Comment WHERE PostId = ca.PostID) AS Comment,
      (SELECT COUNT(userName) FROM Likes WHERE PostId = ca.PostID) AS Likes,
      (SELECT COUNT(userName) FROM Likes WHERE PostId = ca.PostID AND userName = ?) AS Likeuser
    FROM Post ca
    LEFT JOIN company EX ON EX.id = ca.CommpanyID
    LEFT JOIN companySub RE ON RE.id = ca.brunshCommpanyID
    LEFT JOIN companySubprojects PR ON PR.id = ca.ProjectID
    LEFT JOIN StagesCUST cs ON cs.ProjectID = ca.ProjectID AND cs.StageID = ca.StageID
`;

    // إذا لم يكن مدير فرع أو admin، نضيف شرط usersProject
    if (!isAdminOrBranchManager) {
      query += `
    LEFT JOIN usersCompany us ON us.PhoneNumber = ?
    INNER JOIN usersProject up ON up.ProjectID = ca.ProjectID  AND us.id = up.user_id
  `;
    }

    query += `
    WHERE ca.CommpanyID = ?
    AND Date(ca.Date) = ? AND (ca.PostID) ${plus} ? 
    ORDER BY ca.PostID ASC
  ) AS subquery
  ORDER BY PostID DESC, datetime(Date) DESC
  LIMIT 5
`;

    // بناء مصفوفة القيم
    let values = [user];
    if (!isAdminOrBranchManager) values.push(PhoneNumber); // نضيف user_id فقط إذا كان شرط مفعّل
    values.push(id,formattedDate, PostID);
    db.serialize(function () {
      db.all(query, values, function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  });
};
// const SELECTTablepostAll = (id, formattedDate, PostID, user, where = "") => {
//   return new Promise((resolve, reject) => {
//     let plus = parseInt(PostID) === 0 ? ">" : "<";
//     db.serialize(function () {
//       db.all(
//         `SELECT * FROM (SELECT ca.PostID, ca.postBy, ca.Date, ca.timeminet, ca.url, ca.Type, ca.Data, ca.StageID, cs.StageName,
//                   EX.NameCompany, RE.NameSub, PR.Nameproject,
//                   (SELECT COUNT(userName) FROM Comment WHERE PostId = ca.PostID) AS CommentCount,
//                   (SELECT COUNT(userName) FROM Likes WHERE PostId = ca.PostID) AS LikesCount,
//                   (SELECT COUNT(userName) FROM Likes WHERE PostId = ca.PostID AND userName = ?) AS UserLiked

//             FROM Post ca
//            LEFT JOIN company EX ON EX.id = ca.CommpanyID
//            LEFT JOIN companySub RE ON RE.id = ca.brunshCommpanyID
//            LEFT JOIN companySubprojects PR ON PR.id = ca.ProjectID
//           LEFT JOIN StagesCUST cs ON cs.ProjectID = ca.ProjectID AND cs.StageID = ca.StageID
//            WHERE ca.CommpanyID = ?
//            AND Date(ca.Date) = ? AND (ca.PostID) ${plus} ? ${where}
//            ORDER BY ca.PostID ASC) AS subquery
//            ORDER BY PostID DESC, datetime(Date) DESC LIMIT 5`,
//         [user, id, formattedDate, PostID],
//         function (err, result) {
//           if (err) {
//             reject(err);
//           } else {
//             resolve(result);
//           }
//         }
//       );
//     });
//   });
// };
//

//  جلب بيانات الشات
const SELECTTableChateStage = (chatID, StageID) => {
  return new Promise((resolve, reject) => {
    const stringSql = Number(StageID)
      ? `SELECT * FROM ChatSTAGE WHERE  chatID=?`
      : `SELECT * FROM Chat WHERE  chatID=?`;

    db.serialize(function () {
      db.get(stringSql, [chatID], function (err, result) {
        if (err) {
          reject(err);
          // console.error(err.message);
        } else {
          resolve(result);
        }
      });
    });
  });
};
// معرفة طول الجدول
const SELECTLengthTableChateStage = (ProjectID, StageID) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        // 'SELECT COUNT(*) FROM PRAGMA table_info(ChatSTAGE) WHERE ProjectID=? AND StageID =?',
        "SELECT COUNT(*) FROM ChatSTAGE WHERE ProjectID=? AND StageID =?",
        [ProjectID, StageID],
        function (err, result) {
          if (err) {
            reject(err);
            // console.error(err.message);
          } else {
            resolve(result["COUNT(*)"]);
          }
        }
      );
    });
  });
};
// جلب اخر بيانات في الشات
const SELECTLastTableChateStage = (
  ProjectID,
  StageID,
  count = 1,
  kind = "all",
  type = "ChatSTAGE"
) => {
  let Type = type === "ChatSTAGE" ? "StageID" : "Type";
  return new Promise((resolve, reject) => {
    let stringSql =
      kind === "all"
        ? `SELECT * FROM ChatSTAGE  WHERE ProjectID=? AND StageID =? ORDER BY rowid DESC, datetime(timeminet) ASC LIMIT ${count} `
        : `SELECT File,Date FROM ${type}  WHERE ProjectID=? AND  ${Type}=? `;

    db.serialize(function () {
      db.all(stringSql, [ProjectID, StageID], function (err, result) {
        if (err) {
          reject(err);
          // console.error(err.message);
        } else {
          resolve(result.reverse());
          // console.log(result)
        }
      });
    });
  });
};
// جلب chatiD
const SELECTLastTableChateID = (ProjectID, type, userName) => {
  return new Promise((resolve, reject) => {
    const stringSql = Number(type)
      ? `SELECT chatID FROM ChatSTAGE  WHERE ProjectID=? AND StageID =? AND trim(Sender) !=trim(?) `
      : `SELECT chatID FROM Chat  WHERE ProjectID=? AND Type =? AND trim(Sender) !=trim(?) `;
    db.serialize(function () {
      db.all(stringSql, [ProjectID, type, userName], function (err, result) {
        if (err) {
          reject(err);
          // console.error(err.message);
        } else {
          resolve(result);
          // console.log(result)
        }
      });
    });
  });
};

//  الاستعلام على اسم الشخص ومعرف الرسالة
const SELECTTableViewChateUser = (chatID, userName, type) => {
  return new Promise((resolve, reject) => {
    const stringSql = Number(type)
      ? `SELECT * FROM ViewsCHATSTAGE WHERE chatID=? AND trim(userName)=trim(?)`
      : `SELECT * FROM Views WHERE chatID=? AND trim(userName)=trim(?)`;
    db.serialize(function () {
      db.all(stringSql, [chatID, userName], function (err, result) {
        if (err) {
          resolve([]);
          console.log(err.message);
        } else {
          resolve(result);
        }
      });
    });
  });
};
const SELECTLastTableChateStageDontEmpty = (ProjectID, StageID, id) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(
        `SELECT * FROM ChatSTAGE  WHERE ProjectID=? AND StageID =? AND  chatID > ? `,
        [ProjectID, StageID, id],
        function (err, result) {
          if (err) {
            reject(err);
            // console.error(err.message);
          } else {
            resolve(result.reverse());
            // console.log(result)
          }
        }
      );
    });
  });
};
const SELECTLastTableChateTypeDontEmpty = (ProjectID, StageID, id) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(
        `SELECT * FROM Chat  WHERE ProjectID=? AND Type =? AND  chatID > ? `,
        [ProjectID, StageID, id],
        function (err, result) {
          if (err) {
            reject(err);
            // console.error(err.message);
          } else {
            resolve(result.reverse());
            // console.log(result)
          }
        }
      );
    });
  });
};

const SELECTTableChateStageOtherroad = (
  idSendr,
  userName = "",
  type = "trim(idSendr)=trim(?)",
  table = "ChatSTAGE"
) => {
  return new Promise((resolve, reject) => {
    let data =
      type === "trim(idSendr)=trim(?)" ? [idSendr] : [idSendr, userName];
    db.serialize(function () {
      db.get(
        `SELECT * FROM ${table} WHERE ${type}`,
        data,
        function (err, result) {
          if (err) {
            console.log(err.message);
            resolve(false);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};

//  معرفة اخر رسائل المستخدم في الدردشة
// معرفة اخر رسائل المستخدم في الدردشة
const SELECTLastmassgeuserinchat = (
  ProjectID,
  StageID,
  userName,
  type = "ChatSTAGE"
) => {
  return new Promise((resolve, reject) => {
    let kind = type === "ChatSTAGE" ? "StageID" : "Type";
    let whereSql = "";
    let params = [];
    const room = roomKey(ProjectID, StageID);
    // 1. استخدام المعاملات ? بدلاً من دمج النصوص
    if (type === 'Chat_private') {
      whereSql = "conversationId = ?";
      params = [room];
    } else {
      whereSql = `ProjectID = ? AND ${kind} = ?`;
      params = [ProjectID, StageID];
    }

    // إضافة Sender للمتغيرات
    // ملاحظة: الشرط DATE != CURRENT_DATE تم تركه كما هو
    params.push(userName);

    db.serialize(function () {
      db.get(
        `SELECT MAX(chatID) AS last_id FROM ${type} WHERE ${whereSql} AND Sender = ? AND DATE != CURRENT_DATE`,
        params,
        function (err, result) {
          if (err) {
            // يفضل تسجيل الخطأ للتبع
            // console.log(err.message);
            resolve(null);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
//  جلب مشاهدات رسائل الشات
const SELECTTableViewChateStage = (chatID) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(
        `SELECT * FROM ViewsCHATSTAGE WHERE chatID=?`,
        [chatID],
        function (err, result) {
          if (err) {
            reject(err);
            // console.error(err.message);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
//  جلب بيانات الشات

const SELECTLengthTableChate = (ProjectID, Type) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        // 'SELECT COUNT(*) FROM PRAGMA table_info(ChatSTAGE) WHERE ProjectID=? AND Type =?',
        "SELECT COUNT(*) FROM Chat WHERE ProjectID=? AND Type =?",
        [ProjectID, Type],
        function (err, result) {
          if (err) {
            reject(err);
            // console.error(err.message);
          } else {
            resolve(result["COUNT(*)"]);
          }
        }
      );
    });
  });
};
const SELECTTableChate = (ProjectID, Type) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(
        `SELECT * FROM Chat WHERE ProjectID=? AND Type=?`,
        [ProjectID, Type],
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
const SELECTTableChateotherroad = (idSendr) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        `SELECT * FROM Chat WHERE idSendr=?`,
        [idSendr],
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
const SELECTLastTableChate = (ProjectID, Type, count = 80, kind = "Chat") => {
  return new Promise((resolve, reject) => {

    const limit = Number(count) || 1;

    const sql =
      kind === "Chat"
        ? `SELECT * FROM Chat WHERE ProjectID = ? AND Type = ? ORDER BY rowid DESC LIMIT ?`
        : `SELECT * FROM Chat_private WHERE trim(conversationId) = trim(?) ORDER BY rowid DESC LIMIT ?`;

    const params =
      kind === "Chat"
        ? [Number(ProjectID), String(Type), limit]
        : [String(roomKey(ProjectID, Type)), limit];

    db.serialize(() => {
      db.all(sql, params, (err, result) => {
        if (err) return reject(err);
        // لأننا جبنا آخر الرسائل DESC، نعكسها عشان تعرض ASC (الأقدم للأحدث)
        resolve((result || []).reverse());
      });
    });
  });
};

// SELECT * FROM Chat  WHERE ProjectID='1010629306' AND Type ='تحضير' AND Sender LIKE '%عبدالله حسين%' AND chatID > 0  ORDER BY rowid DESC, chatID ASC LIMIT 10
// SELECT * FROM Chat  WHERE ProjectID= '1010629306' AND Type ='تحضير' AND Sender LIKE  '%Software %'  OR message LIKE '%Software %' AND chatID  < 9669  ORDER BY chatID DESC LIMIT 1
// SELECT * FROM ChatSTAGE  WHERE ProjectID=114 AND StageID =23 AND message LIKE "%عبوود%"     ORDER BY chatID DESC LIMIT 20

const SELECTfilterTableChate = (ProjectID, Type, userName, count = 0) => {
  return new Promise((resolve, reject) => {
    let Plus = parseInt(count) === 0 ? ">" : "<";
    const Types = Number(Type) ? "StageID" : "Type";
    const Table = Number(Type) ? "ChatSTAGE" : "Chat";
    // AND chatID > 772
    db.serialize(function () {
      db.all(
        `SELECT * FROM ${Table}  WHERE ProjectID=? AND  ${Types}=? AND( Sender LIKE '%${userName}%' OR message LIKE '%${userName}%'  ) AND chatID ${Plus} ?  ORDER BY chatID DESC LIMIT 20 `,
        [ProjectID, Type, parseInt(count)],
        function (err, result) {
          if (err) {
            reject(err);
            // console.error(err.message);
          } else {
            resolve(result);
            // console.log(result)
            // resolve(result);
          }
        }
      );
    });
  });
};
//  جلب مشاهدات رسائل الشات
const SELECTTableViewChate = (chatID) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(
        `SELECT * FROM Views WHERE chatID=?`,
        [chatID],
        function (err, result) {
          if (err) {
            reject(err);
            // console.error(err.message);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
// AND DateDay BETWEEN strftime('%Y-%m-01',CURRENT_DATE )  AND CURRENT_DATE
const SELECTTableNavigation = (data, names = [], where = "",equals="!=") => {
  return new Promise((resolve, reject) => {
    const lastId = Number(data[0] ?? 0);
    const numberCompany = data[1];
    const op = lastId === 0 ? ">" : "<";

    const placeholders = names.map(() => "?").join(",");

   const namesFilter =
      names.length > 0
        ? `
          AND ca.tokens IS NOT NULL
          AND json_valid(ca.tokens)
          AND EXISTS (
            SELECT 1
            FROM json_each(ca.tokens)
            WHERE TRIM(value) IN (${placeholders})
          )
        `
        : "";

    const where2 = equals == '=' || equals == '!='
      ? `AND ca.data IS NOT NULL AND json_valid(ca.data) AND json_extract(ca.data, '$.notification_type') ${equals} 'Chate'`
      : equals;

    const query = `
      WITH base AS (
        SELECT
          ca.id,
          ca.IDCompanySub,
          ca.ProjectID,
          ca.notification,
          ca.tokens,
          ca.data,
          ca.Date,
          ca.DateDay
        FROM Navigation ca
        LEFT JOIN companySub RE ON RE.id = ca.IDCompanySub
        WHERE ca.id ${op} ?
          AND RE.NumberCompany = ?
          ${where}
          ${namesFilter}
          ${where2}
      ),
      ranked AS (
        SELECT
          *,
          ROW_NUMBER() OVER (
            PARTITION BY IDCompanySub, ProjectID,  data, DateDay
            ORDER BY id DESC
          ) AS rn
        FROM base
      )
      SELECT
        id, IDCompanySub, ProjectID, notification, tokens, data, Date, DateDay
      FROM ranked
      WHERE rn = 1
      ORDER BY COALESCE(DateDay, Date) DESC, id DESC
      LIMIT 50;
    `;

    const params = [...data, ...names];
    // console.log(query, params);
    db.all(query, params, (err, result) => {
      if (err) {
        console.log("SQL ERR:", err.message);
        console.log("PARAMS:", params);
        return reject(err);
      }
      resolve(result);
    });
  });
};

const SELECTTableNavigationObjectOne = (IDCompany) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        `SELECT MAX(na.id) AS id FROM Navigation na LEFT JOIN companySub RE ON RE.id = na.IDCompanySub WHERE  RE.NumberCompany = ?  AND DateDay BETWEEN strftime('%Y-%m-01',CURRENT_DATE )  AND CURRENT_DATE`,
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
const SELECTTableProjectdataforchat = (
  PhoneNumber,
  id,
  disabled = "false",
  type = "id"
) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(
        `SELECT * FROM Projectdataforchat WHERE PhoneNumber=? AND ${type} > ? AND Disabled = ? ORDER BY id ASC LIMIT 10`,
        [PhoneNumber, id, disabled],
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
//  طلب اخر رقم في جدول العهد
const SELECTTableMaxFinancialCustody = async (
  id,
  type = "max",
  kindOpreation = "*"
) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        type === "max"
          ? `SELECT Max(idOrder) AS  last_id FROM FinancialCustody WHERE IDCompanySub=? `
          : type === "count"
          ? `SELECT ${kindOpreation} FROM FinancialCustody WHERE IDCompany=? AND OrderStatus="false" AND RejectionStatus="false"`
          : `SELECT ${kindOpreation} FROM FinancialCustody WHERE id=? `,
        [id],
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
const SELECTTableFinancialCustody = async (id, type = "") => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(
        `SELECT fi.id,fi.idOrder,fi.IDCompany,fi.IDCompanySub,fi.Requestby,fi.Amount,fi.Statement,fi.Date,fi.Approvingperson,fi.ApprovalDate,fi.OrderStatus,fi.RejectionStatus,fi.Reasonforrejection,fi.Dateofrejection,RE.NameSub,us.userName FROM FinancialCustody fi LEFT JOIN companySub RE ON RE.id = fi.IDcompanySub LEFT JOIN usersCompany us ON us.PhoneNumber = fi.Requestby WHERE fi.IDCompany=? AND ${type}  ORDER BY fi.id DESC LIMIT 10`,
        [id],
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
const selectdetailsFcialCustodforreport = async (IDCompany, type = "") => {
  return new Promise((resolve, reject) => {
    let query = ` fy.id, fy.idOrder, fy.IDCompany, fy.IDCompanySub, CASE WHEN usersCompany.userName IS NULL THEN fy.Requestby ELSE  usersCompany.userName END AS Requestby,
  fy.Amount, fy.Statement, fy.Date, fy.Approvingperson, fy.ApprovalDate,
  fy.OrderStatus, fy.RejectionStatus, fy.Reasonforrejection, fy.Dateofrejection
  FROM FinancialCustody fy
  LEFT JOIN usersCompany ON usersCompany.PhoneNumber = fy.Requestby`;
    db.serialize(function () {
      db.all(
        `SELECT *,cb.NameSub,cy.NameCompany,cy.CommercialRegistrationNumber
FROM (
  SELECT 'الطلبات المفتوحة'  AS section, ${query}
  WHERE COALESCE(fy.OrderStatus,'false')='false' AND COALESCE(fy.RejectionStatus,'false')='false' AND fy.IDCompany=${IDCompany} ${type}

  UNION ALL

  SELECT 'الطلبات المقبولة'  AS section,${query}
  WHERE fy.OrderStatus='true' AND fy.IDCompany=${IDCompany} ${type}

  UNION ALL

  SELECT 'الطلبات المرفوضة' AS section, ${query}
  WHERE fy.RejectionStatus='true' AND fy.IDCompany=${IDCompany} ${type}
) t
JOIN companySub cb ON cb.id = t.IDCompanySub
JOIN company cy ON cy.id = t.IDCompany

ORDER BY
  CASE section
    WHEN 'الطلبات المفتوحة' THEN 1
    WHEN 'الطلبات المقبولة' THEN 2
    WHEN 'الطلبات المرفوضة' THEN 3
  END,
  Date DESC;
`,

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
const selectCountFcialCustodforreport = async (IDCompany, type = "") => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        `WITH f AS (
  SELECT
    *,
    CASE WHEN COALESCE(fy.OrderStatus,'false')='false'
          AND COALESCE(fy.RejectionStatus,'false')='false' THEN 1 ELSE 0 END AS is_open,
    CASE WHEN fy.OrderStatus='true' THEN 1 ELSE 0 END AS is_accepted,
    CASE WHEN fy.RejectionStatus='true' THEN 1 ELSE 0 END AS is_rejected
  FROM FinancialCustody fy WHERE   fy.IDCompany=${IDCompany} ${type}
) 
SELECT
  COUNT(*)                                                   AS total_requests,
  COALESCE(SUM(Amount), 0)                                   AS total_amount,

  SUM(is_open)                                               AS open_requests,
  COALESCE(SUM(CASE WHEN is_open=1     THEN Amount END), 0)  AS open_amount,

  SUM(is_accepted)                                           AS accepted_requests,
  COALESCE(SUM(CASE WHEN is_accepted=1 THEN Amount END), 0)  AS accepted_amount,

  SUM(is_rejected)                                           AS rejected_requests,
  COALESCE(SUM(CASE WHEN is_rejected=1 THEN Amount END), 0)  AS rejected_amount
FROM f;
`,
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
const SELECTTableBranchdeletionRequests = async (
  IDCompany,
  chack,
  PhoneNumber
) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(
        `SELECT * FROM BranchdeletionRequests WHERE IDCompany=? AND checkVerification=?  AND PhoneNumber=? `,
        [IDCompany, chack, PhoneNumber],
        function (err, result) {
          if (err) {
            resolve([]);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};

// اشتراكات
const SELECT_Table_subscription_types = async () => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(`SELECT * FROM subscription_types`, function (err, result) {
        if (err) {
          resolve([]);
        } else {
          resolve(result);
        }
      });
    });
  });
};
const SELECT_Table_subscription_types_one_object = async (id) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        `SELECT * FROM subscription_types WHERE id=? `,
        [id],
        function (err, result) {
          if (err) {
            resolve([]);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};

const Select_table_company_subscriptionsChack = async (project_id) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(
        `SELECT cs.* FROM project_subscription cs  WHERE cs.project_id=? `,
        [project_id],
        function (err, result) {
          if (err) {
            resolve([]);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};

const Select_table_company_subscriptions_onObject = async (
  company_subscriptions_id,
  type = "id"
) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(
        `SELECT *,code_subscription  AS name FROM company_subscriptions  WHERE ${type}=? AND status='active' `,
        [company_subscriptions_id],
        function (err, result) {
          if (err) {
            resolve([]);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
const Select_table_company_subscriptions_vs2 = async (
  company_subscriptions_id,
  type = "id"
) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        `SELECT *,code_subscription  AS name FROM company_subscriptions  WHERE ${type}=? AND status='inactive' `,
        [company_subscriptions_id],
        function (err, result) {
          if (err) {
            resolve(false);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};

const select_table_company_subscriptions = async (
  ProjectID,
  type = "project_id"
) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(
        `SELECT ps.* FROM project_subscription ps LEFT JOIN company_subscriptions st ON st.id = ps.company_subscriptions_id WHERE ps.${type}=? AND st.status='active' `,
        [ProjectID],
        function (err, result) {
          if (result.length === 0 || err) {
            resolve(true);
          } else {
            resolve(true);
          }
        }
      );
    });
  });
};

const chack_subscripation_project_exist = async (ProjectID) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        `SELECT * AS count FROM project_subscription ps
         LEFT JOIN  company_subscriptions cs ON cs.id = ps.company_subscriptions_id
         WHERE ps.project_id = ? AND cs.status='active' `,
        [ProjectID],
        function (err, result) {
          if (err) {
            resolve(0);
          } else {
            resolve(1);
          }
        }
      );
    });
  });
};

const SELECTTABLESUBSCRIPATION = async (IDCompany, StartDate) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(
        `SELECT * FROM subscripation WHERE IDCompany=? AND strftime('%Y-%m',StartDate) = strftime('%Y-%m',? ) `,
        [IDCompany, StartDate],
        function (err, result) {
          if (err) {
            resolve([]);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};

const SelectInvoicesubscripation = async (IDCompany, StartDate) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.all(
        `SELECT 
    su.*, 
    co.NameCompany,
    co.CommercialRegistrationNumber,
    CASE 
    WHEN pr.Nameproject IS NULL THEN 'مشروع محذوف' 
    ELSE pr.Nameproject 
    END AS ProjectName,
    julianday(su.EndDate) - julianday(su.StartDate) AS DaysElapsed,
   CASE
   WHEN vo.Amount IS NULL THEN 0.00
   ELSE vo.Amount
   END AS total  
    FROM 
    subscripation su
    LEFT JOIN 
    companySubprojects pr ON su.ProjectID = pr.id
    LEFT JOIN company co ON co.id = su.IDCompany
    LEFT JOIN Invoice vo ON vo.IDCompany=su.IDCompany AND strftime('%Y-%m', vo.Subscription_end_date) = strftime('%Y-%m', su.StartDate)
    WHERE 
    su.IDCompany = ? 
    AND strftime('%Y-%m', su.StartDate) = strftime('%Y-%m', ?)
 `,
        [IDCompany, StartDate],
        function (err, result) {
          if (err) {
            resolve([]);
          } else {
            resolve(result);
          }
        }
      );
    });
  });
};
// COALESCE(ROUND(SUM(COALESCE(Difference, 0)), 1), 0) AS TotalDeviationDays   -- مجموع الانحراف (اختياري)

const SelectReportTimeline = async (ProjectID, report_date) => {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.get(
        `WITH params(project_id, report_date) AS (VALUES (${ProjectID},'${report_date}')),
stage_agg AS (
  SELECT
    ProjectID,
    SUM(COALESCE(Days, 0))              AS ExpectedDurationDays, -- المدة المتوقعة للمشروع
    MAX(date(EndDate))                  AS ExpectedDeliveryDate,
    COUNT(*)                            AS StagesCount,           -- عدد المراحل
    ROUND(SUM(COALESCE(Difference, 0)), 1) AS TotalDeviationDays   -- مجموع الانحراف (اختياري)
  FROM StagesCUST
  WHERE ProjectID = (SELECT project_id FROM params)
)
SELECT
  p.id                                   AS ProjectID,
  p.Nameproject,
  p.TypeOFContract,
  DATE(p.Contractsigningdate)            AS Contractsigningdate,
  DATE(p.ProjectStartdate)               AS ProjectStartdate,
  sa.ExpectedDurationDays                AS ExpectedDurationDays,
  sa.StagesCount                         AS StagesCount,
  sa.ExpectedDeliveryDate                AS ExpectedDeliveryDate,
  /* إجمالي الأيام المستغرقة حتى تاريخ طباعة التقرير */
CASE
  WHEN p.ProjectStartdate IS NULL OR (SELECT report_date FROM params) IS NULL THEN NULL
  WHEN julianday((SELECT report_date FROM params)) < julianday(p.ProjectStartdate) THEN 0
  ELSE CAST(julianday((SELECT report_date FROM params)) - julianday(p.ProjectStartdate) AS INTEGER)
END AS Totaldaysspent,

/* إجمالي الأيام المتبقية لإنهاء المشروع */
CASE
  WHEN sa.ExpectedDeliveryDate IS NULL OR (SELECT report_date FROM params) IS NULL THEN NULL
  WHEN julianday(sa.ExpectedDeliveryDate) <= julianday((SELECT report_date FROM params)) THEN 0
  ELSE CAST(julianday(sa.ExpectedDeliveryDate) - julianday((SELECT report_date FROM params)) AS INTEGER)
END AS Totaldaysremaining,
  sa.TotalDeviationDays,
  json_group_array(DISTINCT json_object(
    'StageName', cu.StageName,
    'Days', cu.Days,
    'StartDate',   cu.StartDate,
    'EndDate',     cu.EndDate,
    'CloseDate',   COALESCE(NULLIF(cu.CloseDate, ''), '-'),
    'Difference',cu.Difference
  )) AS StageCust,
 CASE WHEN  sn.Type IS  NULL THEN  '[]' ELSE   json_group_array(DISTINCT json_object(
    'StageName', (SELECT ST.StageName FROM StagesCUST ST WHERE   ST.StageID =  sn.StagHOMID ),
    'Type', sn.Type,
    'DateNote',   sn.DateNote,
    'Note',   sn.Note,
    'RecordedBy',     sn.RecordedBy,
    'countdayDelay',   sn.countdayDelay
  )) END AS StageNotes
FROM companySubprojects p
JOIN stage_agg sa ON sa.ProjectID = p.id
JOIN StagesCUST cu ON cu.ProjectID = p.id
LEFT JOIN StageNotes sn ON sn.ProjectID = p.id
WHERE p.id = (SELECT project_id FROM params)
GROUP BY
  p.id, p.Nameproject, p.TypeOFContract, p.Contractsigningdate, p.ProjectStartdate,
  sa.ExpectedDurationDays, sa.StagesCount, sa.ExpectedDeliveryDate, sa.TotalDeviationDays;
`,
        function (err, result) {
          if (err) {
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
  SELECT_Table_subscription_types,
  SELECT_Table_subscription_types_one_object,
  Select_table_company_subscriptions_onObject,
  chack_subscripation_project_exist,
  select_table_company_subscriptions,
  Select_table_company_subscriptionsChack,

  selectprojectdatabycompany,
  SELECTTABLESUBSCRIPATION,
  SELECTTablecompanyApi,
  SELECTTablecompany,
  SELECTTablecompanyName,
  SELECTTablecompanySub,
  SELECTTablecompanySubProject,
  SELECTTablecompanySubProjectREVENUE,
  SELECTTablecompanySubProjectReturned,
  SELECTTablecompanySubProjectexpense,
  SELECTTablecompanySubProjectarchives,
  SELECTTablePostPublic,
  SELECTTableCommentPostPublic,
  SELECTTableLikesPostPublic,
  SELECTTableLikesPostPublicotherroad,
  SELECTTableChateStage,
  SELECTLengthTableChateStage,
  SELECTLengthTableChate,
  SELECTLastTableChateStage,
  SELECTLastTableChate,
  SELECTTableChateStageOtherroad,
  SELECTTableViewChateStage,
  SELECTTablecompanySubProjectStageCUST,
  SELECTTablecompanySubProjectStageNotes,
  SELECTTablecompanySubProjectStagesSub,
  SELECTTablecompanySubProjectStageSubNotes,
  SELECTTableChate,
  SELECTTableChateotherroad,
  SELECTTableViewChate,
  SELECTTablecompanySubProjectindividual,
  SELECTTablecompanySubAnotherway,
  SELECTTablecompanySubProjectarchivesotherroad,
  SELECTFROMTablecompanysubprojectStageTemplet,
  SELECTFROMTablecompanysubprojectStagesubTeplet,
  SELECTTableIDcompanytoPost,
  SELECTLastTableChateStageDontEmpty,
  SELECTLastTableChateTypeDontEmpty,
  SELECTLastTableChateID,
  SELECTTableViewChateUser,
  SELECTTablecompanySubID,
  SELECTTablecompanySubCount,
  SELECTTablecompanySubProjectLast_id,
  SELECTTableUsernameBrinsh,
  SELECTSUMAmountandBring,
  SelectVerifycompanyexistence,
  SELECTProjectStartdate,
  SELECTTablecompanySubProjectStageCUSTAccordingEndDateandStageIDandStartDate,
  SELECTTablecompanySubProjectStagesSubSingl,
  SELECTTablecompanySubProjectStageCUSTCount,
  SELECTTablecompanySubProjectStageCUSTSubCount,
  SELECTTablecompanySubProjectStageCUSTONe,
  SELECTTablecompanybrinshStagesSubAll,
  SELECTTablecompanySubProjectexpenseObjectOne,
  SELECTdataprojectandbrinshandcompany,
  SELECTTableSavepdf,
  SELECTTablecompanySubProjectexpenseObjectOneforArchif,
  SELECTSEARCHINFINANCE,
  SELECTTablecompanySubProjectREVENUEObjectOne,
  SELECTTablecompanySubProjectReturnedObjectOne,
  SELECTallDatafromTableRequests,
  SELECTDataAndTaketDonefromTableRequests,
  SELECTCOUNTCOMMENTANDLIKPOST,
  SELECTTableCommentID,
  SELECTTablePostPublicSearch,
  SELECTTablecompanySubProjectStageNotesOneObject,
  SELECTTablecompanySubProjectfornotification,
  SELECTTablecompanySubProjectfornotificationEdit,
  SELECTDataPrivatPost,
  SELECTDataPrivatPostonObject,
  SELECTTableNavigation,
  SELECTTableNavigationObjectOne,
  SELECTTablePostPublicOneObject,
  SELECTTableFinance,
  SELECTTablecompanySubLinkevaluation,
  SELECTTableProjectdataforchat,
  SELECTLastmassgeuserinchat,
  SELECTTablecompanySubProjectFilter,
  SELECTTableMaxFinancialCustody,
  SELECTTableFinancialCustody,
  SELECTallDatafromTableRequestsV2,
  SELECTDataAndTaketDonefromTableRequests2,
  SELECTTableFinanceapi,
  SELECTTablecompanyRegistration,
  SELECTTablecompanyRegistrationall,
  SelectVerifycompanyexistencePhonenumber,
  SELECTProjectStartdateapis,
  SELECTTableStageNotesAllproject,
  SELECTfilterTableChate,
  SELECTTablearchivesNamefolder,
  SELECTTableBranchdeletionRequests,
  SELECTTABLEcompanyProjectall,
  SELECTProjectid,
  SELECTStageid,
  SELECTTablecompanySubProjectStageCUSTv2,
  SELECTStageSubid,
  SELECTTablepostAll,
  SELECTStageallid,
  SELECTFROMTableStageTempletmax,
  SELECTFROMTableStageTempletall,
  SELECTFROMTableSubStageTempletall,
  SELECTFROMTableStageTempletaObject,
  SELECTTablecompanyall,
  SELECTIDcompanyANDpreoject,
  SelectInvoicesubscripation,
  selecttablecompanySubProjectall,
  SELECTTablecompanySubuser,
  SELECTFROMTableStageTempletadays,
  SelectReportTimeline,
  SelectOrdertabletotalreport,
  SelectdetailsOrders,
  selectdetailsFcialCustodforreport,
  selectCountFcialCustodforreport,
  SELECTTusersProjectProjectall,
  SELECTTableStageCUST_IMAGE,
  SELECTTableStagesCUST_Image,
  SELECTTableStageStageSub,
  selectStagestypeforProject,
  selectStagestypeTemplet,
  Select_table_company_subscriptions_vs2
};
