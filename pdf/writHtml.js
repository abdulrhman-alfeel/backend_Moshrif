const { DateDay, converttimetotext, esc } = require("../middleware/Aid");

const Totaltofixt = (number) => {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(
    parseFloat(number)
  );
};
const moment = require("moment-timezone");

const Datetime = (time) => {
  // تحديد الوقت الحالي وتحويله للمنطقة الزمنية للمستخدم
  const formattedTime = moment(time).tz("Asia/Riyadh").format("hh:mm A");
  return formattedTime;
};
const styles = `
<Style>
  body{
      width: 95%;
      margin: auto;
      margin-top: 35px;
  }
  .page {
    width: 794px;
    /* height: 1123px; */
    margin: 0 auto;
    padding: 20px;
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    border: 1px dashed #2117fb;

  }
  .header {
    display: flex;
    justify-content:space-between;
    align-items: center;
    border: 2px dashed #2117fb;
    border-radius: 15px;
    padding: 10px;
  }
  .header1{
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: right;
    margin:10px
    /* border: 2px dashed black */
  }
  .header-left {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    /* border: 2px dashed black */
  }
  .text-header-right{
    font-family: "Tajawal", system-ui;
    font-size: 17px;
  }

  h1{
    font-family: "Tajawal", system-ui;
    font-size: 20px;
}
.header-medium{
    justify-content: center;
    align-items: center;
    text-align: center;
}
  .header-left img {
    width: 100px;
    height: 100px;
    margin-right: 10px;
  }
  .header-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    text-align: right;
  }
  .header-right p {
    margin: 0;
    font-size: 14px;
    
  }
  table {
  width: 98%;
  color: #333;
  font-family: Arial, sans-serif;
  font-size: 8px;
  text-align: left;
  padding: 5px;
  border-radius: 5px;
  border: 2px dashed #2117fb;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  margin: auto;
  margin-top: 10px;
  margin-bottom: 10px;
} 
table th {
background-color: #447dee;
color: #fff;
font-weight: bold;
font-family:'Tajawal';
font-size: 13px;
padding: 3px;
text-transform: uppercase;
border: 1px solid  #1b1818;
letter-spacing: 1px; 
text-align: center;
}

table td {
padding: 3px;
text-align: center;
font-family:'Tajawal';
font-size: 11px;
border: 1px solid  #1b1818;
font-weight: bold;
}
.wrap-text {
  white-space: normal;   /* السماح بالتفاف النص */
  word-wrap: break-word; /* يكسر الكلمة الطويلة */
  word-break: break-word;/* متوافق أكثر مع المتصفحات الحديثة */
  max-width: 200px;      /* (اختياري) لتحديد أقصى عرض للخلية */
}
  thead { display: table-header-group; }
</Style>
`;

const HtmlContent = (item, home) => {
  const html = `<!DOCTYPE html>
  <html lang="ar">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@100..900&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@200;300;400;500;700;800;900&display=swap" rel="stylesheet">

    <title>Document</title>
  </head>
    <!-- border-collapse: collapse; -->
  

  <Style>
    @font-face {
        font-family: 'Tajawal', sans-serif;
  font-optical-sizing: auto;
  font-weight: <weight>;
  font-style: normal;
  font-variation-settings:
    "wdth" 100;
    }
    body{
          font-family: 'Tajawal', sans-serif;
        width: 95%;
        margin: auto;
        margin-top: 35px;
    }
    .page {
      width: 794px;
      /* height: 1123px; */
      margin: 0 auto;
      padding: 20px;
      background-color: #fff;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      border-radius: 5px;
      border: 1px dashed #2117fb;
  
    }
    .header {
      display: flex;
      justify-content:space-between;
      align-items: center;
      border: 2px dashed #2117fb;
      border-radius: 15px;
      padding: 10px;
    }
    .header1{
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      text-align: right;
      margin:10px
      /* border: 2px dashed black */
    }
    .header-left {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      /* border: 2px dashed black */
    }
    .text-header-right{
      font-family: "Tajawal", system-ui;
      font-size: 17px;
    }
  
    h1{
      font-family: "Tajawal", system-ui;
      font-size: 20px;
  }
  .header-medium{
      justify-content: center;
      align-items: center;
      text-align: center;
  }
    .header-left img {
      width: 100px;
      height: 100px;
      margin-right: 10px;
    }
    .header-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      text-align: right;
    }
    .header-right p {
      margin: 0;
      font-size: 14px;
      
    }
    table {
    width: 98%;
    color: #333;
    font-family: Arial, sans-serif;
    font-size: 8px;
    text-align: left;
    padding: 5px;
    border-radius: 5px;
    border: 2px dashed #2117fb;
    overflow: hidden;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    margin: auto;
    margin-top: 10px;
    margin-bottom: 10px;
  } 
  table th {
  background-color: #447dee;
  color: #fff;
  font-weight: bold;
  font-family:'Tajawal';
  font-size: 13px;
  padding: 3px;
  text-transform: uppercase;
  border: 1px solid  #1b1818;
  letter-spacing: 1px; 
  text-align: center;
  }
  
  table td {
  padding: 3px;
  text-align: center;
  font-family:'Tajawal';
  font-size: 11px;
  border: 1px solid  #1b1818;
  font-weight: bold;
  }
  .footer{
    height: 70px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-top: 100px;
  }
  .namedata{
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  height:70%;
  padding: 5px;
  }
  h4{
    font-family:'Tajawal';
  }
  h5 {
    font-family:'Tajawal';
    margin: auto;
  }
  p{
    margin: 5px;
    }
    // font-family:'Tajawal';
  span{
    height: 80%;
    margin: auto;
    margin-left: 10px;
    text-align: center;
  }
  </Style>
  <body>
    <div class="page">
    <div class="header">
      <div class="header1">
        <p class="text-header-right">التاريخ:${new Date().toLocaleDateString()} </p>
      </div>

      <div class="header-medium">
          <h1>${home.NameCompany}</h1>
          <h1 style="font-size: 17px;"> فرع :${home.NameBranch}</h1>
          <h1 style="font-size: 17px;"> المشروع: ${home.Nameproject}</h1>
          <h1 style="font-size: 17px;">كشف حساب حسب التصنيف</h1>

        </div>
      <div class="header-left">
        <img src="https://storage.googleapis.com/demo_backendmoshrif_bucket-1/Vector.png" alt="logo"  style="width: 80px;height: 40px;">
        <h1>منصة مشرف</h1>
      </div>
    
    </div>
  
  <table>
     <thead>
          <tr>
      <thead>
              <tbody>
              <!-- <th style="text-align: center;border-color: #333;"  colspan="6">Purchaise</th> -->
                  <tr>
                  
                      <th scope="col" rowspan="2" >الفاتورة </th>
                      <th scope="col" rowspan="3">البيان </th>
                      <th scope="col" rowspan="2">التاريخ </th>
                      <th scope="col" rowspan="2">المبلغ</th>
                      <th scope="col" rowspan="2">التصنيف</th>
                      <!-- rowspan="2" هذه للدمج عمودي -->
                  </tr>
                                                 
              </tbody>
      </thead>
      </tr>         
      <tbody>
  
        ${item.map((pic, index) => {
          return `   
    <tr>
          <td>${pic.items[0].InvoiceNo}</td>
          <td>${pic.items[0].Data}</td>
          <td>${pic.items[0].Date}</td>
          <td>${Totaltofixt(pic.items[0].Amount)}</td>
          <td style="background-color: #447dee; color: #fff;" rowspan=${
            pic.items.filter(
              (i) => i.ClassificationName === pic.ClassificationName
            ).length + 2
          }>${pic.ClassificationName}</td>
        </tr>
          <tr>
        ${pic.items
          .filter(
            (i) =>
              i.InvoiceNo !== pic.items[0].InvoiceNo &&
              i.ClassificationName === pic.ClassificationName
          )
          .map((data, index) => {
            return `      
          <tr>
         <td>${data.InvoiceNo}</td>
          <td>${data.Data}</td>
          <td>${data.Date}</td>
          <td>${Totaltofixt(data.Amount)}</td>
          
        </tr>`;
          })}
            </tr>
        <tr>
                  <td colspan="4">${Totaltofixt(
                    pic.total
                  )} :الاجمالي حسب الصنف</td>
      </tr>
       `;
        })}
  
  <tr>
  
  <td style="background-color: #447dee; color: #fff;" colspan="4">${Totaltofixt(
    item.reduce((acc, current) => acc + current.total, 0)
  )}</td>
          <td style="background-color: #447dee; color: #fff;">اجمالي المصروفات</td>
        </tr>
      
      
        <!-- Add more rows as needed -->
      </tbody>
    </table>
          </div>
  </body>
  </html>
  `;
  return html;
};

