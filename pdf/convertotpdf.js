const puppeteer = require("puppeteer");
const {
  SELECTdataprojectandbrinshandcompany,
  SELECTTablecompanySubProjectexpense,
  SELECTTablecompanySubProjectREVENUE,
  SELECTTablecompanySubProjectReturned,
  SELECTSUMAmountandBring,
} = require("../sql/selected/selected");
const { HtmlContent, HtmlStatmentall, HtmlStatmentallRequests, HTMLStatmentFinancialCustody, HtmlStatmentStage, Html_report_prepare } = require("./writHtml");
const path = require('path');
//  كشف حساب كامل للمصروفات
const StatmentExpensePdf = async (idproject, namefile) => {
  const dataHome = await SELECTdataprojectandbrinshandcompany(idproject);
  const dataSub = await SELECTTablecompanySubProjectexpense(idproject,'pdf');
  const dates = dataSub.map((item) => item.ClassificationName);

  const uniqueDates = [...new Set(dates)];

  const matrix = uniqueDates.map((date) => {
    const filteredItems = dataSub.filter(
      (item) => item.ClassificationName === date
    );

    return {
      ClassificationName: date,
      total: filteredItems.reduce((acc, current) => acc + current.Amount, 0),
      items: filteredItems,
    };
  });
  const htmlContent = await HtmlContent(matrix, dataHome);

  await convertHtmlToPdf(htmlContent, namefile);
};

//  كشف حسب التصنيف

const StatmentAllpdf = async (idproject, namefile) => {
  try {
    const dataHome = await SELECTdataprojectandbrinshandcompany(idproject);
    const dataExpense = await SELECTTablecompanySubProjectexpense(idproject,'pdf');
    const dataRevenue = await SELECTTablecompanySubProjectREVENUE(idproject,0,'pdf');
    const dataReturned = await SELECTTablecompanySubProjectReturned(idproject,0,'pdf');
    const Totalproject = await SELECTSUMAmountandBring(idproject);

    const htmlContent = await HtmlStatmentall(
      dataExpense,
      dataRevenue,
      dataReturned,
      Totalproject,
      dataHome
    );
    await convertHtmlToPdf(htmlContent, namefile);
  } catch (error) {
    console.log(error);
  }
};

async function convertHtmlToPdf(htmlContent, outputPath) {

const browser = await puppeteer.launch({
  headless: true,
  // لو تُشغّل في سيرفر/حاوية أضف التالي لتقليل الأعطال:
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  // executablePath: '/path/to/chrome' // لو كنت تستخدم puppeteer-core بدون Chromium مدمج
});

const page = await browser.newPage();

// ألغِ كل المهلات الافتراضية (يشمل pdf())
page.setDefaultTimeout(0);
page.setDefaultNavigationTimeout(0);

// حمّل الـ HTML
await page.setContent(htmlContent, {
  waitUntil: 'load',   // بدّل domcontentloaded إلى load
  timeout: 0           // لا مهلة
});

// انتظر الصور + الخطوط بشكل مضمون

  await waitForFontsAndImages(page);

// اطبع PDF
await page.emulateMediaType('print'); // أو 'screen' حسب CSS عندك
await page.pdf({
  path: outputPath,
  format: 'A4',
  printBackground: true,
  preferCSSPageSize: true, // احترم @page إن موجود
  margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
});

await browser.close();


}
 

// report-batched.js  (CommonJS)
const fs = require('node:fs/promises');
const { PDFDocument } = require('pdf-lib');
const { Select_report_prepare } = require("../sql/selected/selectuser");
const { sanitizeFilename } = require("../middleware/Aid");

/* أدوات مساعدة */
const htmlEscape = (v) =>
  String(v ?? '-')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

async function waitForFontsAndImages(page) {
  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) {
      try { await document.fonts.ready; } catch {}
    }
    const imgs = Array.from(document.images || []);
    await Promise.all(imgs.map(img => {
      if (img.decode) return img.decode().catch(() => {});
      if (img.complete) return Promise.resolve();
      return new Promise(res => {
        img.addEventListener('load', () => res(), { once: true });
        img.addEventListener('error', () => res(), { once: true });
      });
    }));
    await new Promise(r => setTimeout(r, 500));
  });
}

/* تقسيم عناصر المشروع حسب النوع */
function separationOfTypes(items) {
  const map = new Map();
  for (const it of items) {
    const key = it.Type ?? '-';
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(it);
  }
  return Array.from(map.entries()).map(([Type, arr]) => ({
    Type,
    itemsSub: arr,
    total: arr.length || 1
  }));
}

