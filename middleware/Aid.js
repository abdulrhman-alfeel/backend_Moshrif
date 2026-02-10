const {
  inserttableFlowmove,
  insertTablecompanySubProjectStagetemplet,
  insertTablecompanySubProjectStageSubtemplet,
  insertTablecompanySubProjectStageCUSTv2,
  insertTableusersBransh,
  insertTableusersProject,
} = require("../sql/INsertteble");
const { DateTime } = require("luxon");
const moment = require("moment-timezone");

require("dotenv").config();
const crypto = require("crypto");




function roomKey (ProjectID,StageID){
      const sortedIds = [ProjectID,StageID].sort();
    const roomKeys = `${sortedIds[0]}:${sortedIds[1]}`;
    return roomKeys
}


function View_type (chate_type) {
       
  let view_type =
        chate_type === 'Chat_private'
          ? 'Views_Private'
          : chate_type === 'Chat_project'
            ? 'Views_Project'
            : null;

    return view_type
}


// أبجدية مناسبة (تقدر تغيّرها)
// لاحظ: حذفت O و 0 و I و 1 لتقليل اللبس (اختياري)

function randomChars(len, alphabet = process.env.ALPHABET) {
  let out = "";
  for (let i = 0; i < len; i++) {
    const idx = crypto.randomInt(0, alphabet.length); // unbiased
    out += alphabet[idx];
  }
  return out;
}

/**
 * generateSubscriptionCode("MOSHRIF", [4,4,4])
 * => MOSHRIF-AB12-CD34-EF56
 */
function generateSubscriptionCode(prefix = "MOSHRIF", groups = [5, 5, 4]) {
  const parts = groups.map((n) => randomChars(n));
  return `${prefix}-${parts.join("-")}`;
}

// مثال
// console.log(generateSubscriptionCode("MOSHRIF", [4, 4, 4]));

const convertArabicToEnglish = (arabicNumber) => {
  const arabicToEnglishMap = {
    "٠": "0",
    "١": "1",
    "٢": "2",
    "٣": "3",
    "٤": "4",
    "٥": "5",
    "٦": "6",
    "٧": "7",
    "٨": "8",
    "٩": "9",
  };
  const inputString =
    typeof arabicNumber === "string" ? arabicNumber : String(arabicNumber);
  return inputString
    .split("")
    .map((char) => arabicToEnglishMap[char] || char)
    .join("");
};

function isDigits(str) {
  return /^\d+$/.test(str);
}

function isExactDigits(str, n) {
  return new RegExp(`^\\d{${n}}$`).test(str);
}

function isNonEmpty(str) {
  return String(str || "").trim().length > 0;
}

function lenBetween(str, min, max) {
  const l = String(str || "").trim().length;
  return l >= min && l <= max;
}

function isEmail(v) {
  // بسيط ومعتدل
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v));
}

function isValidLocalPhone9(v) {
  return /^\d{9}$/.test(String(v || ""));
}

function isValidUrl(v) {
  try {
    const u = new URL(String(v));
    return /^https?:$/.test(u.protocol) && !!u.hostname;
  } catch {
    return false;
  }
}
function isHttpUrl(s) {
  const str = String(s ?? "").trim();
  return /^https?:\/\/[^\s]+$/i.test(str);
}

function parseAmount(input) {
  if (input == null) return NaN;
  let s = convertArabicToEnglish(input);
  s = s.replace(/[^\d.,]/g, ""); // إزالة أي رموز
  s = s.replace(/،/g, ","); // فاصلة عربية
  s = s.replace(/٫/g, "."); // نقطة عربية
  s = s.replace(/,/g, ""); // إزالة الفواصل
  const n = parseFloat(s);
  return Number.isFinite(n) ? +n.toFixed(2) : NaN;
}