const HtmlStatmentall = (
  dataExpense,
  dataRevenue,
  dataReturned,
  Totalproject,
  dataHome
) => {
  try {
    const html = `<!DOCTYPE html>
<html lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@100..900&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@200;300;400;500;700;800;900&display=swap" rel="stylesheet">

  <title>Document</title>
</head>
  <!-- border-collapse: collapse; -->

<Style>
    @font-face {
        font-family: "Tajawal", sans-serif;
  font-optical-sizing: auto;
  font-weight: <weight>;
  font-style: normal;
  font-variation-settings:
    "wdth" 100;
    }

  body{
      font-family: 'Tajawal', sans-serif;
      width: 95%;
      margin: auto;
      margin-top: 35px;
  }
  .page {
    width: 794px;
    /* height: 1123px; */
    margin: 0 auto;
    padding: 20px;
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    border: 1px dashed #2117fb;

  }
  .header {
    display: flex;
    justify-content:space-between;
    align-items: center;
    border: 2px dashed #2117fb;
    border-radius: 15px;
    padding: 10px;
  }
  .header1{
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: right;
    margin:10px
    /* border: 2px dashed black */
  }
  .header-left {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    /* border: 2px dashed black */
  }
  .text-header-right{
    font-family: "Tajawal", system-ui;
    font-size: 17px;
  }

  h1{
    font-family: "Tajawal", system-ui;
    font-size: 20px;
}
.header-medium{
    justify-content: center;
    align-items: center;
    text-align: center;
}
  .header-left img {
    width: 100px;
    height: 100px;
    margin-right: 10px;
  }
  .header-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    text-align: right;
  }
  .header-right p {
    margin: 0;
    font-size: 14px;
    
  }
  table {
  width: 98%;
  color: #333;
  font-family: Arial, sans-serif;
  font-size: 8px;
  text-align: left;
  padding: 5px;
  border-radius: 5px;
  border: 2px dashed #2117fb;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  margin: auto;
  margin-top: 10px;
  margin-bottom: 10px;
} 
table th {
background-color: #447dee;
color: #fff;
font-weight: bold;
font-family:'Tajawal';
font-size: 13px;
padding: 3px;
text-transform: uppercase;
border: 1px solid  #1b1818;
letter-spacing: 1px; 
text-align: center;
}

table td {
padding: 3px;
text-align: center;
font-family:'Tajawal';
font-size: 11px;
border: 1px solid  #1b1818;
font-weight: bold;
}
.footer{
  /* height: 70px; */
  display: flex;
  flex-direction: row-reverse;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
  margin-top: 50px;
}
.footerone{
  font-size: 27px;
  font-family: "Tajawal";
  text-align: center;
}
h4{
  font-family:'Tajawal';
}
h5 {
  font-family:'Tajawal';
  margin: auto;
}
p{
  margin: 5px;
  font-family:'Tajawal';
}
.number{
  background-color: #447dee;
  color:#fff
}
span{
  height: 80%;
  margin: auto;
  margin-left: 10px;
  text-align: center;
}
.header-clint{
  background-color:hsl(220, 83%, 60%);
  margin:10px;
  margin-top: 30px;
  color:#fff;
  height: 33px;
  /* padding: 1px; */
  display: flex;
  justify-content: center;
  align-items: center;
}
</Style>

    <body>
  <div class="page">
  <div class="header">
    <div class="header1">
        <p class="text-header-right">التاريخ:${new Date().toLocaleDateString()} </p>
    </div>

    <div class="header-medium">
         <h1>${dataHome.NameCompany}</h1>
          <h1 style="font-size: 17px;"> فرع :${dataHome.NameBranch}</h1>
          <h1 style="font-size: 17px;"> المشروع: ${dataHome.Nameproject}</h1>
      </div>
    <div class="header-left">
      <img src="https://storage.googleapis.com/demo_backendmoshrif_bucket-1/Vector.png" alt="logo" style="width: 80px;height: 40px;">
      <h1>منصة مشرف</h1>
    </div>
  
  </div>

<div class="header-clint">
  <h4>عهد العميل</h4>
</div>
<table>
   <thead>
        <tr>
    <thead>
            <tbody>
            <!-- <th style="text-align: center;border-color: #333;"  colspan="6">Purchaise</th> -->
                <tr>
                
                    <th scope="col" rowspan="3">البيان </th>
                    <th scope="col" rowspan="2">تاريخ العهدة </th>
                    <th scope="col" rowspan="2">المبلغ</th>
                    <!-- rowspan="2" هذه للدمج عمودي -->
                </tr>
                                               
            </tbody>
    </thead>
    </tr>         
    <tbody>
    ${dataRevenue.map((item, index) => {
      return `
        <tr>
        <td>${item.Data}</td>
        <td>${item.Date}</td>
        <td>${Totaltofixt(item.Amount)}</td>
        </tr>
        `;
    })}


<!-- Add more rows as needed -->
    </tbody>
</table>
<div class="header-clint">
<h4>مصروفات العميل</h4>
</div>
<table>
<thead>
<tr>
    <thead>
            <tbody>
            <!-- <th style="text-align: center;border-color: #333;"  colspan="6">Purchaise</th> -->
                <tr>
                
                    <th scope="col" rowspan="2" >الفاتورة </th>
                    <th scope="col" rowspan="3">البيان </th>
                    <th scope="col" rowspan="2">التاريخ </th>
                    <th scope="col" rowspan="2">المبلغ</th>
                    <!-- rowspan="2" هذه للدمج عمودي -->
                </tr>
                                               
            </tbody>
    </thead>
    </tr>         
    <tbody>
      
    ${dataExpense.map((item, index) => {
      return `
        <tr>
        <td>${item.InvoiceNo}</td>
        <td>${item.Data}</td>
        <td>${item.Date}</td>
        <td>${Totaltofixt(item.Amount)}</td>
        </tr>
        `;
    })}
      <!-- Add more rows as needed -->
    </tbody>
  </table>
  <div class="header-clint">
    <h4>مرتجعات العميل</h4>
  </div>
  <table>
    <thead>
          <tr>
      <thead>
              <tbody>
              <!-- <th style="text-align: center;border-color: #333;"  colspan="6">Purchaise</th> -->
                  <tr>
                  
                      <th scope="col" rowspan="3">البيان </th>
                      <th scope="col" rowspan="2">تاريخ المرتجع </th>
                      <th scope="col" rowspan="2">المبلغ</th>
                      <!-- rowspan="2" هذه للدمج عمودي -->
                  </tr>
              </tbody>
      </thead>
      </tr>         
      <tbody>
    ${dataReturned.map((item, index) => {
      return `
        <tr>
        <td>${item.Data}</td>
        <td>${item.Date}</td>
        <td>${Totaltofixt(item.Amount)}</td>
        </tr>
        `;
    })}
        <!-- Add more rows as needed -->
      </tbody>
    </table>
<div class="footer">
  <div class="footerone">
    <h6>اجمالي مبلغ العهد</h6>
    <h6 class="number">${Totaltofixt(Totalproject.TotalRevenue)}</h6>
  </div>
  <div class="footerone">
    <h6>اجمالي مبلغ المصروفات</h6>
    <h6 class="number">${Totaltofixt(Totalproject.TotalExpense)}</h6>
  </div>
  <div class="footerone">
    <h6>اجمالي مبلغ المرتجعات</h6>
    <h6 class="number">${Totaltofixt(Totalproject.TotalReturns)}</h6>
  </div>
  </div>
  <div class="footerone">
    <h6>الرصيد المتبقي</h6>
    <h6 class="number">${Totaltofixt(Totalproject.RemainingBalance)}</h6>
  </div>

        </div>
</body>
</html>

    
    `;

    return html;
  } catch (error) {
    console.log(error);
  }
};

