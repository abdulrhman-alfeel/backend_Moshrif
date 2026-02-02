const express = require('express');
const db = require('../sql/sqlite');
const { verifyJWT } = require('../middleware/jwt');
const router = express.Router();
router.use(verifyJWT);

// 1. GET /api/dashboard/stats - إحصائيات الداشبورد العامة
router.get('/stats', async (req, res, next) => {
  try {
    // جلب عدد الشركات
    const companiesCount = await db.getRow('SELECT COUNT(*) as count FROM company');
    
    // جلب عدد الفروع
    const subsCount = await db.getRow('SELECT COUNT(*) as count FROM companySub');
    
    // جلب عدد المشاريع
    const projectsCount = await db.getRow('SELECT COUNT(*) as count FROM companySubprojects');
    
    // جلب عدد المشاريع النشطة (استخدام Disabled = 'false' كمؤشر على المشاريع النشطة)
    const activeProjectsCount = await db.getRow(
      'SELECT COUNT(*) as count FROM companySubprojects WHERE Disabled = ? OR Disabled IS NULL', 
      ['false']
    );

    // جلب أحدث 5 شركات
    const recentCompanies = await db.getAllRows(
      'SELECT id, NameCompany, SubscriptionStartDate FROM company ORDER BY id DESC LIMIT 5'
    );

    // جلب أحدث 5 مشاريع مع معلومات الشركة والفرع
    const recentProjects = await db.getAllRows(`
      SELECT p.id, p.Nameproject, p.Disabled, p.rate, c.NameCompany, s.NameSub
      FROM companySubprojects p
      JOIN companySub s ON p.IDcompanySub = s.id
      JOIN company c ON s.NumberCompany = c.id
      ORDER BY p.id DESC LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        overview: {
          totalCompanies: companiesCount.count,
          totalSubs: subsCount.count,
          totalProjects: projectsCount.count,
          activeProjects: activeProjectsCount.count
        },
        recentCompanies: recentCompanies.map(company => ({
          id: company.id,
          name: company.NameCompany,
          subscriptionStart: company.SubscriptionStartDate
        })),
        recentProjects: recentProjects.map(project => ({
          id: project.id,
          name: project.Nameproject,
          status: project.Disabled === 'false' ? 'جاري_العمل' : 'متوقف',
          progress: project.rate || 0,
          companyName: project.NameCompany,
          subName: project.NameSub
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

// 2. GET /api/dashboard/reports - تقارير الداشبورد
router.get('/reports', async (req, res, next) => {
  try {
    // تقرير الشركات
    const companiesReport = await db.getAllRows(`
      SELECT c.id, c.NameCompany, 
      COUNT(DISTINCT s.id) as totalSubs,
      COUNT(DISTINCT p.id) as totalProjects,
      CASE 
        WHEN c.DisabledFinance = 'false' OR c.DisabledFinance IS NULL THEN 'نشط'
        ELSE 'غير نشط'
      END as status,
      c.Cost,
      c.SubscriptionEndDate
      FROM company c
      LEFT JOIN companySub s ON c.id = s.NumberCompany
      LEFT JOIN companySubprojects p ON s.id = p.IDcompanySub
      WHERE c.NameCompany IS NOT NULL AND c.NameCompany != ''
      GROUP BY c.id, c.NameCompany, c.DisabledFinance, c.Cost, c.SubscriptionEndDate
      ORDER BY totalProjects DESC
      LIMIT 10
    `);

    // تقرير المشاريع
    const projectsReport = await db.getAllRows(`
      SELECT p.id, p.Nameproject, p.rate as progress,
      c.NameCompany, s.NameSub,
      CASE 
      WHEN p.Disabled = 'false' OR p.Disabled IS NULL THEN 'جاري العمل'
      ELSE 'متوقف'
      END as status,
      p.cost,
      p.ProjectStartdate
      FROM companySubprojects p
      JOIN companySub s ON p.IDcompanySub = s.id
      JOIN company c ON s.NumberCompany = c.id
      WHERE p.Nameproject IS NOT NULL AND p.Nameproject != ''
      AND c.NameCompany IS NOT NULL AND c.NameCompany != ''
      AND s.NameSub IS NOT NULL AND s.NameSub != ''
      ORDER BY CASE WHEN p.rate IS NULL THEN 0 ELSE p.rate END DESC
      LIMIT 10
    `);

    // تقرير الشركات حسب المدن
    const companiesByCity = await db.getAllRows(`
      SELECT City, COUNT(*) as count
      FROM company 
      WHERE City IS NOT NULL AND City != '' 
      AND NameCompany IS NOT NULL AND NameCompany != ''
      GROUP BY City
      ORDER BY count DESC
      LIMIT 8
    `);

    // إحصائيات شهرية حسب تاريخ بداية الاشتراك
    const monthlyStats = await db.getAllRows(`
      SELECT 
        CASE 
          WHEN strftime('%m', c.SubscriptionStartDate) = '01' THEN 'يناير'
          WHEN strftime('%m', c.SubscriptionStartDate) = '02' THEN 'فبراير'
          WHEN strftime('%m', c.SubscriptionStartDate) = '03' THEN 'مارس'
          WHEN strftime('%m', c.SubscriptionStartDate) = '04' THEN 'أبريل'
          WHEN strftime('%m', c.SubscriptionStartDate) = '05' THEN 'مايو'
          WHEN strftime('%m', c.SubscriptionStartDate) = '06' THEN 'يونيو'
          WHEN strftime('%m', c.SubscriptionStartDate) = '07' THEN 'يوليو'
          WHEN strftime('%m', c.SubscriptionStartDate) = '08' THEN 'أغسطس'
          WHEN strftime('%m', c.SubscriptionStartDate) = '09' THEN 'سبتمبر'
          WHEN strftime('%m', c.SubscriptionStartDate) = '10' THEN 'أكتوبر'
          WHEN strftime('%m', c.SubscriptionStartDate) = '11' THEN 'نوفمبر'
          WHEN strftime('%m', c.SubscriptionStartDate) = '12' THEN 'ديسمبر'
          ELSE 'غير محدد'
        END as month,
        COUNT(DISTINCT c.id) as companies,
        COUNT(DISTINCT s.id) as subs,
        COUNT(DISTINCT p.id) as projects,
        SUM(CASE WHEN c.Cost IS NOT NULL THEN c.Cost ELSE 0 END) as totalRevenue
      FROM company c
      LEFT JOIN companySub s ON c.id = s.NumberCompany
      LEFT JOIN companySubprojects p ON s.id = p.IDcompanySub
      WHERE c.SubscriptionStartDate IS NOT NULL
      GROUP BY strftime('%m', c.SubscriptionStartDate)
      ORDER BY strftime('%m', c.SubscriptionStartDate)
    `);

    res.json({
      success: true,
      data: {
        companies: companiesReport,
        projects: projectsReport,
        monthlyStats: monthlyStats,
        companiesByCity: companiesByCity
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 