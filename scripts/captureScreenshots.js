const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'screenshots');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function captureAll() {
  console.log('[Screenshots] Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1366, height: 860 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();

  try {
    // 1. Home / Login Page
    console.log('[Screenshots] 1. Capturing Landing / Login Page...');
    await page.goto('http://localhost:5000/#login', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '01_login_page.png') });

    // 2. Patient Dashboard (John Doe)
    console.log('[Screenshots] 2. Fast-switching to Patient (John Doe)...');
    await page.evaluate(() => {
      window.app.quickLogin('john.doe@example.com', 'Patient@123');
    });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '02_patient_dashboard.png') });

    // 3. Find Doctors Directory
    console.log('[Screenshots] 3. Capturing Doctors Directory...');
    await page.evaluate(() => {
      window.app.navigate('doctors');
    });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '03_doctors_directory.png') });

    // 4. Doctor Availability Schedule
    console.log('[Screenshots] 4. Capturing Doctor Availability Schedule...');
    await page.evaluate(() => {
      const doc = window.loadedDoctors && window.loadedDoctors[0];
      const docId = doc ? (doc.doctorId || doc._id) : '';
      window.app.navigate('availability', docId);
    });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '04_doctor_availability.png') });

    // 5. Patient Billing & Invoices
    console.log('[Screenshots] 5. Capturing Patient Billing & Invoices...');
    await page.evaluate(() => {
      window.app.navigate('billing');
    });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '05_billing_invoices.png') });

    // 6. Patient Prescriptions
    console.log('[Screenshots] 6. Capturing Prescriptions Record...');
    await page.evaluate(() => {
      window.app.navigate('prescriptions');
    });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '06_prescriptions.png') });

    // 7. Doctor Clinical Portal (Dr. Sarah Smith)
    console.log('[Screenshots] 7. Fast-switching to Doctor Portal (Dr. Sarah Smith)...');
    await page.evaluate(() => {
      window.app.quickLogin('dr.smith@mediflow.com', 'Doctor@123');
    });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '07_doctor_portal.png') });

    // 8. Admin Executive Dashboard & AI Risk Inspector
    console.log('[Screenshots] 8. Fast-switching to Admin Dashboard...');
    await page.evaluate(() => {
      window.app.quickLogin('admin@mediflow.com', 'Admin@123');
    });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '08_admin_dashboard.png') });

    // 9. AI No-Show Risk Modal
    console.log('[Screenshots] 9. Triggering AI No-Show Risk Modal...');
    await page.evaluate(() => {
      const btn = document.querySelector('button[onclick*="showNoShowRiskModal"]');
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '09_ai_risk_assessment.png') });

    console.log('✅ All 9 screenshots captured successfully in docs/screenshots/');
  } catch (err) {
    console.error('[Screenshots Error]', err);
  } finally {
    await browser.close();
  }
}

captureAll();