const HtmlStatmentHR = (array, Preparation, home) => {
  let numberabsent = 0;
  let numberOvertime = 0;
  let worktime = 0;
  const html = `
  <!DOCTYPE html>
<html lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
  <!-- border-collapse: collapse; -->
${styles}
<body>
  <div class="page">
  <div class="header">
    <div class="header1">
      <p class="text-header-right">التاريخ:${new Date().toLocaleDateString()}م</p>
    </div>

    <div class="header-medium">
          <h1>${home.NameCompany}</h1>
        <h1 style="font-size: 17px;">كشف حضوري شهري</h1>
        <h1 style="font-size: 17px;">${Preparation[0]?.userName}</h1>
      </div>
    <div class="header-left">
      <img src="https://storage.googleapis.com/demo_backendmoshrif_bucket-1/Vector.png" alt="logo" style="width: 80px;height: 40px;">
      <h1>منصة مشرف</h1>
    </div>
  
  </div>



<table>
   <thead>
        <tr>
    <thead>
            <tbody>
            <!-- <th style="text-align: center;border-color: #333;"  colspan="6">Purchaise</th> -->
                <tr>
                    <th scope="col" rowspan="2" >Date </th>
                    <th scope="col" rowspan="2">Check In </th>
                    <th scope="col" rowspan="2">Check Out </th>
                    <th scope="col" rowspan="2">Work Time</th>
                    <th scope="col" rowspan="2">Absent</th>
                    <th scope="col" rowspan="2">Extra Overtime</th>
                    <th scope="col" rowspan="2">Duty Locaton</th>
                    <!-- rowspan="2" هذه للدمج عمودي -->
                </tr>
            </tbody>
    </thead>
    </tr>         
    <tbody>
      ${array.map((item, index) => {
        let prepar = Preparation.find((pic) => pic.Dateday === item);
        let numberovertime =
          prepar && prepar?.Overtimeassignment === "true"
            ? prepar?.Numberofovertimehours
            : 0.0;
        let day = DateDay(new Date());
        let time = item <= day;
        let days = ["الجمعة", "السبت"];
        let absent =
          !prepar && !days.includes(converttimetotext(item)) && time
            ? "Absent"
            : "";
        let CheckInFile =
          prepar && prepar?.CheckInFile !== null
            ? JSON.parse(prepar?.CheckInFile)
            : {};
        if (prepar) {
          worktime += prepar?.Numberofworkinghours;
        }
        if (absent === "Absent") {
          numberabsent += 1;
        }

        if (
          prepar &&
          prepar?.Overtimeassignment === "true" &&
          prepar?.Numberofovertimehours !== null
        ) {
          numberOvertime += 1;
        }
        return prepar
          ? `
          <tr>
          <td>${item}</td>
          <td>${Datetime(prepar?.CheckIntime)}</td>
          <td>${prepar?.CheckOUTtime ? Datetime(prepar?.CheckOUTtime) : 0}</td>
          <td>${prepar?.Numberofworkinghours}</td>
          <td></td>
          <td>${numberovertime === null ? 0.0 : numberovertime}</td>
          <td> <a href=${
            Object.keys(CheckInFile?.location).length > 0
              ? `https://www.google.com/maps/@${CheckInFile?.location?.latitude},${CheckInFile?.location?.longitude},15z`
              : "#"
          }>موقع التحضير</a></td>
        </tr>
          `
          : `<tr style="background-color:#f6f8fe">
          <td>${item}</td>
          <td></td>
          <td></td>
          <td></td>
          <td>${absent}</td>
          <td></td>
          <td></td>
        </tr>`;
      })}

      <!-- Add more rows as needed -->
    </tbody>
  </table>
  <table>
    <thead>
          <tr>
      <thead>
              <tbody>
              <!-- <th style="text-align: center;border-color: #333;"  colspan="6">Purchaise</th> -->
                  <tr>
                  
                      <th >work Days:</th>
                      <th style="background-color: #fff;color: #1b1818;">${
                        Preparation?.length + 8
                      }</th>
                      <th >Absent Days:  </th>
                      <th style="background-color: #fff;color: #1b1818;">${numberabsent}</th>
                                          <!-- rowspan="2" هذه للدمج عمودي -->
                  </tr>
                  <tr>
    
                  <th>Paid Overtime:  </th>
                      <th style="background-color: #fff;color: #1b1818;">${numberOvertime}</th>

                      <th>Work Time: </th>
                      <th style="background-color: #fff;color: #1b1818;">${worktime}</th>
                  </tr>
                 
              </tbody>
      </thead>
      </tr>         
    </table>
        </div>
</body>
</html>

  `;
  return html;
};
const HtmlStatmentSubscription = (array) => {
  const html = `
<!DOCTYPE html>
<html lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
  <!-- border-collapse: collapse; -->
${styles}
<body>
  <div class="page">
  <div class="header">
    <div class="header1">
      <p class="text-header-right">التاريخ: ${moment().format("YYYY-MM-DD")}</p>
    </div>

    <div class="header-medium">
        <h1 style="font-size: 17px;">فاتورة تفصيلية لأشتراك شهر اغسطس</h1>
      </div>
    <div class="header-left">
      <img src="https://storage.googleapis.com/demo_backendmoshrif_bucket-1/Vector.png" alt="logo" style="width: 80px;height: 40px;">
      <h1>منصة مشرف</h1>
    </div>
  
  </div>

<div style="text-align:right; font-family: 'Tajawal', system-ui;">
  <div style="display: flex; flex-direction: row; justify-content: space-between;">
    <h1>المحترمون </h1>
    <h1>الاخ/الاخوة : ${array[0]?.NameCompany} </h1>
  </div>
  <h2 style="font-size:large; text-align: center;"> الموضوع اشتراك شهر اغسطس </h2>
  <h3 style="font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;"> إشارة إلى الموضوع اعلاه مرفق اليكم فاتورة اشتراك شهر اغسطس نأمل سرعة السداد ليتسنى لكم الاستفادة من الخدمات المقدمه لكم </h3>
</div>
<table>
  <thead>
        <tr>
    <thead>
            <tbody>
            <!-- <th style="text-align: center;border-color: #333;"  colspan="6">Purchaise</th> -->
                <tr>
                  <th scope="col" rowspan="2">سعر اشتراك </th>
                  <th scope="col" rowspan="2">عدد ايام  المشروع للشهر</th>
                  <th scope="col" rowspan="2">تاريخ انشاء المشروع </th>
                  <th scope="col" rowspan="2">اسم المشروع </th>
                  <th scope="col" rowspan="2">م </th>
                </tr>
            </tbody>
    </thead>
    </tr>         
    <tbody>
      ${array.map((item, index) => {
        return `  <tr>
              <td>${item.price}SR</td>
              <td>${item.DaysElapsed}</td>
              <td>${item.StartDate}</td>
              <td>${item?.ProjectName}</td>
              <td>${index + 1}</td>
            
            </tr>`;
      })}
  
  
      <!-- Add more rows as needed -->
    </tbody>
  </table>
<table>
  <thead>
        <tr>
    <thead>
            <tbody>
            <!-- <th style="text-align: center;border-color: #333;"  colspan="6">Purchaise</th> -->
                <tr>
                  <td scope="col" rowspan="5">${Totaltofixt(
                    array[0]?.total
                  )}</td>
                  <th scope="col" rowspan="3">الاجمالي </th>
                
                </tr>
            </tbody>
    </thead>
    </tr>         
  
  </table>
        </div>
</body>
</html>


  `;
  return html;
};