function parseRatio(v) {
  const s = convertArabicToEnglish(v)
    .replace(/،/g, ",")
    .replace(/٫/g, ".")
    .replace(/,/g, "");
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}
function onlyDateISO(d) {
  const z = new Date(d);
  if (isNaN(+z)) return null;
  return new Date(Date.UTC(z.getFullYear(), z.getMonth(), z.getDate()))
    .toISOString()
    .split("T")[0];
}

function parseNonNegativeInt(v) {
  const s = convertArabicToEnglish(v).replace(/\D/g, "");
  if (s === "") return NaN;
  const n = Number(s);
  return Number.isInteger(n) && n >= 0 ? n : NaN;
}

function parsePositiveInt(v) {
  const s = convertArabicToEnglish(v);
  if (!isDigits(s)) return NaN;
  const n = Number(s);
  return Number.isInteger(n) && n > 0 ? n : NaN;
}
function parseNonNegativeFloat(v) {
  if (v == null || v === "") return NaN;
  let s = convertArabicToEnglish(v);
  s = s.replace(/،/g, ",").replace(/٫/g, "."); // دعم الفواصل العربية
  s = s.replace(/,/g, "");
  const n = parseFloat(s);
  return Number.isFinite(n) && n >= 0 ? +n : NaN;
}

function parseRatio0to100(v) {
  if (v === undefined || v === null || String(v).trim() === "") return NaN;
  let s = convertArabicToEnglish(v)
    .replace(/،/g, ",")
    .replace(/٫/g, ".")
    .replace(/,/g, "");
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 && n <= 100 ? n : NaN;
}
function sanitizeFilename(name) {
  return String(name || "")
    .replace(/[\0<>:"/\\|?*\u0000-\u001F]+/g, "") // محارف غير صالحة
    .replace(/\s+/g, " ")
    .trim();
}
function sanitizeFolderName(name) {
  // السماح بحروف عربية/إنجليزية، أرقام، مسافة، شرطة/شرطة سفلية، أقواس، نقطة، &
  return String(name || "")
    .replace(/[^A-Za-z0-9\u0600-\u06FF\s\-_().&]/g, "") // إزالة المحارف غير المسموح بها
    .replace(/\s+/g, " ") // مسافات متتالية -> مسافة واحدة
    .trim()
    .replace(/^[.\-_\s]+|[.\-_\s]+$/g, ""); // إزالة محارف غير مرغوبة من البداية/النهاية
}

function sanitizeName(name) {
  // السماح بحروف عربية/إنجليزية، أرقام، مسافة، - _ . ( ) &
  return String(name || "")
    .replace(/[^A-Za-z0-9\u0600-\u06FF\s\-_().&]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^[.\-_\s]+|[.\-_\s]+$/g, "");
}
function collectSingleFile(req) {
  if (req.file) return req.file;
  if (Array.isArray(req.files) && req.files.length) return req.files[0];
  if (req.files && typeof req.files === "object") {
    const values = Object.values(req.files).flat();
    return values[0];
  }
  return null;
}
function collectFiles(req) {
  if (Array.isArray(req.files)) return req.files;
  if (req.files && typeof req.files === "object")
    return Object.values(req.files).flat();
  return [];
}

function normalizePhone(raw) {
  // يدعم 05XXXXXXXX أو 9665XXXXXXXX → 5XXXXXXXX
  let d = convertArabicToEnglish(raw).replace(/\D/g, "");
  if (d.startsWith("966")) d = d.slice(3);
  if (d.startsWith("0")) d = d.slice(1);
  return d; // نتوقع 9 أرقام محلية
}

function isMeaningfulNote(v) {
  const s = String(v ?? "")
    .trim()
    .toLowerCase();
  return s.length > 0 && s !== "null" && s !== "undefined";
}

function ensureIdArray(val) {
  // يقبل: Array | "1,2,3" | رقم واحد | undefined
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    const s = val.trim();
    if (!s) return [];
    return s.split(",").map((x) => x.trim());
  }
  if (typeof val === "number") return [val];
  return [];
}
function normalizeIds(arr) {
  const out = [];
  const seen = new Set();
  for (const v of ensureIdArray(arr)) {
    const n = parsePositiveInt(v);
    if (Number.isFinite(n) && !seen.has(n)) {
      seen.add(n);
      out.push(n);
    }
  }
  return out;
}

function tryParseDateISO(v) {
  // يحاول تحويل المدخل إلى YYYY-MM-DD (اختياري)
  if (!isNonEmpty(v)) return null;
  const s = convertArabicToEnglish(v).trim();
  // يدعم: YYYY-MM-DD أو DD/MM/YYYY
  let d;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    d = new Date(s + "T00:00:00");
  } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    const [dd, mm, yyyy] = s.split("/");
    d = new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
  } else {
    d = new Date(s); // محاولة أخيرة
  }
  if (isNaN(+d)) return null;
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
    .toISOString()
    .split("T")[0];
}

