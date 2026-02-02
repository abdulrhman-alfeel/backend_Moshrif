const db = require("./sqlite");

// ALTER TABLE companySubprojects ADD COLUMN numberBuilding INTEGER NULL;
// ALTER TABLE companySubprojects ADD COLUMN Disabled INTEGER NULL DEFAULT 'true';
//  ALTER TABLE company ADD COLUMN DisabledFinance TEXT NULL DEFAULT 'true'
//  ALTER TABLE Requests ADD COLUMN checkorderout TEXT NULL DEFAULT 'false'

// SELECT
//   COUNT(*) AS total,
//   SUM(CASE WHEN lower(COALESCE(Done,'false')) = 'false' THEN 1 ELSE 0 END) AS open_count,
//   SUM(CASE WHEN lower(COALESCE(Done,'false')) = 'true' AND lower(COALESCE(checkorderout,'false')) = 'false'  THEN 1 ELSE 0 END) AS closed_count,
//   SUM(CASE WHEN lower(COALESCE(checkorderout,'false')) = 'true' THEN 1 ELSE 0 END) AS confirmed_count
// FROM Requests;

const CreateTable = () => {
  // PostgreSQL: DDL should be managed via migrations.
  // Running SQLite-specific CREATE TABLE / TRIGGER statements on Postgres will fail.
  if (process.env.DB_CLIENT && process.env.DB_CLIENT.toLowerCase() === 'postgres') {
    console.log('ℹ️  DB_CLIENT=postgres: skipping SQLite auto-create tables. Use sql/migrations/postgres/*.sql');
    return;
  }
  db.run(`CREATE TABLE IF NOT EXISTS companyRegistration (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        CommercialRegistrationNumber INTEGER NOT NULL,NameCompany TEXT NOT NULL,
        BuildingNumber INTEGER NOT NULL,StreetName TEXT NOT NULL,
        NeighborhoodName TEXT NOT NULL, PostalCode TEXT NOT NULL, City TEXT NOT NULL,Country TEXT NOT NULL,TaxNumber INTEGER NOT NULL,SubscriptionStartDate DATE NULL DEFAULT CURRENT_DATE,Api TEXT NULL DEFAULT 'false',PhoneNumber TEXT NOT NULL,userName TEXT NOT NULL
      )`);
  db.run(`CREATE TABLE IF NOT EXISTS company (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        CommercialRegistrationNumber INTEGER NOT NULL,NameCompany TEXT NOT NULL,
        BuildingNumber INTEGER NOT NULL,StreetName TEXT NOT NULL,
        NeighborhoodName TEXT NOT NULL, PostalCode TEXT NOT NULL, City TEXT NOT NULL,Country TEXT NOT NULL,TaxNumber INTEGER NOT NULL,NumberOFbranchesAllowed INTEGER NOT NULL , NumberOFcurrentBranches INTEGER NOT NULL,SubscriptionStartDate DATE NULL DEFAULT CURRENT_DATE,SubscriptionEndDate DATE NULL,Api TEXT NULL,Cost INTEGER NULL DEFAULT 0,DisabledFinance TEXT NULL DEFAULT 'true'
      )`);

  db.run(`CREATE TABLE IF NOT EXISTS companySub (
    id INTEGER PRIMARY KEY AUTOINCREMENT,NumberCompany INTEGER NOT NULL ,NameSub TEXT NOT NULL,BranchAddress TEXT NOT NULL,Email TEXT  NULL,PhoneNumber TEXT  NULL,FOREIGN KEY (NumberCompany) REFERENCES company (id) ON DELETE RESTRICT ON UPDATE RESTRICT 
  )`);

  db.run(
    `CREATE TABLE IF NOT EXISTS Linkevaluation(id INTEGER PRIMARY KEY AUTOINCREMENT, IDcompanySub INTEGER NOT NULL ,urlLink TEXT NULL) `
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS usersCompany(id INTEGER PRIMARY KEY AUTOINCREMENT,IDCompany INTEGER NOT NULL,userName TEXT NOT NULL, IDNumber INTEGER NOT NULL,PhoneNumber TEXT NOT NULL, image TEXT NULL,jobdiscrption NOT NULL ,job TEXT NOT NULL,jobHOM TEXT  NULL, DateOFjoin DATE NULL DEFAULT CURRENT_DATE,Activation NULL DEFAULT 'true',Validity JSON NULL,FOREIGN KEY (IDCompany) REFERENCES company (id) ON DELETE RESTRICT ON UPDATE RESTRICT )`
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS usersBransh(id INTEGER PRIMARY KEY AUTOINCREMENT,idBransh INTEGER NOT NULL,user_id INTEGER NOT NULL, job TEXT NULL DEFAULT 'عضو',Acceptingcovenant TEXT NULL DEFAULT 'false',ValidityBransh JSON NULL,DateOFjoin DATE NULL DEFAULT CURRENT_DATE)`
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS usersProject(id INTEGER PRIMARY KEY AUTOINCREMENT,idBransh INTEGER NOT NULL,ProjectID INTEGER NOT NULL,user_id INTEGER NOT NULL, ValidityProject JSON NULL,DateOFjoin DATE NULL DEFAULT CURRENT_DATE)`
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS LoginActivaty(id INTEGER PRIMARY KEY AUTOINCREMENT,IDCompany INTEGER NOT NULL,userName TEXT NOT NULL, IDNumber INTEGER NOT NULL,PhoneNumber TEXT NOT NULL, image TEXT NULL , DateOFlogin DATE NULL DEFAULT CURRENT_DATE,DateEndLogin DATE NULL,Activation NULL DEFAULT 'true',job TEXT NOT NULL,jobdiscrption TEXT NOT NULL,Validity JSON NULL,codeVerification INTEGER NOT NULL,token TEXT NULL)`
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS companySubprojects(id INTEGER PRIMARY KEY AUTOINCREMENT,IDcompanySub INTEGER NOT NULL,Nameproject TEXT NOT NULL, Note TEXT NULL,TypeOFContract TEXT NOT NULL, GuardNumber INTEGER NULL ,LocationProject TEXT NULL , ProjectStartdate DATE NULL ,Imageproject TEXT NULL,Contractsigningdate DATE NULL DEFAULT CURRENT_DATE,numberBuilding INTEGER NULL,Disabled TEXT NULL DEFAULT 'true',Referencenumber INTEGER NULL,FOREIGN KEY (IDcompanySub) REFERENCES companySub (id) ON DELETE RESTRICT ON UPDATE RESTRICT)`
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS companySubprojectsAudite(id INTEGER PRIMARY KEY AUTOINCREMENT,ProjectID INTEGER NOT NULL,IDcompanySub INTEGER NOT NULL,Nameproject TEXT NOT NULL, Note TEXT NULL,TypeOFContract TEXT NOT NULL, GuardNumber INTEGER NULL ,LocationProject TEXT NULL , ProjectStartdate DATE NULL ,Imageproject TEXT NULL,Contractsigningdate DATE NULL DEFAULT CURRENT_DATE,numberBuilding INTEGER NULL,Disabled TEXT NULL DEFAULT 'true',Referencenumber INTEGER NULL,  action_type TEXT NULL,
        action_date DATE NULL,FOREIGN KEY (IDcompanySub) REFERENCES companySub (id) ON DELETE RESTRICT ON UPDATE RESTRICT)`
  );

db.run(`
CREATE TRIGGER IF NOT EXISTS utr_companySubprojects_audit_update
AFTER UPDATE ON companySubprojects
BEGIN
    INSERT INTO companySubprojectsAudite (
        id, ProjectID, IDcompanySub, Nameproject, Note, TypeOFContract,
        GuardNumber, LocationProject, ProjectStartdate, Imageproject, Contractsigningdate, numberBuilding, Disabled,
        Referencenumber, Project_Space, Cost_per_Square_Meter,   action_type,
        action_date
    )
    VALUES (
        NEW.id, NEW.ProjectID, NEW.IDcompanySub, NEW.Nameproject, NEW.Note, NEW.TypeOFContract,
        NEW.GuardNumber, NEW.LocationProject, NEW.ProjectStartdate, NEW.Imageproject, NEW.Contractsigningdate, NEW.numberBuilding, NEW.Disabled,
        NEW.Referencenumber, NEW.Project_Space, NEW.Cost_per_Square_Meter, 'UPDATE',
        datetime('now')
    );
END;
`);

db.run(`
CREATE TRIGGER IF NOT EXISTS utr_companySubprojects_audit_delete
AFTER DELETE ON companySubprojects
BEGIN
    INSERT INTO companySubprojectsAudite (
        id, ProjectID, IDcompanySub, Nameproject, Note, TypeOFContract,
        GuardNumber, LocationProject, ProjectStartdate, Imageproject, Contractsigningdate, numberBuilding, Disabled,
        Referencenumber, Project_Space, Cost_per_Square_Meter, action_type,
        action_date
    )
    VALUES (
        OLD.id, OLD.ProjectID, OLD.IDcompanySub, OLD.Nameproject, OLD.Note, OLD.TypeOFContract,
        OLD.GuardNumber, OLD.LocationProject, OLD.ProjectStartdate, OLD.Imageproject, OLD.Contractsigningdate, OLD.numberBuilding, OLD.Disabled,
        OLD.Referencenumber, OLD.Project_Space, OLD.Cost_per_Square_Meter, 'DELETE',
        datetime('now')
    );
END;
`);
  // منصة مشرف من الاعمال الذي قمت بتطويرها لدى شركة شفق الانشائية للمقاولات المعمارية حيث تقوم بادارة المشاريع و انشطة المقاولات والإشراف الفني للمباني وذلك عن طريق الإشراف والمتابعة الالكترونية بين الملاك والمقاولين والمشرفين والمهندسين المسؤولين عن الموقع وتسجيلها وتوثيقها الكترونيا لتسهل على الملاك التواصل مع الأطراف المرتبطة بالمشروع واستدعاء التقارير عند الحاجة

  // templet ****************************************
  db.run(
    `CREATE TABLE IF NOT EXISTS Stagestype(id INTEGER PRIMARY KEY AUTOINCREMENT,IDCompany INTEGER NOT NULL,Type TEXT NULL )`
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS StagesTemplet(StageIDtemplet INTEGER PRIMARY KEY AUTOINCREMENT,StageID TEXT NULL,Type nvarchar[50] NULL,StageName nvarchar[max] NOT NULL , Days INTEGER NULL,StartDate TEXT  NULL, EndDate TEXT NULL ,CloseDate TEXT NULL , OrderBy INTEGER NULL )`
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS StagesSubTemplet(StageSubID INTEGER PRIMARY KEY AUTOINCREMENT,StageID TEXT NULL,StageSubName nvarchar[max] NULL,attached TEXT NULL , CloseDate TEXT NULL)`
  );

  // CUSTOMER TEBLE *************************************
  db.run(
    `CREATE TABLE IF NOT EXISTS StagesCUST(StageCustID INTEGER PRIMARY KEY AUTOINCREMENT,StageID INTEGER  NULL ,ProjectID INTEGER NULL ,Type nvarchar[50]  NULL,StageName TEXT NOT NULL, Days INTEGER NULL,StartDate DATE NOT NULL, EndDate DATE NULL ,CloseDate TEXT NULL , OrderBy INTEGER NULL ,Difference decimal NULL,Done NULL DEFAULT 'false',NoteOpen TEXT NULL,OpenBy nvarchar[50] NULL,NoteClosed TEXT NULL,ClosedBy nvarchar[50] NULL)`
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS StagesCUST_Image(id INTEGER PRIMARY KEY AUTOINCREMENT,StageID INTEGER  NULL ,ProjectID INTEGER NULL ,url nvarchar[50]  NULL, addedby TEXT NOT NULL , Date DATE NULL DEFAULT CURRENT_DATE)`
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS StageNotes(StageNoteID INTEGER PRIMARY KEY AUTOINCREMENT,StagHOMID INTEGER  NULL ,ProjectID INTEGER NULL ,Type nvarchar[50] NULL,Note nvarchar[max] NULL, DateNote NULL DEFAULT CURRENT_DATE,
      RecordedBy nvarchar[50] NULL, UpdatedDate NULL DEFAULT CURRENT_DATE,countdayDelay INTEGER NULL ,ImageAttachment TEXT NULL )`
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS StagesSub(StageSubID INTEGER PRIMARY KEY AUTOINCREMENT,StagHOMID INTEGER NULL,ProjectID INTEGER NULL ,StageSubName nvarchar[max] NULL,CloseDate TEXT NULL,Done NULL DEFAULT 'false', Note JSON NULL , closingoperations JSON NULL )`
  );

  //  مصروفات
  db.run(
    `CREATE TABLE IF NOT EXISTS Expense(Expenseid INTEGER PRIMARY KEY AUTOINCREMENT, projectID INTEGER NOT NULL, InvoiceNo INTEGER NULL ,Amount DECIMAL NULL, Date DATE NULL DEFAULT CURRENT_DATE , Data nvarchar[max] NULL, ClassificationName TEXT NULL , Image JSON NULL, Taxable nvarchar[10] NULL ,CreatedDate NULL DEFAULT CURRENT_DATE , Referencenumberfinanc INTEGER NULL) `
  );
  // العهد
  db.run(
    `CREATE TABLE IF NOT EXISTS Revenue(RevenueId INTEGER PRIMARY KEY AUTOINCREMENT, projectID INTEGER NOT NULL ,Amount DECIMAL NULL, Date DATE NULL DEFAULT CURRENT_DATE , Data nvarchar[max] NULL, Bank DECIMAL[18,2] NULL,Image JSON NULL ,Referencenumberfinanc INTEGER NULL) `
  );
  //  المرتجع
  db.run(
    `CREATE TABLE IF NOT EXISTS Returns(ReturnsId INTEGER PRIMARY KEY AUTOINCREMENT, projectID INTEGER NOT NULL ,Amount DECIMAL, Date DATE NULL DEFAULT CURRENT_DATE , Data nvarchar[max] NULL,Image JSON NULL,Referencenumberfinanc INTEGER NULL) `
  );
  // حفظ اخر عملية pdf
  db.run(
    `CREATE TABLE IF NOT EXISTS Savepdf(id INTEGER PRIMARY KEY AUTOINCREMENT, projectID INTEGER NOT NULL ,namefileall TEXT NULL,namefileparty TEXT NULL , Date DATE NULL DEFAULT CURRENT_DATE ,Total INTEGER NULL,TotalExpense INTEGER NULL) `
  );
  // الارشيف
  db.run(
    `CREATE TABLE IF NOT EXISTS Archives(ArchivesID INTEGER PRIMARY KEY AUTOINCREMENT,ProjectID INTEGER NOT NULL,FolderName TEXT NOT NULL ,Date DATE NULL DEFAULT CURRENT_DATE ,children JSON NULL,ActivationHome NULL DEFAULT 'true',Activationchildren DEFAULT 'true' )`
  );

  //  الطلبيات
  db.run(
    `CREATE TABLE IF NOT EXISTS Requests(RequestsID INTEGER PRIMARY KEY AUTOINCREMENT,ProjectID INTEGER NOT NULL,Type TEXT NOT NULL, Data nvarchar[max] NOT NULL,Date DATE NULL DEFAULT CURRENT_DATE,Done TEXT NULL DEFAULT 'false',InsertBy navrchar[50] NULL,Implementedby narchar[10] NULL,Image JSON NULL,checkorderout TEXT NULL DEFAULT 'false',DateTime DATE NULL) `
  );

  //العامة منشورات
  db.run(
    `CREATE TABLE IF NOT EXISTS Post (PostID INTEGER PRIMARY KEY AUTOINCREMENT , postBy TEXT NOT NULL, Date DATE NULL DEFAULT CURRENT_DATE, url TEXT NOT NULL , Type TEXT NOT NULL ,Data TEXT NOT NULL,timeminet DATE NULL,  StageID INTEGER NOT NULL, ProjectID INTEGER NOT NULL ,brunshCommpanyID INTEGER NOT NULL , CommpanyID INTEGER NOT NULL)`
  );
  //  التعليقات
  db.run(
    `CREATE TABLE IF NOT EXISTS Comment (CommentID INTEGER PRIMARY KEY AUTOINCREMENT, PostId INTEGER NOT NULL , commentText TEXT NOT NULL, Date DATE DEFAULT CURRENT_DATE,userName TEXT NOT NULL,FOREIGN KEY (PostId) REFERENCES Post (PostID) ON DELETE RESTRICT ON UPDATE RESTRICT)`
  );
  //  الاعجابات
  db.run(
    `CREATE TABLE IF NOT EXISTS Likes (LikesID INTEGER PRIMARY KEY AUTOINCREMENT, PostId INTEGER NOT NULL ,  Date DATE DEFAULT CURRENT_DATE,userName TEXT NOT NULL,FOREIGN KEY (PostId) REFERENCES Post (PostID) ON DELETE RESTRICT ON UPDATE RESTRICT)`
  );
  // دردشة المراحل
  db.run(
    `CREATE TABLE IF NOT EXISTS ChatSTAGE(chatID INTEGER PRIMARY KEY AUTOINCREMENT ,idSendr TEXT NOT NULL, StageID INTEGER NOT NULL ,ProjectID INTEGER NOT NULL,Sender TEXT NOT NULL ,message TEXT NULL,Date DATE DEFAULT CURRENT_DATE,timeminet DATE NULL,File JSON NULL , Reply JSON NULL )`
  );
  //  مشاهدة دردشة المراحل
  db.run(
    `CREATE TABLE IF NOT EXISTS ViewsCHATSTAGE(viewsID INTEGER PRIMARY KEY AUTOINCREMENT, chatID INTEGER NOT NULL, userName TEXT NOT NULL, Date DATE DEFAULT CURRENT_DATE, FOREIGN KEY (chatID) REFERENCES ChatSTAGE (chatID) ON DELETE RESTRICT ON UPDATE RESTRICT) `
  );
  // الدردشة
  db.run(
    `CREATE TABLE IF NOT EXISTS Chat(chatID INTEGER PRIMARY KEY AUTOINCREMENT , idSendr TEXT NOT NULL,Type TEXT NULL ,ProjectID INTEGER NOT NULL,Sender TEXT NOT NULL ,message TEXT NULL,Date DATE DEFAULT CURRENT_DATE,timeminet DATE NULL,File JSON NULL , Reply JSON NULL)`
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS Chat_private(chatID INTEGER PRIMARY KEY AUTOINCREMENT , conversationId TEXT NOT NULL,companyId INTEGER NULL ,idSendr TEXT NOT NULL,Sender TEXT NOT NULL ,message TEXT NULL,Date DATE DEFAULT CURRENT_DATE,timeminet DATE NULL,File JSON NULL , Reply JSON NULL)`
  );
  //  المشاهدات
  db.run(
    `CREATE TABLE IF NOT EXISTS Views(viewsID INTEGER PRIMARY KEY AUTOINCREMENT, chatID INTEGER NOT NULL, userName TEXT NOT NULL, Date DATE DEFAULT CURRENT_DATE, FOREIGN KEY (chatID) REFERENCES Chat (chatID) ON DELETE RESTRICT ON UPDATE RESTRICT) `
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS Navigation(id INTEGER PRIMARY KEY AUTOINCREMENT,IDCompanySub INTEGER NULL,ProjectID INTEGER NULL, notification JSON NULL, tokens JSON NULL,data JSON NULL, Date DATE DEFAULT CURRENT_DATE,DateDay DATE DEFAULT CURRENT_DATE)`
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS Projectdataforchat(id INTEGER PRIMARY KEY AUTOINCREMENT,ProjectID INTEGER NULL,Nameproject TEXT NULL,PhoneNumber TEXT NULL ,Disabled TEXT NULL DEFAULT 'false',  Date DATE DEFAULT CURRENT_DATE)`
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS FinancialCustody (id INTEGER PRIMARY KEY AUTOINCREMENT , idOrder INTEGER NOT NULL ,IDCompany INTEGER NOT NULL, IDCompanySub INTEGER NOT NULL , Requestby TEXT NOT NULL , Amount DECIMAL NOT NULL ,Statement TEXT NOT NULL ,Date DATE DEFAULT CURRENT_TIMESTAMP,Approvingperson TEXT NULL 
    ,ApprovalDate DATE NULL,OrderStatus TEXT NULL DEFAULT 'false',RejectionStatus TEXT NULL DEFAULT 'false', Reasonforrejection TEXT NULL  , Dateofrejection DATE NULL)`
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS Prepare (id INTEGER PRIMARY KEY AUTOINCREMENT ,IDCompany INTEGER NOT NULL, idUser INTEGER NOT NULL,Dateday DATE DEFAULT CURRENT_DATE ,CheckIntime DATE  NULL, CheckInFile JSON NULL , CheckOUTtime DATE NULL , CheckoutFile JSON NULL , Numberofworkinghours INTEGER NULL,Overtimeassignment TEXT DEFAULT "false" ,Numberofovertimehours INTEGER NULL)`
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS Flowmove (id INTEGER PRIMARY KEY AUTOINCREMENT ,userName TEXT NOT NULL, PhoneNumber TEXT NOT NULL,Movementtype TEXT NULL,Time DATE DEFAULT CURRENT_DATE)`
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS UserPrepare (id INTEGER PRIMARY KEY AUTOINCREMENT,idUser INTEGER NOT NULL,IDCompany INTEGER NOT NULL,Time DATE DEFAULT CURRENT_DATE)`
  );
  db.run(`CREATE TABLE IF NOT EXISTS UpdateSystem (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version TEXT NOT NULL,messageUpdate TEXT NOT NULL
      )`);
  const sql = `CREATE TABLE IF NOT EXISTS BranchdeletionRequests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      IDBranch INTEGER NOT NULL,
      IDCompany INTEGER NOT NULL,
      checkVerification INTEGER NOT NULL,
      PhoneNumber TEXT NOT NULL,
      Date DATE DEFAULT CURRENT_TIMESTAMP
  )`;

  db.run(sql, (err) => {
    if (err) {
      console.error("SQL Error:", err);
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS subscription_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,                  -- شهري / ربعي / سنوي
    duration_in_months INTEGER NOT NULL, -- 1 / 3 / 12
    price_per_project DECIMAL NOT NULL ,  -- سعر المشروع الواحد حسب المدة
    discraption TEXT NULL
    );
`);

  db.run(`
    CREATE TABLE IF NOT EXISTS company_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    code_subscription TEXT NOT NULL,
    subscription_type_id INTEGER NOT NULL,
    project_count INTEGER NOT NULL,   -- يحدده المستخدم
    price DECIMAL NOT NULL,            -- السعر النهائي المحسوب
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE  NULL,
    project_count_used INTEGER DEFAULT 0, -- عدد المشاريع المستخدمة من قبل الشركة
    status TEXT DEFAULT 'active',
    tran_ref TEXT NULL
);
`);
  db.run(`
    CREATE TABLE IF NOT EXISTS company_subscriptionsAudite (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_subscriptions_id INTEGER NOT NULL,
    company_id INTEGER NOT NULL,
    code_subscription TEXT NOT NULL,
    subscription_type_id INTEGER NOT NULL,
    project_count INTEGER NOT NULL,   -- يحدده المستخدم
    price DECIMAL NOT NULL,            -- السعر النهائي المحسوب
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE  NULL,
    project_count_used INTEGER DEFAULT 0, -- عدد المشاريع المستخدمة من قبل الشركة
    status TEXT DEFAULT 'active',
    tran_ref TEXT NULL,
    action_type TEXT NULL,
    action_date DATE NULL
);
`);
  db.run(`
   CREATE TRIGGER IF NOT EXISTS utr_company_subscriptions_audit_update
AFTER UPDATE ON company_subscriptions
BEGIN
    INSERT INTO company_subscriptionsAudite (
        company_subscriptions_id,
        company_id,
        code_subscription,
        subscription_type_id,
        project_count,
        price,
        start_date,
        end_date,
        project_count_used,
        status,
        tran_ref,
        action_type,
        action_date
    )
    VALUES (
        NEW.id,
        NEW.company_id,
        NEW.code_subscription,
        NEW.subscription_type_id,
        NEW.project_count,
        NEW.price,
        NEW.start_date,
        NEW.end_date,
        NEW.project_count_used,
        NEW.status,
        NEW.tran_ref,
        'UPDATE',
        datetime('now')
    );
END;

    `);

  db.run(`
  CREATE TRIGGER IF NOT EXISTS utr_company_subscriptions_audit_delete
AFTER DELETE ON company_subscriptions
BEGIN
    INSERT INTO company_subscriptionsAudite (
        company_subscriptions_id,
        company_id,
        code_subscription,
        subscription_type_id,
        project_count,
        price,
        start_date,
        end_date,
        project_count_used,
        status,
        tran_ref,
        action_type,
        action_date
    )
    VALUES (
        OLD.id,
        OLD.company_id,
        OLD.code_subscription,
        OLD.subscription_type_id,
        OLD.project_count,
        OLD.price,
        OLD.start_date,
        OLD.end_date,
        OLD.project_count_used,
        OLD.status,
        OLD.tran_ref,
        'DELETE',
        datetime('now')
    );
END;

  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS project_subscription (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_subscriptions_id INTEGER NOT NULL,
    project_id INTEGER NOT NULL,
    startDate DATE DEFAULT CURRENT_DATE);
`);

// create index

    db.run(`CREATE INDEX IF NOT EXISTS idx_csp_branch_disabled_id
ON companySubprojects (IDcompanySub, Disabled, id);
`)
    db.run(`CREATE INDEX IF NOT EXISTS idx_usersCompany_phone
ON usersCompany (PhoneNumber);`)
    db.run(`CREATE INDEX IF NOT EXISTS idx_usersBransh_user_branch_job
ON usersBransh (user_id, idBransh, job);`)
    db.run(`CREATE INDEX IF NOT EXISTS idx_usersProject_user_branch_project
ON usersProject (user_id, idBransh, ProjectID);`)
    db.run(`CREATE INDEX IF NOT EXISTS idx_usersProject_ProjectID
ON usersProject (ProjectID);`)
    db.run(`CREATE INDEX IF NOT EXISTS idx_Post_company_date_postid
ON Post (CommpanyID, Date, PostID);`)
    db.run(`CREATE INDEX IF NOT EXISTS idx_Post_project_stage_postid
ON Post (ProjectID, StageID, PostID);`)
    db.run(`CREATE INDEX IF NOT EXISTS idx_Comment_PostId
ON Comment (PostId);`)
    db.run(`CREATE INDEX IF NOT EXISTS idx_Likes_PostId
ON Likes (PostId);`)
    db.run(`CREATE INDEX IF NOT EXISTS idx_Likes_PostId_userName
ON Likes (PostId, userName);`)
    db.run(`CREATE INDEX IF NOT EXISTS idx_StagesCUST_ProjectID_OrderBy
ON StagesCUST (ProjectID, OrderBy);`)
    db.run(`CREATE INDEX IF NOT EXISTS idx_StagesSub_Project_Stage
ON StagesSub (ProjectID, StagHOMID);
`)
    db.run(`CREATE INDEX IF NOT EXISTS idx_StagesSub_Project_Stage_Done
ON StagesSub (ProjectID, StagHOMID, Done);`)
    db.run(`CREATE INDEX IF NOT EXISTS idx_StagesSub_done_true_only
ON StagesSub (ProjectID, StagHOMID)
WHERE Done = 'true';`)

    db.run(`CREATE INDEX IF NOT EXISTS idx_Chat_ProjectID_Type_timeminet
ON Chat (ProjectID, Type, timeminet);`)
    db.run(`CREATE INDEX IF NOT EXISTS idx_ViewsCHATSTAGE_chatID_user
ON ViewsCHATSTAGE (chatID, userName);`)

    db.run(`CREATE INDEX IF NOT EXISTS idx_ViewsCHATSTAGE_chatID
ON ViewsCHATSTAGE (chatID);`)

    db.run(`CREATE INDEX IF NOT EXISTS idx_Navigation_ProjectID_DateDay
ON Navigation (ProjectID, DateDay);`)

    db.run(`CREATE INDEX IF NOT EXISTS idx_Navigation_ProjectID_id
ON Navigation (ProjectID, id);`)

    db.run(`CREATE INDEX IF NOT EXISTS idx_ChatSTAGE_ProjectID_StageID
ON ChatSTAGE (ProjectID, StageID);`)

    db.run(`CREATE INDEX IF NOT EXISTS idx_ChatSTAGE_ProjectID_StageID_timeminet
ON ChatSTAGE (ProjectID, StageID, timeminet);`)
    db.run(`CREATE INDEX IF NOT EXISTS idx_Chat_ProjectID_Type
ON Chat (ProjectID, Type);`)



    db.run(`CREATE INDEX IF NOT EXISTS idx_Views_chatID_user
ON Views (chatID, userName);`)

    db.run(`CREATE INDEX IF NOT EXISTS idx_Views_chatID
ON Views (chatID);`)



    db.run(`
CREATE INDEX IF NOT EXISTS idx_Navigation_IDCompanySub_DateDay
ON Navigation (IDCompanySub, DateDay);`)

    db.run(`CREATE INDEX IF NOT EXISTS idx_Navigation_IDCompanySub_id
ON Navigation (IDCompanySub, id);`)



  // price = project_count * price_per_project
  // end_date = start_date + duration_in_months

  // db.run(`CREATE TABLE IF NOT EXISTS Invoice (id INTEGER PRIMARY KEY AUTOINCREMENT , IDCompany INTEGER NOT NULL , Amount DECIMAL NOT NULL ,Subscription_end_date DATE DEFAULT CURRENT_TIMESTAMP,State TEXT NULL )`);
  // console.log((100 / 30) * (30 - 25));

  // جديد

  // db.run(`
  //   ALTER TABLE LoginActivaty
  //   ADD COLUMN userID INTEGER NULL `)


  // قديم 
  // db.run(`
  //   ALTER TABLE StagesCUST
  //   ADD COLUMN Ratio TEXT NULL DEFAULT 0;`)
  // db.run(`
  //   ALTER TABLE StagesCUST
  //   ADD COLUMN attached TEXT NULL;`)
  // db.run(`
  //   ALTER TABLE StagesTemplet
  //   ADD COLUMN attached TEXT NULL;`)
  // db.run(`
  //   ALTER TABLE StagesTemplet
  //   ADD COLUMN IDCompany INTEGER NOT NULL DEFAULT 1;`)
  // db.run(`
  //   ALTER TABLE StagesTemplet
  //   ADD COLUMN Ratio INTEGER NOT NULL DEFAULT 0;`)
  // db.run(`
  //   ALTER TABLE StagesSubTemplet
  //   ADD COLUMN IDCompany INTEGER NOT NULL DEFAULT 1;`)
  // db.run(`
  //   ALTER TABLE StagesTemplet
  //   ADD COLUMN Stagestype_id INTEGER  NULL ;`)
  // db.run(`
  //   ALTER TABLE StagesSubTemplet
  //   ADD COLUMN Stagestype_id INTEGER  NULL ;`)

  // db.run(`
  //   ALTER TABLE company
  //   ADD COLUMN State TEXT NULL DEFAULT 'true';`)
  // db.run(`
  //   ALTER TABLE company
  //   ADD COLUMN Suptype TEXT NULL DEFAULT 'مجاني';`)

  //  db.run( `ALTER TABLE company ADD COLUMN usertype TEXT NULL DEFAULT 'شركات'`);
  //  db.run(`
  //     ALTER TABLE  StagesSub
  //     ADD COLUMN attached TEXT NULL `)
  // db.run(`
  //   ALTER TABLE subscripation
  //   ADD COLUMN price DECIMAL;`)

  // db.run(`
  //   ALTER TABLE StagesCUST
  //   ADD COLUMN Referencenumber INTEGER NULL;`)

  //
  // db.run(`
  //   ALTER TABLE companySubprojects
  //   ADD COLUMN Project_Space INTEGER NULL DEFAULT 0`);
  // db.run(`
  //   ALTER TABLE companySubprojects
  //   ADD COLUMN Cost_per_Square_Meter DECIMAL NULL DEFAULT 0`);
  // db.run(`
  //   ALTER TABLE companySubprojectsAudite
  //   ADD COLUMN Project_Space INTEGER NULL DEFAULT 0`);
  // db.run(`
  //   ALTER TABLE companySubprojectsAudite
  //   ADD COLUMN Cost_per_Square_Meter DECIMAL NULL DEFAULT 0`);
};

// const createtabletTemplet =()=>{
//   dbd.run(
//     `CREATE TABLE IF NOT EXISTS StagesTemplet(StageID INTEGER PRIMARY KEY AUTOINCREMENT,Type nvarchar[50] NULL,StageName nvarchar[max] NOT NULL , Days INTEGER NULL,StartDate TEXT  NULL, EndDate TEXT NULL ,CloseDate TEXT NULL , OrderBy INTEGER NULL
//   )`
//   );

//   dbd.run(
//     `CREATE TABLE IF NOT EXISTS StagesSubTemplet(StageSubID INTEGER PRIMARY KEY AUTOINCREMENT,StageID INTEGER NULL,ProjectID INTEGER NULL ,StageSubName nvarchar[max] NULL,ImageAttachment TEXT NULL , CloseDate TEXT NULL)`
//   );
// }

//   db.run(`
//     ALTER TABLE Expense
//     ADD COLUMN Amount2 DECIMAL(18,2) NULL;`)
//   db.run(`
//     ALTER TABLE Expense
//     ADD COLUMN Referencenumberfinanc INTEGER NULL;`)
//   db.run(`
//     ALTER TABLE Revenue
//     ADD COLUMN Referencenumberfinanc INTEGER NULL;`)
//   db.run(`
//     ALTER TABLE Revenue
//     ADD COLUMN Referencenumberfinanc INTEGER NULL;`)
//   db.run(`
//     ALTER TABLE Returns
//     ADD COLUMN Referencenumberfinanc INTEGER NULL;`)

// db.run(`
//   ALTER TABLE companySubprojects
//   ADD COLUMN cost INTEGER NULL `)
// db.run(`
//   ALTER TABLE companySubprojects
//   ADD COLUMN rate INTEGER NULL `)
// db.run(`
//   ALTER TABLE companySubprojects
//   ADD COLUMN countuser INTEGER NULL  `)
// db.run(`
//   ALTER TABLE StagesCUST
//   ADD COLUMN rate DATE NULL ;`  )

// db.run(`
//   ALTER TABLE Requests
//   ADD COLUMN DateTime DATE NULL ;`  )

module.exports = { CreateTable };

// `DECLARE @DAYS nvarchar(50)
// DECLARE @DAYSOFStage int

// set @DAYSOFStage =(select sum(Days) from [StagesCUST] where ProjectID = 2)
// set @DAYS= (select ProjectStartdate from [companySubprojects] where id = 2)
// IF @DAYS is null
//     SELECT @DAYSOFStage as 'الناتج';
// ELSE
// SELECT DATEDIFF(day, getdate(),DATEADD(day, @DAYSOFStage, ProjectStartdate)) as 'الناتج' from [companySubprojects]  where  id= 2`
