
// redis-server.exe
// PS D:\ppp\aldy\Purebred_horses\38\backend> Set-ExecutionPolicy -ExecutionPolicy
//  Bypass -Scope Process
// Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypas

// {"uri":"file:///data/user/0/com.musharaf/cache/639fdb6a-cb9d-4b3f-8fc2-588e8dbb6fd2.mp4","uriImage":"","name":"5024645301744614590110-mrousavy894299404789797299.mov","type":"video/quicktime","size":"142.91 MB","location":{"latitude":24.8704664,"longitude":46.6504611}}

// https://www.youtube.com/watch?v=sTDVsMUegL8
// https://www.youtube.com/watch?v=XbFQj7NYjZQ

const { express, app, server, io } = require("./importMIn");

const cors = require("cors");
const bodyParser = require("body-parser");
const cookieparser = require("cookie-parser");
const session = require("express-session");
const helmet = require("helmet");
const errorHandler = require("./middleware/errorHandler");
const { deleteFilesInFolder } = require("./middleware/Fsfile");
const { CreateTable } = require("./sql/createteble");
const { ChatOpration } = require("./src/modules/chat/ChatJobs");
const {  handleUploadErrors } = require("./middleware/uploads");
const {  bucket } = require("./bucketClooud");
const limiter = require("./middleware/loginLimiter.js");
const { Queue } = require("bullmq");
const IORedis = require('ioredis');
const config = require("./config.js");
const { ExpressAdapter } = require("@bull-board/express");
const { BullMQAdapter } = require("@bull-board/api/bullMQAdapter.js");
const { createBullBoard } = require("@bull-board/api");
const { companySub } = require("./routes/companySub");
const company = require("./routes/company");
const postpublic = require("./routes/postpublic");
const chatroute = require("./routes/chatroute");
const usersCompany = require("./routes/usersCompany");
const Login = require("./routes/login");
const apiMoshrif = require("./routes/apiMoshrif");
const HR = require("./routes/HR.js");
const Templet = require("./routes/Templet.js");
const simpleCompanies = require("./DashbordMoshrif/simple-companies");
const simpleAuth = require("./DashbordMoshrif/simple-auth");
const simpleDashboard = require("./DashbordMoshrif/simple-dashboard");
const loginActivity = require("./DashbordMoshrif/loginActivity");
const cron = require("node-cron");
const promClient = require('prom-client');

require("dotenv").config();
const path = require("path");

const {
  verificationSend,
} = require("./src/modules/companies/select/userCompanyselect");
const subScription = require("./routes/subScription.js");
const db = require("./sql/sqlite.js");
const payment_route = require("./routes/payment_route.js");
const { UpdateState_Comany_all } = require("./sql/update.js");
const { initChatPrivateNamespace } = require("./src/modules/chat/Private_chat/chat-private.js");

// ---- Logging --------------------------------------------------------------
// app.use(
//   pinoHttp({
//     transport: process.env.NODE_ENV === 'production' ? undefined : { target: 'pino-pretty' },
//   })
// );

// ---- Metrics --------------------------------------------------------------
promClient.collectDefaultMetrics();
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

// ---- Health ---------------------------------------------------------------
app.get('/health', (_req, res) => res.status(200).json({ ok: true, status: 'up' }));

// "ready" does a lightweight DB check
app.get('/ready', async (_req, res) => {
  try {
    const db = require('./sql/sqlite');
    // Works for both sqlite+pg adapter
    await db.getRow('SELECT 1 as ok');
    res.status(200).json({ ok: true, status: 'ready' });
  } catch (e) {
    res.status(503).json({ ok: false, status: 'not_ready', error: String(e?.message || e) });
  }
});

// Set up middlewares
app.use(cors({ origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : true, credentials: true }));
app.use(express.urlencoded({ extended: false })); // ✅ عشان x-www-form-urlencoded

app.use(express.json());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "https://mushrf.net"],
    },
  })
);

app.use(cookieparser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/upload", express.static("upload"));
app.use(express.static(path.join(__dirname, "/build")));

app.use(
  session({
    secret: process.env.SECRET,
    cookie: { httpOnly: true },
    resave: false,
    saveUninitialized: false,
  })
);

const PORT = process.env.PORT || config.port || 8080;

const redisConnection = new IORedis(config.redis);

const uploadQueue = new Queue("project-requests", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 10, // Reduced attempts to 10 for less retries
    backoff: {
      type: "exponential",
      delay: 2000, // Reduced initial delay to 2 seconds for faster retry
    },
    removeOnComplete: true, // Automatically remove successful jobs to free memory
    removeOnFail: false, // Keep failed jobs for diagnostics
  },
});