const HtmlStatmentTimline = (result, comapny) => {
  const html = `
  <!DOCTYPE html>
<html lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
  <!-- border-collapse: collapse; -->
${styles}
<body>
  <div class="page">
  <div class="header">
    <div class="header1">
      <p class="text-header-right">التاريخ: ${moment
        .parseZone()
        .format("yyy-MM-DD")}</p>
    </div>

    <div class="header-medium">
        <h1 style="font-size: 17px;">${comapny?.NameCompany}</h1>
        <h1 style="font-size: 17px;">الجدول الزمني لمشروع</h1>
      </div>
      <div class="header-left">
        <img src="https://storage.googleapis.com/demo_backendmoshrif_bucket-1/Vector.png" alt="logo" style="width: 80px;height: 40px;">
        <h1>منصة مشرف</h1>
      </div>
      
    </div>
    <div style="flex-direction: row;display:flex;justify-content: space-around;width:100%;margin-top:50px">
      <div>
        <h1 style="font-size: 17px;">اسم المشروع </h1>
        <h1 style="font-size: 17px;">${result.Nameproject}</h1>
      </div>
      <div>
        <h1 style="font-size: 17px;">نوع المشروع</h1>
        <h1 style="font-size: 17px;">${result.TypeOFContract}</h1>
      </div>
    </div>
    <div style="flex-direction: row;display:flex;justify-content: space-around;width:100%;border: 1px solid  #1448e7; border-radius: 15px;margin-top:20px ">
      <div >
        <h1 style="font-size: 17px; ">المدة المتوقعة للمشروع</h1>
             <h1 style="font-size: 17px;text-align: center;">${
               result.ExpectedDurationDays
             }</h1>
      </div>
      <div>
        <h1 style="font-size: 17px;">تاريخ بدء المشروع</h1>
        <h1 style="font-size: 17px; text-align: center;">${
          result.ProjectStartdate
        }</h1>
      </div>
      <div>
        <h1 style="font-size: 17px;">تاريخ توقيع العقد</h1>
        <h1 style="font-size: 17px;text-align: center;">${
          result.Contractsigningdate
        }</h1>
      </div>
    </div>

        <h1 style="font-size: 17px;text-align:right;margin-top:50px">مراحل المشروع</h1>


<table>
  <thead>
        <tr>
    <thead>
            <tbody>
            <!-- <th style="text-align: center;border-color: #333;"  colspan="6">Purchaise</th> -->
                <tr>
                  <th scope="col" rowspan="2">الفرق بالأيام </th>
                  <th scope="col" rowspan="2">تاريخ الإغلاق </th>
                  <th scope="col" rowspan="2">تاريخ النهاية </th>
                  <th scope="col" rowspan="2">تاريخ البداية</th>
                  <th scope="col" rowspan="2">مدة الانجاز </th>
                  <th scope="col" colspan="2">اسم المرحلة </th>
                </tr>
            </tbody>
    </thead>
    </tr>         
    <tbody>
      ${JSON.parse(result.StageCust)?.map((item, index) => {
        return `
            <tr>
        <td class="wrap-text">${item.Difference}</td>
        <td class="wrap-text">${item.CloseDate}</td>
        <td class="wrap-text">${item.EndDate}</td>
        <td class="wrap-text">${item.StartDate}</td>
        <td class="wrap-text">${item.Days}</td>
        <td class="wrap-text">${item.StageName}</td>
        
      </tr>
        `;
      })}
  
      <tr>
              <th scope="col">${result.TotalDeviationDays}</th>
              <th scope="col"colspan="3" > </th>
              <th scope="col" >${result.ExpectedDurationDays}</th>
              <th scope="col" >عدد مراحل المشروع : ${result.StagesCount}</th>
      </tr>
      <!-- Add more rows as needed -->
    </tbody>
  </table>

<h1 style="font-size: 17px;text-align:right;margin-top:50px">ملاحظات المشروع</h1>
<table>
  <thead>
        <tr>
    <thead>
            <tbody>
            <!-- <th style="text-align: center;border-color: #333;"  colspan="6">Purchaise</th> -->
                <tr>
                 
                  <th scope="col" rowspan="2">تاريخ الملاحظة </th>
                  <th scope="col" rowspan="2">الجهة</th>
                  <th scope="col" rowspan="2">عدد الايام</th>
                  <th scope="col" rowspan="2">الملاحظة </th>
                  <th scope="col" colspan="2">اسم المرحلة </th>
                </tr>
            </tbody>
    </thead>
    </tr>         
    <tbody>
${JSON.parse(result.StageNotes)?.map((item, index) => {
  return `<tr>
        <td class="wrap-text">${item.DateNote}</td>
        <td class="wrap-text">${item.RecordedBy}</td>
        <td class="wrap-text">${item.countdayDelay}</td>
        <td class="wrap-text">${item.Note}</td>
        <td class="wrap-text">${item.StageName}</td>
      </tr>`;
})}
      <!-- Add more rows as needed -->
    </tbody>
  </table>



     <div style="flex-direction: row;display:flex;justify-content: space-around;width:100%;border: 1px solid  #1448e7; border-radius: 15px;margin-top:80px ">
      <div >
        <h1 style="font-size: 15px; text-align: center;" class="wrap-text">تاريخ التسليم المتوقع للمشروع</h1>
             <h1 style="font-size: 15px;text-align: center;"> ${
               result.ExpectedDeliveryDate
             } </h1>
      </div>
      <div >
        <h1 style="font-size: 15px; text-align: center;  " class="wrap-text">اجمالي الايام المتبقية لإنتهاء المشروع</h1>
             <h1 style="font-size: 15px;text-align: center;"> ${
               result.Totaldaysremaining
             } يوم</h1>
      </div>
      <div >
        <h1 style="font-size: 15px; text-align: center;  " class="wrap-text">اجمالي الايام المستغرقة حتى تاريخ طباعة التقرير</h1>
             <h1 style="font-size: 15px;text-align: center;"> ${
               result.Totaldaysspent
             } يوم</h1>
      </div>
    
    </div>
        </div>
</body>
</html>

  `;
  return html;
};