const verificationfromdata = async (array) => {
  try {
    let count = 0;
    for (let index = 0; index < array.length; index++) {
      const element = array[index];
      // console.log(String(element).trim());
      if (String(element).trim().length > 0) {
        count++;
      }
      if (count === array.length) {
        return true;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

// Function to calculate hours between two timestamps
function calculateHoursBetween(startTime, endTime) {
  // Parse the timestamps into Date objects
  const start = new Date(startTime);
  const end = new Date(endTime);

  // Calculate the difference in milliseconds
  const diffMs = end - start;
  // Convert milliseconds to hours
  const diffHours = diffMs / (1000 * 60 * 60);

  return diffHours;
}

// دالة لحساب فارق الأيام
function calculateDaysDifference(date1, date2) {
  const date1Obj = new Date(date1);
  const date2Obj = new Date(date2);

  // حساب الفرق بالميلي ثانية
  const diffTime = Math.abs(date2Obj - date1Obj);
  return Math.ceil(diffTime / (1000 * 3600 * 24)); // تحويل الميلي ثانية إلى أيام
}

const esc = (v) =>
  String(v ?? "-")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

function calculateendDate(time = new Date()) {
  const today = new Date(time);
  const year = today.getFullYear();
  const month = today.getMonth();
  // نجيب اليوم الأخير (اليوم 0 من الشهر القادم هو آخر يوم في الشهر الحالي)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return daysInMonth;
}

function calculateAcountsubscripation(subscripatiion) {
  const daysInMonth = calculateendDate();
  return subscripatiion / daysInMonth;
}

const dates = (time) => (String(time).length > 1 ? time : `0${time}`);
const DateDay = (date) =>
  `${date.getUTCFullYear()}-${dates(date.getUTCMonth() + 1)}-${dates(
    date.getUTCDate()
  )}`;


const ChangeDate = (teble, StartDate) => {
  const d3Value = new Date(StartDate); // replace with your D3.Value
  const newData = [...teble];

  newData[0].StartDate = d3Value.toDateString();
  const dataend = new Date(
    d3Value.setDate(d3Value.getDate() + newData[0].Days)
  );
  newData[0].EndDate = dataend.toDateString();
  newData[0].OrderBy = 1;

  for (let i = 1; i < newData.length; i++) {
    newData[i].OrderBy = newData[i - 1].OrderBy + 1;
    newData[i].StartDate = new Date(newData[i - 1].EndDate).toDateString();
    const datanextEnd = new Date(
      d3Value.setDate(
        new Date(newData[i].StartDate).getDate() + newData[i].Days
      )
    );
    newData[i].EndDate = datanextEnd.toDateString();
  }
  return newData;
};


const subscripation = {
  company: 100,
  singular: 150,
};

// وظيفة ادخال البيانات في جدوول المراحل  الرئيسي
const Stage = async (teble, StartDate, types = "new") => {
  try {
    // let count = 2;
    // let Days = 5;

    // const futureDate = new Date(currentDate);
    // futureDate.setDate(currentDate.getDate() + 5);
    // console.log(newData,'helllow');

    const newData = await ChangeDate(teble, StartDate);
    for (let index = 0; index < newData.length; index++) {
      const item = teble[index];
      let number = types === "new" ? `(${index + 1})` : "";
    
      await insertTablecompanySubProjectStageCUSTv2([
        item.StageID,
        item.ProjectID,
        item.Type,
        `${item.StageName} ${number}`,
        item.Days,
        moment(item.StartDate).format("YYYY-MM-DD"),
        moment(item.EndDate).format("YYYY-MM-DD"),
        item.OrderBy,
        item.Referencenumber,
        item.Ratio,
        item.attached,
        item.rate,
      ]);
    }
  } catch (err) {}
};

// حساب الايام للمراحل المشروع
const AccountDays = (numberBuilding, Days) => {
  try {
    let s;
    numberBuilding === 1
      ? (s = 1)
      : numberBuilding === 2
      ? (s = 1.5)
      : numberBuilding === 3
      ? (s = 2)
      : numberBuilding === 4
      ? (s = 2.5)
      : numberBuilding === 5
      ? (s = 3)
      : numberBuilding === 6
      ? (s = 3.5)
      : numberBuilding === 7
      ? (s = 4)
      : numberBuilding === 8
      ? (s = 4.5)
      : numberBuilding === 9
      ? (s = 5)
      : (s = 5.5);

    const count = Days * s;
    // return Math.round(count);
    return count;
  } catch (error) {
    console.log(error);
  }
};
const xlsx = require("xlsx");
const { SELECTTableusersCompanyall } = require("../sql/selected/selectuser");
// const { UPDATECONVERTDATE } = require("../sql/update");

const StageTempletXsl2 = async (
  type = "StagesTempletEXcel.xlsx",
  number = 0
) => {
  try {
    try {
      // Read the Excel file
      const workbook = xlsx.readFile(type);

      // Get the first sheet
      const sheetName = workbook.SheetNames[number];
      const worksheet = workbook.Sheets[sheetName];

      const datad = xlsx.utils.sheet_to_json(worksheet);
      return datad;
    } catch (error) {
      console.error(error);
    }
  } catch (error) {
    console.log(error);
  }
};

const StageSubTempletXlsx = async (StageID) => {
  try {
    // Read the Excel file
    const workbook = xlsx.readFile("StagesSubTempletEXcel.xlsx");

    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Get the data from the sheet
    const data = xlsx.utils.sheet_to_json(worksheet);
    return data.filter((item) => item.StageID === StageID);
  } catch (error) {
    console.error(error);
  }
};

const insertStageinDatabase = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await StageTempletXsl2();
      if (data && data.length > 0) {
        for (const item of data) {
          await insertTablecompanySubProjectStagetemplet([
            item.StageID,
            item.Type,
            item.StageName,
            item.Days,
            item.OrderBy,
          ]);
        }
        const dataSub = await StageTempletXsl2("StagesSubTempletEXcel.xlsx");
        if (dataSub && dataSub.length > 0) {
          for (const item of dataSub) {
            await insertTablecompanySubProjectStageSubtemplet([
              item.StageID,
              item.StageSubName,
            ]);
          }
        }
        resolve(true);
      } else {
        reject(new Error("No data found in the Excel file."));
      }
    } catch (error) {}
  });
};

