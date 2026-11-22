/**
 * Nóri & Max — RSVP endpoint.
 *
 * A Google Apps Script bound to the "RSVP" Google Sheet (Extensions → Apps Script). Each answer sent
 * from noriandmax.com is added as a row to the sheet, and a summary is emailed to both of you.
 * Your email addresses only live here, in your Google account: they never appear on the public site
 * or in the GitHub repo. Setup: see docs/RSVP-SETUP.md.
 */

// ← the address(es) that get each answer; several are separated by a comma
const RECIPIENTS = "you@domain.com";

const SHEET_NAME = "Answers";
const HEADERS = ["Received", "Name", "Attending", "People", "Children", "Other names",
                 "Diet / allergies", "Email", "Note", "Language"];

function doPost(e) {
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    if (d.website) return reply({ ok: true });          // the hidden field: only bots fill it in

    const name = clean(d.name, 120);
    if (!name) return reply({ ok: false, error: "name" });
    const yes = d.attending === "yes";
    const email = clean(d.email, 160);
    const answer = {
      name,
      attending: yes ? "yes" : "no",
      people: yes ? count(d.people, 1, 12) : 0,
      children: yes ? count(d.children, 0, 12) : 0,
      others: yes ? clean(d.others, 400) : "",
      diet: yes ? clean(d.dietary, 400) : "",
      email,
      note: clean(d.note, 2000),
      lang: clean(d.lang, 5),
    };

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      sheet().appendRow([new Date(), answer.name, answer.attending, answer.people, answer.children,
                         answer.others, answer.diet, answer.email, answer.note, answer.lang].map(safe));
    } finally {
      lock.releaseLock();
    }

    const options = {
      to: RECIPIENTS,
      subject: yes ? `RSVP — ${name}: yes, ${answer.people} ${answer.people > 1 ? "people" : "person"}`
                   : `RSVP — ${name}: sadly no`,
      body: [
        `${name} ${yes ? "will be there" : "can't come"}.`,
        "",
        yes ? `People: ${answer.people}${answer.children ? ` (incl. ${answer.children} ${answer.children > 1 ? "children" : "child"})` : ""}` : "",
        answer.others ? `With: ${answer.others}` : "",
        answer.diet ? `Diet / allergies: ${answer.diet}` : "",
        answer.email ? `Email: ${answer.email}` : "",
        answer.note ? `\nTheir note:\n${answer.note}` : "",
        "",
        `(Answered in ${answer.lang || "?"}. All answers: ${SpreadsheetApp.getActiveSpreadsheet().getUrl()})`,
      ].filter(line => line !== "").join("\n"),
    };
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) options.replyTo = email;   // reply straight to them
    MailApp.sendEmail(options);

    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  }
}

// Opening the web app link in a browser just says it works.
function doGet() {
  return ContentService.createTextOutput("Nóri & Max RSVP endpoint is running.");
}

function sheet() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  let s = book.getSheetByName(SHEET_NAME);
  if (!s) {
    s = book.insertSheet(SHEET_NAME);
    s.appendRow(HEADERS);
    s.setFrozenRows(1);
    s.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  }
  return s;
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function clean(v, max) {
  return String(v == null ? "" : v).replace(/[\u0000-\u0008\u000b-\u001f]/g, "").trim().slice(0, max);
}

function count(v, min, max) {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(Math.max(n, min), max) : min;
}

// A cell starting with = + - @ would be read as a formula by Sheets: keep it as plain text.
function safe(v) {
  return typeof v === "string" && /^[=+\-@]/.test(v) ? "'" + v : v;
}