function Separationoftypes(items) {
  const arr = Array.isArray(items) ? items : JSON.parse(items || "[]");
  const map = new Map();
  for (const it of arr) {
    const key = it.Type ?? "-";
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(it);
  }
  return Array.from(map.entries()).map(([Type, list]) => ({
    Type,
    itemsSub: list,
    total: list.length,
  }));
};



const HtmlStatmentallRequests = (result, count, company, type = "all") => {
  let nameProject = "";
  const rowsHtml = result
    .map((p) => {
      const items = Array.isArray(p.items)
        ? p.items
        : JSON.parse(p.items || "[]");
      const groups = Separationoftypes(items);

      const totalRowsForProject = Math.max(items.length, 1);
      let projectPrinted = false;
      nameProject =
        type !== "all"
          ? `<h1 style="font-size: 17px;">مشروع : ${p.project_name}</h1>`
          : "";

      return groups
        .map((group) => {
          const typeTotal = Math.max(group.itemsSub.length, 1);
          let typePrinted = false;

          return group.itemsSub
            .map((t) => {
              const projectCell =
                !projectPrinted && type === "all"
                  ? `<td style="background-color: #447dee; color: #fff;"  class="blue-col" rowspan="${totalRowsForProject}">${esc(
                      p.project_name
                    )}</td>`
                  : "";

              const typeCell = !typePrinted
                ? `<td style="background-color: #447dee; color: #fff;"  class="blue-col" rowspan="${typeTotal}">${esc(
                    group.Type
                  )}</td>`
                : "";

              projectPrinted = true;
              typePrinted = true;

              return `
        <tr>
        
          <td class="wrap-text">${esc(t.Implementedby)}</td>
          <td class="wrap-text">${esc(t.InsertBy)}</td>
          <td class="wrap-text">${esc(
            t.checkorderout === "true" ? "✓" : "X"
          )}</td>
          <td class="wrap-text">${esc(t.Done === "true" ? "✓" : "X")}</td>
          <td class="wrap-text">${esc(t.Date)}</td>
          <td class="wrap-text">${esc(t.Data)}</td>
          ${typeCell}
            ${projectCell}
        </tr>
      `;
            })
            .join("");
        })
        .join("");
    })
    .join("");
  const column =
    type === "all" ? `<th scope="col" rowspan="2">المشروع</th>` : "";

  const html = `
  <!DOCTYPE html>
<html lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
  <!-- border-collapse: collapse; -->
${styles}
<body>
  <div class="page">
  <div class="header">
    <div class="header1">
         <p class="text-header-right">التاريخ: ${moment
           .parseZone()
           .format("yyy-MM-DD")}</p>
    </div>

    <div class="header-medium">
        <h1 style="font-size: 17px;">${company?.NameCompany}</h1>
        <h1 style="font-size: 17px;">تقرير الطلبات</h1>
        ${nameProject}
      </div>
      <div class="header-left">
        <img src="https://storage.googleapis.com/demo_backendmoshrif_bucket-1/Vector.png" alt="logo" style="width: 80px;height: 40px;">
        <h1>منصة مشرف</h1>
      </div>
      
    </div>

    <div  >
      <h1 style="font-size: 17px;text-align: center; "> اجمالي الطلبات </h1>
           <h1 style="font-size: 17px;text-align: center;">${count.total}</h1>
    </div>
    <div style="flex-direction: row;display:flex;justify-content: space-around;width:100%;border: 1px solid  #1448e7; border-radius: 15px;margin-top:20px ">
      <div >
        <h1 style="font-size: 17px;"> تم التسليم </h1>
             <h1 style="font-size: 17px;text-align: center;">${
               count.confirmed_count
             }</h1>
      </div>
      <div>
        <h1 style="font-size: 17px;">قيد التوصيل</h1>
        <h1 style="font-size: 17px; text-align: center;">${
          count.closed_count
        }</h1>
      </div>
      <div>
        <h1 style="font-size: 17px;"> قيد الانتظار </h1>
        <h1 style="font-size: 17px;text-align: center;">${count.open_count}</h1>
      </div>
    </div>

        <h1 style="font-size: 17px;text-align:right;margin-top:50px">تفاصيل الطلبات</h1>


<table>
  <thead>
        <tr>
    <thead>
            <tbody>
            <!-- <th style="text-align: center;border-color: #333;"  colspan="6">Purchaise</th> -->
                <tr>
                  <th scope="col" rowspan="2">منفذ الطلب </th>
                  <th scope="col" rowspan="2">طلب بواسطة</th>
                  <th scope="col" rowspan="2">تم الاستلام </th>
                  <th scope="col" rowspan="2">تم الارسال </th>
                  <th scope="col" rowspan="2">تاريخ الطلب</th>
                  <th scope="col" rowspan="2">تفاصيل الطلب</th>
                  <th scope="col" rowspan="2">التصنيف</th>
                  ${column}
                </tr>
            </tbody>
    </thead>
    </tr>         
    <tbody>
${rowsHtml}
      <!-- Add more rows as needed -->
    </tbody>
  </table>




    </div>
        </div>
</body>
</html>

  `;
  return html;
};