// insertStageinDatabase();

const StageTempletXsl = async (type, kind = "all") => {
  try {
    try {
      // Read the Excel file
      const workbook = xlsx.readFile("StagesTempletEXcel.xlsx");

      // Get the first sheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const datad = xlsx.utils.sheet_to_json(worksheet);
      if (kind === "all") {
        return datad.filter(
          (item) =>
            String(item.Type).replace(" ", "").trim() ===
            String(type).replace(" ", "").trim()
        );
      } else {
        return datad.find((item) => item.StageID === type);
      }
    } catch (error) {
      console.error(error);
    }
  } catch (error) {
    console.log(error);
  }
};
const Addusertraffic = async (userName, PhoneNumber, Movementtype) => {
  try {
    const data = [
      userName,
      PhoneNumber,
      Movementtype,
      `${new Date().toUTCString()}`,
    ];
    await inserttableFlowmove(data);
  } catch (error) {
    console.log(error);
  }
};

function switchWeek(nameDays) {
  const day = nameDays.trim();
  switch (day) {
    case "Saturday":
      return "السبت";
    case "Sunday":
      return "الاحد";
    case "Monday":
      return "الاثنين";
    case "Tuesday":
      return "الثلاثاء";
    case "Wednesday":
      return "الاربعاء";
    case "Thursday":
      return "الخميس";
    case "Friday":
      return "الجمعة";
    default:
      return "يوم غير معروف"; // Unknown day
  }
}

