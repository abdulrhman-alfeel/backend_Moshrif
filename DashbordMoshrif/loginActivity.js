const express = require('express');
const db = require('../sql/sqlite');
const { verifyJWT } = require('../middleware/jwt');
const router = express.Router();
router.use(verifyJWT);

// جلب جميع بيانات تسجيل الدخول
router.get('/', async (req, res) => {
  const {number=0} = req.query;
  try {
    const sql = `
      SELECT 
        id,
        IDCompany,
        userName,
        IDNumber,
        PhoneNumber,
        image,
        DateOFlogin,
        DateEndLogin,
        Activation,
        job,
        jobdiscrption,
        codeVerification
      FROM LoginActivaty
      WHERE id > ${number} 
      ORDER BY DateOFlogin DESC LIMIT 10
    `;
    
    const loginActivities = await db.getAllRows(sql);
    
    res.json({
      success: true,
      data: loginActivities,
      count: loginActivities.length,
      message: 'تم جلب بيانات تسجيل الدخول بنجاح'
    });
  } catch (error) {
    console.error('خطأ في جلب بيانات تسجيل الدخول:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في جلب بيانات تسجيل الدخول',
      message: error.message
    });
  }
});

// جلب بيانات تسجيل الدخول حسب ID المستخدم
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `
      SELECT 
        id,
        IDCompany,
        userName,
        IDNumber,
        PhoneNumber,
        image,
        DateOFlogin,
        DateEndLogin,
        Activation,
        job,
        jobdiscrption,
        codeVerification
      FROM LoginActivaty
      WHERE id = ?
    `;
    
    const loginActivity = await db.getRow(sql, [id]);
    
    if (!loginActivity) {
      return res.status(404).json({
        success: false,
        error: 'بيانات تسجيل الدخول غير موجودة',
        message: `لم يتم العثور على بيانات تسجيل الدخول للمستخدم بالرقم ${id}`
      });
    }
    
    res.json({
      success: true,
      data: loginActivity,
      message: 'تم جلب بيانات تسجيل الدخول بنجاح'
    });
  } catch (error) {
    console.error('خطأ في جلب بيانات تسجيل الدخول:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في جلب بيانات تسجيل الدخول',
      message: error.message
    });
  }
});

// جلب بيانات تسجيل الدخول حسب الشركة
router.get('/company/:companyId', async (req, res) => {
  try {
    const { companyId,number=0 } = req.params;
    const sql = `
      SELECT 
        id,
        IDCompany,
        userName,
        IDNumber,
        PhoneNumber,
        image,
        DateOFlogin,
        DateEndLogin,
        Activation,
        job,
        jobdiscrption,
        codeVerification
      FROM LoginActivaty
      WHERE IDCompany = ? AND id > ?
      ORDER BY DateOFlogin DESC LIMIT 10
    `;
    
    const loginActivities = await db.getAllRows(sql, [companyId,number]);
    
    res.json({
      success: true,
      data: loginActivities,
      count: loginActivities.length,
      message: 'تم جلب بيانات تسجيل الدخول للشركة بنجاح'
    });
  } catch (error) {
    console.error('خطأ في جلب بيانات تسجيل الدخول للشركة:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في جلب بيانات تسجيل الدخول للشركة',
      message: error.message
    });
  }
});

// البحث عن بيانات تسجيل الدخول بالكود
router.get('/search/code/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const sql = `
      SELECT 
        id,
        IDCompany,
        userName,
        IDNumber,
        PhoneNumber,
        image,
        DateOFlogin,
        DateEndLogin,
        Activation,
        job,
        jobdiscrption,
        codeVerification
      FROM LoginActivaty
      WHERE codeVerification = ?
      ORDER BY DateOFlogin DESC
    `;
    
    const loginActivity = await db.getRow(sql, [code]);
    
    if (!loginActivity) {
      return res.status(404).json({
        success: false,
        error: 'كود التحقق غير موجود',
        message: `لم يتم العثور على مستخدم بكود التحقق ${code}`
      });
    }
    
    res.json({
      success: true,
      data: loginActivity,
      message: 'تم العثور على المستخدم بنجاح'
    });
  } catch (error) {
    console.error('خطأ في البحث عن كود التحقق:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في البحث عن كود التحقق',
      message: error.message
    });
  }
});

// إحصائيات تسجيل الدخول
router.get('/stats/summary', async (req, res) => {
  try {
    // إجمالي المستخدمين
    const totalUsers = await db.getRow('SELECT COUNT(*) as count FROM LoginActivaty');
    
    // المستخدمين النشطين
    const activeUsers = await db.getRow('SELECT COUNT(*) as count FROM LoginActivaty WHERE Activation = "true"');
    
    // تسجيلات الدخول اليوم
    const todayLogins = await db.getRow(`
      SELECT COUNT(*) as count 
      FROM LoginActivaty 
      WHERE DATE(DateOFlogin) = DATE('now')
    `);
    
    // تسجيلات الدخول هذا الأسبوع
    const weekLogins = await db.getRow(`
      SELECT COUNT(*) as count 
      FROM LoginActivaty 
      WHERE DATE(DateOFlogin) >= DATE('now', '-7 days')
    `);
    
    res.json({
      success: true,
      data: {
        totalUsers: totalUsers.count,
        activeUsers: activeUsers.count,
        todayLogins: todayLogins.count,
        weekLogins: weekLogins.count
      },
      message: 'تم جلب إحصائيات تسجيل الدخول بنجاح'
    });
  } catch (error) {
    console.error('خطأ في جلب إحصائيات تسجيل الدخول:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في جلب إحصائيات تسجيل الدخول',
      message: error.message
    });
  }
});

module.exports = router; 