const HTMLStatmentFinancialCustody = (result, count, company) => {
  const html = `
<!DOCTYPE html>
<html lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>



${styles}
<body>
  <div class="page">
    <section class="intro-block">>
  <div class="header">
    <div class="header1">
      <p class="text-header-right">التاريخ: م</p>
    </div>
 
    
    <div class="header-medium">
        <h1 style="font-size: 17px;">${company?.NameCompany}</h1>
        <h1 style="font-size: 17px;">تقرير العهد</h1>
      </div>
      <div class="header-left">
        <img src="https://storage.googleapis.com/demo_backendmoshrif_bucket-1/Vector.png" alt="logo" style="width: 80px;height: 40px;">
        <h1>منصة مشرف</h1>
      </div>
      
    </div>
<div class="intro-summary">
    <div >
      <h1 style="font-size: 17px; text-align: center;"> اجمالي عدد العهد  </h1>
      <h1 style="font-size: 17px;text-align: center;">${
        count.total_requests
      }</h1>
    </div>
    <div style="flex-direction: row;display:flex;justify-content: space-around;width:100%;border: 1px solid  #1448e7; border-radius: 15px;margin-top:20px ">
      <div>
        <h1 style="font-size: 17px;">المرفوضه</h1>
        <h1 style="font-size: 17px;text-align: center;">${
          count.rejected_requests
        }</h1>
      </div>
      <div>
        <h1 style="font-size: 17px;text-align: center;">المغلقة </h1>
        <h1 style="font-size: 17px; text-align: center;">${
          count.accepted_requests
        }</h1>
      </div>
      <div >
        <h1 style="font-size: 17px;text-align: center;"> قيد المراجعه  </h1>
             <h1 style="font-size: 17px;text-align: center;">${
               count.open_requests
             }</h1>
      </div>
    </div>
    </div>
    </section>
<div class="content">


${
  result.filter((pic) => pic.section === "الطلبات المفتوحة").length > 0
    ? `
  <h1 style="font-size: 17px;text-align:right;margin-top:50px">تفاصيل طلبات قيد المراجعه </h1>
<table>
  <thead>
        <tr>
    <thead>
            <tbody>
            <!-- <th style="text-align: center;border-color: #333;"  colspan="6">Purchaise</th> -->
            <tr>
                  <th scope="col" rowspan="2">تاريخ الطلب </th>
                  <th scope="col" rowspan="2">البيان</th>
                  <th scope="col" rowspan="2">المبلغ </th>
                  <th scope="col" colspan="2">بواسطة </th>
                </tr>
            </tbody>
            
    </thead>
    </tr>         
    <tbody>
      
      ${result
        .filter((pic) => pic.section === "الطلبات المفتوحة")
        .map((item, index) => {
          return ` <tr>
         <td class="wrap-text">${item.Date}</td>
        <td class="wrap-text">${item.Statement}</td>
        <td class="wrap-text">${Totaltofixt(item.Amount)}</td>
        <th scope="col">${item.Requestby}</th>
      </tr>`;
        })}

      <!-- Add more rows as needed -->
    </tbody>
    
  </table>`
    : ""
}


  ${
    result.filter((pic) => pic.section === "الطلبات المقبولة").length > 0
      ? `
  <h1 style="font-size: 17px;text-align:right;margin-top:50px">تفاصيل الطلبات المغلقة </h1>
  <table>
  <thead>
        <tr>
    <thead>
            <tbody>
            <!-- <th style="text-align: center;border-color: #333;"  colspan="6">Purchaise</th> -->
            <tr>
                  <th scope="col" rowspan="2">تاريخ الموافقة</th>
                  <th scope="col" rowspan="2">موافقة بواسطة</th>
                  <th scope="col" rowspan="2">تاريخ الطلب </th>
                  <th scope="col" rowspan="2">البيان</th>
                  <th scope="col" rowspan="2">المبلغ </th>
                  <th scope="col" colspan="2">بواسطة </th>
                </tr>
            </tbody>
            
    </thead>
    </tr>         
    <tbody>
         
    ${result
      .filter((pic) => pic.section === "الطلبات المقبولة")
      .map((item, index) => {
        return `
      <tr>
        <td class="wrap-text">${item.ApprovalDate}</td>
        <td class="wrap-text">${item.Approvingperson}</td>
        <td class="wrap-text">${item.Date}</td>
        <td class="wrap-text">${item.Statement}</td>
        <td class="wrap-text">${Totaltofixt(item.Amount)}</td>
        <th scope="col">${item.Requestby}</th>
      </tr>`;
      })}

      <!-- Add more rows as needed -->
    </tbody>
    
  </table>`
      : ""
  }

  ${
    result.filter((pic) => pic.section === "الطلبات المرفوضة").length > 0
      ? `<h1 style="font-size: 17px;text-align:right;margin-top:50px">تفاصيل الطلبات المرفوضة </h1>
  <table>
  <thead>
        <tr>
    <thead>
            <tbody>
            <!-- <th style="text-align: center;border-color: #333;"  colspan="6">Purchaise</th> -->
            <tr>
                  <th scope="col" rowspan="2">سبب الرفض</th>
                  <th scope="col" rowspan="2">تاريخ الرفض</th>
                  <th scope="col" rowspan="2">رفض بواسطة</th>
                  <th scope="col" rowspan="2">تاريخ الطلب </th>
                  <th scope="col" rowspan="2">البيان</th>
                  <th scope="col" rowspan="2">المبلغ </th>
                  <th scope="col" colspan="2">بواسطة </th>
                </tr>
            </tbody>
            
    </thead>
    </tr>         
    <tbody>
      
    ${result
      .filter((pic) => pic.section === "الطلبات المرفوضة")
      .map((item, index) => {
        return `
      <tr>
        <td class="wrap-text">${item.Reasonforrejection}</td>
        <td class="wrap-text">${item.Dateofrejection}</td>
        <td class="wrap-text">${item.Approvingperson}</td>
        <td class="wrap-text">${item.Date}</td>
        <td class="wrap-text">${item.Statement}</td>
        <td class="wrap-text">${Totaltofixt(item.Amount)}</td>
        <th scope="col" >${item.Requestby}</th>
      </tr>
      `;
      })}

      <!-- Add more rows as needed -->
    </tbody>
    
  </table>`
      : ""
  }

</div>


  <section class="last-page-only">
    
    <div >
      <h1 style="font-size: 17px; text-align: center;"> اجمالي مبلغ العهد  </h1>
      <h1 style="font-size: 17px;text-align: center;">${Totaltofixt(
        count.total_amount
      )}</h1>
    </div>

    <div style="flex-direction: row;display:flex;justify-content: space-around;width:100%;border: 1px solid  #1448e7; border-radius: 15px;margin-top:20px ">
    
    <div>
        <h1 style="font-size: 17px;">اجمالي مبلغ العهد المرفوضه </h1>
        <h1 style="font-size: 17px;text-align: center;">${Totaltofixt(
          count.rejected_amount
        )}</h1>
      </div>

      <div>
        <h1 style="font-size: 17px;text-align: center;">اجمالي مبلغ العهد المغلقة</h1>
        <h1 style="font-size: 17px; text-align: center;">${Totaltofixt(
          count.accepted_amount
        )}</h1>
      </div>

      <div >
        <h1 style="font-size: 17px;text-align: center;">اجمالي مبلغ  عهد قيد المراجعه   </h1>
        <h1 style="font-size: 17px;text-align: center;">${Totaltofixt(
          count.open_amount
        )}</h1>
      </div>

    </div>
    </section>
    </div>
        </div>
</body>
</html>

  `;

  return html;
};