const converttimetotext = (time) => {
  const currentDate = DateTime.fromISO(time);
  const day = switchWeek(currentDate.toFormat("cccc"));
  return day;
};

// Function to switch the month name in Arabic
function switchMonth(nameMonth) {
  switch (nameMonth) {
    case "January":
      return "يناير";
    case "February":
      return "فبراير";
    case "March":
      return "مارس";
    case "April":
      return "ابريل";
    case "May":
      return "مايو";
    case "June":
      return "يونيو";
    case "July":
      return "يوليو";
    case "August":
      return "أغسطس";
    case "September":
      return "سبتمبر";
    case "October":
      return "أكتوبر";
    case "November":
      return "نوفمبر";
    case "December":
      return "ديسمبر";
    default:
      return "شهر غير معروف"; // Unknown month
  }
}

// Convert time to Arabic month name
const convertTimeToMonth = (time) => {
  const currentDate = DateTime.fromISO(time);
  const month = switchMonth(currentDate.toFormat("MMMM")); // Extracting the full month name
  return month;
};
function toISO(d = new Date()) {
  // UTC ISO (اليوم فقط)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();
}

const moveviltayeuseer = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await SELECTTableusersCompanyall();
      if (data && data.length > 0) {
        for (const item of data) {
          const validity = item.Validity ? JSON.parse(item.Validity) : [];
          for (const key of validity) {
            if (key.idBrinsh) {
              await insertTableusersBransh([key.idBrinsh, item.id, key.job]);
              for (const key2 of key.project) {
                if (key2.idProject) {
                  await insertTableusersProject([
                    key.idBrinsh,
                    key2.idProject,
                    item.id,
                    JSON.stringify(key2.ValidityProject),
                  ]);
                }
              }
            }
          }
        }
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (error) {
      reject(error);
    }
  });
};
// moveviltayeuseer()
// تحويل صيغة التاريخ
// UPDATECONVERTDATE("StartDate");
// اضافة المعرفات والانواع لجدول الانواع
// insertTableallStagestype();

module.exports = {
  calculateDaysDifference,
  Stage,
  AccountDays,
  StageTempletXsl,
  dates,
  DateDay,
  convertArabicToEnglish,
  verificationfromdata,
  calculateHoursBetween,
  Addusertraffic,
  StageSubTempletXlsx,
  subscripation,
  calculateAcountsubscripation,
  calculateendDate,
  switchWeek,
  converttimetotext,
  convertTimeToMonth,
  StageTempletXsl2,
  esc,
  isDigits,
  isExactDigits,
  isNonEmpty,
  lenBetween,
  isEmail,
  isValidUrl,
  parseAmount,
  parsePositiveInt,
  parseNonNegativeFloat,
  parseRatio,
  onlyDateISO,
  sanitizeFilename,
  sanitizeFolderName,
  isMeaningfulNote,
  normalizeIds,
  collectFiles,
  tryParseDateISO,
  sanitizeName,
  collectSingleFile,
  normalizePhone,
  isHttpUrl,
  parseNonNegativeInt,
  isValidLocalPhone9,
  toISO,
  parseRatio0to100,
  generateSubscriptionCode,
  roomKey,
  View_type
};