/* يبني صفوف الجدول لدفعة واحدة */
function buildRowsForBatch(batch) {
  let rows = '';

  for (const p of batch) {
    // p.items من الاستعلام غالباً نص JSON:
    const items = Array.isArray(p.items) ? p.items : JSON.parse(p.items || '[]');
    const groups = separationOfTypes(items);
    const totalRowsForProject = items.length || 1;

    let projectCellPrinted = false;

    // لكل نوع داخل المشروع
    for (const g of groups) {
      let typeCellPrinted = false;

      if (g.itemsSub.length === 0) {
        rows += `<tr>
          ${!projectCellPrinted ? `<th rowspan="1">${htmlEscape(p.project_name)}</th>` : ''}
          ${!typeCellPrinted ? `<th rowspan="1">${htmlEscape(g.Type)}</th>` : ''}
          <td class="wrap-text">-</td>
          <td class="wrap-text">-</td>
          <td class="wrap-text">-</td>
          <td class="wrap-text">-</td>
          <td class="wrap-text">-</td>
          <td class="wrap-text">-</td>
        </tr>`;
        projectCellPrinted = true;
        typeCellPrinted = true;
        continue;
      }

      for (const t of g.itemsSub) {
        rows += `<tr>
          ${!projectCellPrinted ? `<th rowspan="${totalRowsForProject}">${htmlEscape(p.project_name)}</th>` : ''}
          ${!typeCellPrinted ? `<th rowspan="${g.total}">${htmlEscape(g.Type)}</th>` : ''}

          <td class="wrap-text">${htmlEscape(t.Implementedby)}</td>
          <td class="wrap-text">${htmlEscape(t.InsertBy)}</td>
          <td class="wrap-text">${htmlEscape(t.checkorderout)}</td>
          <td class="wrap-text">${htmlEscape(t.Done)}</td>
          <td class="wrap-text">${htmlEscape(t.Date)}</td>
          <td class="wrap-text">${htmlEscape(t.Data)}</td>
        </tr>`;

        projectCellPrinted = true;
        typeCellPrinted = true;
      }
    }
  }

  return rows;
}



/* يطبع دفعة واحدة إلى PDF Buffer */
async function renderOnePdf(page, html, { landscape = false } = {}) {
  await page.setContent(html, { waitUntil: 'load', timeout: 0 });
  await waitForFontsAndImages(page);
  await page.emulateMediaType('print');
  const buf = await page.pdf({
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    landscape,
    margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
  });
  return buf;
}

/* دمج Buffers */
async function mergePdfBuffers(buffers) {
  const merged = await PDFDocument.create();
  for (const buf of buffers) {
    const src = await PDFDocument.load(buf);
    const pages = await merged.copyPages(src, src.getPageIndices());
    pages.forEach(p => merged.addPage(p));
  }
  return await merged.save();
}

/**
 * الدالة الرئيسية:
 * result: مصفوفة من صفوف المشاريع (project_id, project_name, items كـ JSON string)
 * count, company: كما في كودك
 * chunkSize: كم مشروع في كل دفعة (غالباً 20-50 مناسب، عدّل حسب الحجم)
 */
async function generateRequestsReportPDF({ result, count, company, outputPath = './report.pdf', chunkSize = 300, landscape = false, type="all", executablePath = null }) {
  const parts = chunk(result, chunkSize);
  const pdfBuffers = [];

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    ...(executablePath ? { executablePath } : {})
  });

  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(0);
    page.setDefaultNavigationTimeout(0);
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });

    


    for (let i = 0; i < parts.length; i++) {
      const batch = parts[i];
      let html
      if(String(type).includes('FinancialCustody')){
        html = HTMLStatmentFinancialCustody(batch, count, company);
      }else{
        html = HtmlStatmentallRequests(batch, count, company,type);
      };
      const buf = await renderOnePdf(page, html, { landscape });
      pdfBuffers.push(buf);
    };
    const merged = await mergePdfBuffers(pdfBuffers);
    await fs.writeFile(outputPath, merged);
    return { chunks: parts.length, outputPath, bytes: merged.length };
  } finally {
    await browser.close();
  };
};




const convert_report_prepare =async () =>{
  const result = await Select_report_prepare();
  console.log(result);
  const html = await Html_report_prepare(result);
  let namefile = `${sanitizeFilename(result[0].Sender)}__report_prepare.pdf`;

  const filePath = path.join(__dirname, "../upload", namefile);
  
  convertHtmlToPdf(html,filePath)
};
// convert_report_prepare()

module.exports = { convertHtmlToPdf, StatmentExpensePdf, StatmentAllpdf,generateRequestsReportPDF };