const HtmlStatmentStage = (stage_image,dataStage, company,StageSub) => {
  try {
    const html = `
    <!DOCTYPE html>
<html lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
  <!-- border-collapse: collapse; -->

  ${styles}
<body>
  <div class="page">
  <div class="header">
    <div class="header1">
      <p class="text-header-right">التاريخ:  ${moment
           .parseZone()
           .format("yyy-MM-DD")}م</p>
    </div>

    <div class="header-medium">
        <h1 style="font-size: 17px;">${esc(company?.NameCompany)}</h1>
        <h1 style="font-size: 17px;">تقرير مرحلة</h1>
        <h1 style="font-size: 17px;">${esc(dataStage.StageName)}</h1>
      </div>
      <div class="header-left">
        <img src="https://storage.googleapis.com/demo_backendmoshrif_bucket-1/Vector.png" alt="logo" style="width: 80px;height: 40px;">
        <h1>منصة مشرف</h1>
      </div>
      
    </div>


<table>
  <thead>
        <tr>
    <thead>
            <tbody>
            <!-- <th style="text-align: center;border-color: #333;"  colspan="6">Purchaise</th> -->
            <tr>
                  <th scope="col" rowspan="2">النسبة التقديرية </th>
                  <th scope="col" rowspan="2">نسبة الانجاز</th>
                  <th scope="col" rowspan="2">تاريخ النهائية </th>
                  <th scope="col" colspan="2">تاريخ البدية </th>
                </tr>
            </tbody>
            
    </thead>
    </tr>         
    <tbody>
      
      <tr>
        <td class="wrap-text">${esc(dataStage.Ratio)}</td>
        <td class="wrap-text">${esc(parseFloat(dataStage.rate).toFixed(4))}%</td>
        <td class="wrap-text">${esc(dataStage.EndDate)}</td>
        <td class="wrap-text">${esc(dataStage.StartDate)}</td>
      </tr>

      <!-- Add more rows as needed -->
    </tbody>
    
  </table>



    <h1 style="font-size: 17px;text-align:right;margin-top:50px">تفاصيل المراحل الفرعية </h1>
    <table>
    <thead>
        <tr>
    <thead>
            <tbody>
            <!-- <th style="text-align: center;border-color: #333;"  colspan="6">Purchaise</th> -->
            <tr>
                  <th scope="col" rowspan="2"> بواسطة</th>
                  <th scope="col" rowspan="2">تاريخ الانجاز </th>
                  <th scope="col" rowspan="2">انجزت </th>
                  <th scope="col" colspan="2">اسم المرحلة</th>
                </tr>
            </tbody>
            
    </thead>
    </tr>         
    <tbody>
      
     ${StageSub.map((item) =>{
      return `
      <tr>
        <td class="wrap-text">${esc(item.userName)}</td>
        <td class="wrap-text">${esc(item.CloseDate)}</td>
        <td class="wrap-text">${esc(item.Done) === "true" ? "✓" : "X"}</td>
        <td class="wrap-text">${esc(item.StageSubName)}</td>
              </tr>
      `
     } ) }

      <!-- Add more rows as needed -->
    </tbody>

    </table>


  <h1 style="font-size: 17px;text-align:right;margin-top:50px">صور الانجازات  </h1>
  <div style="display: flex;justify-content: center;gap: 10px;margin-top:10px;flex-wrap: wrap;">
    ${stage_image.length === 0 ? `<h1>لا توجد صور</h1>` :
    stage_image.map((img) => {
      return `<img src="https://storage.googleapis.com/demo_backendmoshrif_bucket-1/${img.url}" alt="logo"
      style="width: 40%; border-radius: 2%;">`
    }).join('')

    }
  </div>


  
    </div>
</body>
</html>

    `;
    return html;
  } catch (error) {
    console.log(error);
  }
};



