/**
 * Convergr intake → Google Sheet (bound script)
 *
 * SETUP (run from the spreadsheet: Extensions → Apps Script)
 * 1. Replace this project’s code with this file (or paste into Code.gs).
 * 2. Save. Run → authorize the script (needs Sheets access).
 * 3. Deploy → New deployment → Select type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy the Web app URL (ends with /exec) and paste it into index.html as INTAKE_SHEETS_WEB_APP_URL.
 * 5. Sheet row 1 must be headers (exact order, column A = submittedAt is the timestamp written by the script):
 *    submittedAt | firstName | lastName | email | phone | mlsId | licenseNumber | city | state | primaryArea | servicingRadiusPrimary | secondaryArea | servicingRadiusSecondary | accountManager | plan | billingStreet | billingCity | billingState | billingZip | billingCountry | shippingStreet | shippingCity | shippingState | shippingZip | shippingCountry | shippingSameAsBilling
 *
 * CORS: The site POSTs as application/x-www-form-urlencoded with one field `payload` (JSON string).
 * That is a “simple” browser request (no preflight). Do not switch the site to application/json
 * unless you add a server-side proxy, because JSON POST triggers OPTIONS which Apps Script does not answer.
 *
 * OPTIONAL anti-spam: Script editor → Project Settings → Script properties → Add property
 *   INTAKE_SECRET = your-long-random-string
 * Then set the same value in the site as INTAKE_SHEETS_SHARED_SECRET (see index.html).
 */

var SHEET_NAME = 'Sheet1'; // change if your tab is named differently

function doGet(e) {
  if (e && e.parameter && e.parameter.ping === '1') {
    return jsonOutput_({ ok: true, ping: 'intake-webapp' });
  }
  return jsonOutput_({ ok: true, message: 'POST JSON inside form field payload= (urlencoded), or ?ping=1 for health check.' });
}

function doPost(e) {
  var lock = LockService.getDocumentLock();
  try {
    lock.waitLock(20000);
  } catch (err) {
    return jsonOutput_({ ok: false, error: 'Server busy, try again.' });
  }
  try {
    var data = parseIntakePayload_(e);
    validateOptionalSecret_(data);
    appendIntakeRow_(data);
    return jsonOutput_({ ok: true });
  } catch (err) {
    return jsonOutput_({ ok: false, error: err.message || String(err) });
  } finally {
    lock.releaseLock();
  }
}

function parseIntakePayload_(e) {
  var raw = '';
  if (e.parameter && e.parameter.payload) {
    raw = e.parameter.payload;
  } else if (e.postData && e.postData.contents) {
    raw = e.postData.contents;
  }
  if (!raw) {
    throw new Error('Missing payload');
  }
  var data = JSON.parse(raw);
  return data;
}

function validateOptionalSecret_(data) {
  var expected = PropertiesService.getScriptProperties().getProperty('INTAKE_SECRET');
  if (!expected) {
    return;
  }
  if (!data || data.intakeSecret !== expected) {
    throw new Error('Unauthorized');
  }
}

function appendIntakeRow_(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.getSheets()[0];
  }
  var now = new Date();
  sheet.appendRow([
    now,
    cell_(data.firstName),
    cell_(data.lastName),
    cell_(data.email),
    cell_(data.phone),
    cell_(data.mlsId),
    cell_(data.licenseNumber),
    cell_(data.city),
    cell_(data.state),
    cell_(data.primaryArea),
    cell_(data.servicingRadiusPrimary),
    cell_(data.secondaryArea),
    cell_(data.servicingRadiusSecondary),
    cell_(data.accountManager),
    cell_(data.plan),
    cell_(data.billingStreet),
    cell_(data.billingCity),
    cell_(data.billingState),
    cell_(data.billingZip),
    cell_(data.billingCountry),
    cell_(data.shippingStreet),
    cell_(data.shippingCity),
    cell_(data.shippingState),
    cell_(data.shippingZip),
    cell_(data.shippingCountry),
    cell_(data.shippingSameAsBilling)
  ]);
}

function cell_(v) {
  if (v === null || v === undefined) {
    return '';
  }
  return String(v);
}

function jsonOutput_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
