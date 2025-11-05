// routes/reports.js
const express = require('express');
const router = express.Router();
const Activity = require('../models/submission.model.js');
const { authenticateJWT: verifyToken } = require('../middleware/auth.middleware.js');
const dayjs = require('dayjs');

// Helper to build date filter
function buildDateRange(from, to) {
  if (!from && !to) return null;
  const range = {};
  if (from) range.$gte = dayjs(from).startOf('day').toDate();
  if (to) range.$lte = dayjs(to).endOf('day').toDate();
  return range;
}

// GET /api/reports/student/:studentId
router.get('/student/:studentId', verifyToken, async (req, res) => {
  const { studentId } = req.params;
  const { from, to, page = 1, limit = 50 } = req.query;
  try {
    const dateRange = buildDateRange(from, to);
    const query = { studentId };
    if (dateRange) query.date = dateRange;

    const docs = await Activity.find(query)
      .sort({ date: -1 })
      .skip((page-1)*limit)
      .limit(parseInt(limit))
      .lean();

    return res.status(200).json({ total: docs.length, data: docs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch student report' });
  }
});

// GET /api/reports/activity/:templateId
router.get('/activity/:templateId', verifyToken, async (req, res) => {
  const { templateId } = req.params;
  const { from, to, page = 1, limit = 50 } = req.query;
  try {
    const dateRange = buildDateRange(from, to);
    const query = { templateId };
    if (dateRange) query.date = dateRange;

    const docs = await Activity.find(query).sort({ date: -1 }).skip((page-1)*limit).limit(parseInt(limit)).lean();
    return res.status(200).json({ total: docs.length, data: docs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch activity report' });
  }
});

// GET /api/reports/department/:dept
router.get('/department/:dept', verifyToken, async (req, res) => {
  const { dept } = req.params;
  const { from, to, page = 1, limit = 50 } = req.query;
  try {
    const dateRange = buildDateRange(from, to);
    const query = {};
    if (dateRange) query.createdAt = dateRange;

    // fetch submissions and populate user to filter by department
    let docs = await Activity.find(query)
      .sort({ createdAt: -1 })
      .skip((page-1)*limit)
      .limit(parseInt(limit))
      .populate('userId', 'name department')
      .lean();

    docs = docs.filter(d => {
      if (!d) return false;
      if (d.userId && d.userId.department && d.userId.department.toLowerCase() === dept.toLowerCase()) return true;
      if (d.department && d.department.toLowerCase() === dept.toLowerCase()) return true; // fallback
      return false;
    });

    return res.status(200).json({ total: docs.length, data: docs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch department report' });
  }
});

// GET /api/reports/department/:dept/export
router.get('/department/:dept/export', verifyToken, async (req, res) => {
  const { dept } = req.params;
  const { format = 'pdf', from, to } = req.query;
  
  try {
    const dateRange = buildDateRange(from, to);
    const query = {};
    if (dateRange) query.createdAt = dateRange;

    let activities = await Activity.find(query)
      .sort({ createdAt: -1 })
      .populate('templateId', 'templateName')
      .populate('userId', 'name department')
      .lean();

    // Filter by department using the populated user or fallback to activity.department
    activities = activities.filter(a => {
      if (!a) return false;
      if (a.userId && a.userId.department && a.userId.department.toLowerCase() === dept.toLowerCase()) return true;
      if (a.department && a.department.toLowerCase() === dept.toLowerCase()) return true;
      return false;
    });

    // console.log(`Export: found ${activities.length} activities for department=${dept}`);

    if (format.toLowerCase() === 'csv') {
      // Generate CSV
      const csvRows = [
        ['ID', 'Student Name', 'Department', 'Activity Type', 'Start Date', 'End Date', 'Proof Links', 'Status']
      ];

      activities.forEach(activity => {
        // Get proof links formatted as Excel hyperlinks
        const proofLinks = (activity.proofs || [])
          .map(proof => `=HYPERLINK("${proof.url}","${proof.filename || 'View Document'}")`)
          .join('\n');
        
        // Get activity dates from form data
        const activityData = activity.data || {};
        const endDate = activityData.endDate || activityData.completionDate || '';

        csvRows.push([
          activity._id,
          activity.userId?.name || activity.studentName || 'Unknown',
          activity.department || activity.userId?.department || 'Unknown',
          activity.templateId?.templateName || 'Unknown Activity',
          new Date(activity.createdAt).toLocaleDateString(),
          endDate ? new Date(endDate).toLocaleDateString() : '',
          proofLinks,
          activity.status || ''
        ]);
      });

      // Simple CSV escaping and CRLF line endings so Excel opens rows correctly
      const escapeCsv = (val) => {
        if (val === null || val === undefined) return '';
        const s = String(val);
        if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
          return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
      };

      // Add UTF-8 BOM so Excel recognizes encoding, and use CRLF for row separators
      const csv = '\uFEFF' + csvRows.map(row => row.map(escapeCsv).join(',')).join('\r\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=department_${dept}_report.csv`);
      return res.send(csv);
    } else {
      // Generate PDF
      const html = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; }
              table { width: 100%; border-collapse: collapse; }
              th, td { padding: 8px; border: 1px solid #ddd; }
              th { background-color: #f4f4f4; }
              a { color: #0066cc; text-decoration: underline; }
              .proof-link {
                display: inline-block;
                margin: 2px 0;
                padding: 2px 5px;
                background: #f0f9ff;
                border: 1px solid #cce5ff;
                border-radius: 3px;
                color: #0066cc;
                text-decoration: none;
              }
              .proof-link:hover {
                background: #e6f3ff;
              }
            </style>
          </head>
          <body>
            <h1>Department Report - ${dept}</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student Name</th>
                  <th>Department</th>
                  <th>Activity Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Proof Links</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${activities.map(activity => {
                  const proofLinks = (activity.proofs || [])
                    .map(proof => `<a class="proof-link" href="${proof.url}" target="_blank" rel="noopener noreferrer">📎 ${proof.filename || 'View Document'}</a>`)
                    .join('<br>');
                  
                  const activityData = activity.data || {};
                  const endDate = activityData.endDate || activityData.completionDate || '';
                  
                  return `
                    <tr>
                      <td>${activity._id}</td>
                      <td>${activity.userId?.name || activity.studentName || 'Unknown'}</td>
                      <td>${activity.department || activity.userId?.department || 'Unknown'}</td>
                      <td>${activity.templateId?.templateName || 'Unknown Activity'}</td>
                      <td>${new Date(activity.createdAt).toLocaleDateString()}</td>
                      <td>${endDate ? new Date(endDate).toLocaleDateString() : ''}</td>
                      <td>${proofLinks}</td>
                      <td>${activity.status || ''}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=department_${dept}_report.pdf`);
      const puppeteer = require('puppeteer');
async function resolveChromeExecutable() {
  // 1) explicit env override (preferred)
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    const p = process.env.PUPPETEER_EXECUTABLE_PATH;
    if (fs.existsSync(p)) return p;
    console.warn('PUPPETEER_EXECUTABLE_PATH set but file not found:', p);
  }

  // 2) If Render: attempt to discover the Puppeteer cache chrome install
  // Render commonly uses /opt/render/.cache/puppeteer/<browser>/...
  const renderCacheBase = process.env.PUPPETEER_CACHE_DIR || '/opt/render/.cache/puppeteer';
  try {
    const chromeRoot = path.join(renderCacheBase, 'chrome');
    if (fs.existsSync(chromeRoot)) {
      // look for versioned folders inside chrome root and pick the latest
      const versions = fs.readdirSync(chromeRoot).filter(Boolean);
      if (versions.length) {
        // choose the last-sorted folder (often newest) then the chrome binary inside
        versions.sort();
        const chosen = versions[versions.length - 1];
        // typical path used by Puppeteer: .../<version>/chrome-linux64/chrome
        const candidate = path.join(chromeRoot, chosen, 'chrome-linux64', 'chrome');
        if (fs.existsSync(candidate)) return candidate;
        // alternative layout: sometimes binary is directly at chromeRoot/<version>/chrome
        const alt = path.join(chromeRoot, chosen, 'chrome');
        if (fs.existsSync(alt)) return alt;
      }
    }
  } catch (e) {
    console.warn('Error while probing Render cache for chrome:', e.message);
  }

  // 3) Some renders put the binary at a known path; test the common Render path
  const commonRender = '/opt/render/.cache/puppeteer/chrome/chrome-linux64/chrome';
  if (fs.existsSync(commonRender)) return commonRender;

  // 4) fallback: return null and let puppeteer attempt to find local chrome
  return null;
}

// In your export PDF handler, when ready to create the browser:
const chromeExecutable = await resolveChromeExecutable();
console.log('Resolved chrome executable:', chromeExecutable);

let browser;
if (chromeExecutable) {
  try {
    browser = await puppeteer.launch({
      headless: true,
      executablePath: chromeExecutable,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });
  } catch (err) {
    console.error('Failed launching puppeteer with executablePath:', chromeExecutable, err);
    // fall through to default launch attempt
  }
}

if (!browser) {
  // Try a default launch (puppeteer may use its bundled browser)
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  } catch (err) {
    console.error('Default puppeteer.launch failed:', err);
    throw err; // allow outer try/catch to return 500 with informative log
  }
}

const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'networkidle0' });
const pdf = await page.pdf({ format: 'A4', printBackground: true });
await browser.close();

res.setHeader('Content-Type', 'application/pdf');
res.setHeader('Content-Disposition', `attachment; filename=department_${dept}_report.pdf`);
return res.send(pdf);

    }
  } catch (err) {
    console.error('Export error:', err);
    return res.status(500).json({ message: 'Failed to generate export' });
  }
});

module.exports = router;