const Html_report_prepare = (data) => {
 const html = `
 <!DOCTYPE html>
<html lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
  <!-- border-collapse: collapse; -->

<Style>
  body{
      width: 95%;
      margin: auto;
      margin-top: 35px;
  }
  .page {
    width: 794px;
    /* height: 1123px; */
    margin: 0 auto;
    padding: 20px;
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    border: 1px dashed #2117fb;

  }
  .header {
    display: flex;
    justify-content:space-between;
    align-items: center;
    border: 2px dashed #2117fb;
    border-radius: 15px;
    padding: 10px;
    /* border: 2px dashed black; */
  }
  .header1{
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: right;
    margin:10px
    /* border: 2px dashed black */
  }
  .header-left {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    /* border: 2px dashed black */
  }
  .text-header-right{
    font-family: "Tajawal", system-ui;
    font-size: 17px;
  }

  h1{
    font-family: "Tajawal", system-ui;
    font-size: 20px;
}
.header-medium{
    justify-content: center;
    align-items: center;
    text-align: center;
}
  .header-left img {
    width: 100px;
    height: 100px;
    margin-right: 10px;
  }
  .header-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    text-align: right;
  }
  .header-right p {
    margin: 0;
    font-size: 14px;
    
  }
  table {
  width: 98%;
  color: #333;
  font-family: Arial, sans-serif;
  font-size: 8px;
  text-align: left;
  padding: 5px;
  border-radius: 5px;
  border: 2px dashed #2117fb;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  margin: auto;
  margin-top: 10px;
  margin-bottom: 10px;
} 
table th {
background-color: #447dee;
color: #fff;
font-weight: bold;
font-family:'Tajawal';
font-size: 13px;
padding: 3px;
text-transform: uppercase;
border: 1px solid  #1b1818;
letter-spacing: 1px; 
text-align: center;
}

table td {
padding: 3px;
text-align: center;
font-family:'Tajawal';
font-size: 11px;
border: 1px solid  #1b1818;
font-weight: bold;
}
.wrap-text {
  white-space: normal;   /* السماح بالتفاف النص */
  word-wrap: break-word; /* يكسر الكلمة الطويلة */
  word-break: break-word;/* متوافق أكثر مع المتصفحات الحديثة */
  max-width: 100px;     
}
</Style>
<body>
  <div class="page">
  <div class="header">
    <div class="header1">
      <p class="text-header-right">التاريخ: 30/10/2025م</p>
    </div>

    <div class="header-medium">
        <h1 style="font-size: 17px;">شركة شفق البنيان للمقاولات العامة</h1>
        <h1 style="font-size: 17px;">تحضير  </h1>
        <h1 style="font-size: 17px;">الموظف : م / محمد يحيى القحطاني</h1>
      </div>
      <div class="header-left">
        <img src="https://storage.googleapis.com/demo_backendmoshrif_bucket-1/Vector.png" alt="logo" style="width: 80px;height: 40px;">
        <h1>منصة مشرف</h1>
      </div>
      
    </div>

 


<table>
  <thead>
        <tr>
    <thead>
            <tbody>
            <!-- <th style="text-align: center;border-color: #333;"  colspan="6">Purchaise</th> -->
            <tr>
                  <th scope="col" rowspan="2">صورة التحضير</th>
                  <th scope="col" rowspan="2">الوقت</th>
                  <th scope="col" colspan="2">تاريخ الحضور </th>
                </tr>
            </tbody>
            
    </thead>
    </tr>         
    <tbody>
      ${data.map((item,index)=> {
        let Fils = JSON.parse(item.File) ?? {};
        console.log(Fils.name);
        let matchvideo = Fils.name?.match(/\.([^.]+)$/)[1];
        let filename = String(Fils.name).replace(matchvideo, "png");

        return `
        <tr>
        <td class="wrap-text">
        <img src="https://storage.googleapis.com/demo_backendmoshrif_bucket-1/${filename}" alt="logo" style="width: 100%;border-radius: 2%;">
        </td>
        <td class="wrap-text">${Datetime(item.timeminet)}</td>
        <td class="wrap-text">${item.Date}</td>
        </tr>
        `
      })}
   

      <!-- Add more rows as needed -->
    </tbody>
    
  </table>




  
    </div>
</body>
</html>

 `;
 return html
}






module.exports = {
  HtmlContent,
  HtmlStatmentall,
  HtmlStatmentHR,
  HtmlStatmentSubscription,
  HtmlStatmentTimline,
  HtmlStatmentallRequests,
  HTMLStatmentFinancialCustody,
  HtmlStatmentStage,
  Html_report_prepare
};