// Set up Bull Board for queue monitoring
const serverAdapter = new ExpressAdapter();
createBullBoard({
  queues: [new BullMQAdapter(uploadQueue)],
  serverAdapter,
});
serverAdapter.setBasePath("/admin/queues");
app.use("/admin/queues", serverAdapter.getRouter());

// app.use("/", require("./routes/root"));

// الربط المالي
app.use("/apis/company", apiMoshrif({ uploadQueue }));
app.use("/api/auth", Login({ uploadQueue }));
app.use("/api/user", usersCompany({ uploadQueue }));
app.use("/api/company", company({ uploadQueue }));

app.use("/api/brinshCompany", companySub({ uploadQueue }));
app.use("/api/posts", postpublic({ uploadQueue }));
app.use("/api/Chate", chatroute({ uploadQueue }));
app.use("/api/HR", HR({ uploadQueue }));
app.use("/api/Templet", Templet({ uploadQueue }));
app.use("/api/subScription", subScription({ uploadQueue }));
app.use("/api/payments", payment_route({ uploadQueue }));
app.use("/Maintenance", require("./systemUpdate.js"));
// app.use("/api/dashbord", require("./routes/DashbordMoshrif"));

// تسجيل الـ routes
app.use("/api/dashbord/auth", simpleAuth);
app.use("/api/companies", simpleCompanies);
app.use("/api/dashboard", simpleDashboard);
app.use("/api/login-activity", loginActivity);

// لاستقبال الملفات والصور
app.post("/companies/delete", async (req, res) => {
  const { id, phone, reason } = req.body;
  if (
    String(id).length > 0 &&
    String(phone).length > 0 &&
    String(reason).length > 0
  ) {
    res
      .send({
        ok: true,
        message: "طلبك قيد المراجعه سوف يتم ابلاغك عند اتمام عملية الحذف",
      })
      .status(200);
  } else {
    res.send({ ok: true, message: "نرجو اكمال البيانات " }).status(200);
  }
});


app.get("/UploadDatabase", async (req, res) => {
  try {
    await bucket.upload("./mydatabase.db");
    res.send({ success: "تمت العملية بنجاح" }).status(200);
  } catch (error) {
    console.log(error);
    res.send({ success: "فشل تنفيذ العملية" }).status(200);
  }
});
// لحذف الملفات
app.get("/deleteFileUpload", async (req, res) => {
  try {
    deleteFilesInFolder("./upload");
    res.send({ success: "تمت العملية بنجاح" }).status(200);
  } catch (error) {
    console.log(error);
    res.send({ success: "فشل تنفيذ العملية" }).status(200);
  }
});


app.get('/deleteStage',async(req,res)=>{
  const {id} = req.query;
         db.serialize(function () {
          db.run(
            `DELETE FROM StagesSub WHERE ProjectID=?`,[id],
     
            function (err) {
              if (err) {
                console.error(err.message);
              }
              // console.log(`Row with the ID ${this.lastID} has been inserted.`);
            }
          );
        });
            res.send({ success: "تمت العملية بنجاح" }).status(200);

})


// app.use(clickpayRawBodyMiddleware)

CreateTable();

app.use(limiter);

app.use(errorHandler);

app.all("*", (req, res) => {
  if (req.accepts("html")) {
    res.status(404);
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

const redis = new IORedis(config.redis);

const persistQueue = new Queue('chat_persist', { connection: redis });

initChatPrivateNamespace(io, redis, persistQueue);

io.on("connection", (socket) => {
  socket.on("newRome", (nameroom) => {
    socket.join(nameroom);
  });

  ChatOpration(socket, io);
  // ChatOprationView(socket, io);
  socket.on("disconnect", (data) => {});
});


// Error handling middleware
app.use(handleUploadErrors);



// ---- Cron jobs (disable in multi-instance deployments by setting RUN_CRON=false)
  // Runs daily at 00:00
  cron.schedule("0 0 * * *", async () => {
    // If you're on PostgreSQL, prefer pg_dump from a managed job; keep this legacy backup for sqlite.
    try {
      await bucket.upload("./mydatabase.db");
    } catch {}
    verificationSend(
      "502464530",
      null,
      "⏰ تشغيل التحقق اليومي من الاشتراكات..."
    );
    await UpdateState_Comany_all();
  });





const httpServer = server.listen(PORT, () => {
  console.log(`✅ Server listening on :${PORT}`);
});

// ---- Graceful shutdown -----------------------------------------------------
async function shutdown(signal) {
  try {
    // console.log(`\n${signal} received. Shutting down...`);
    httpServer.close(() => console.log('HTTP server closed'));
    try { await redisConnection.quit(); } catch {}
    try { await db.close?.(); } catch {}
  } finally {
    process.exit(0);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
