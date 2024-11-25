const { google } = require('googleapis');
const fs = require('fs');

let sheets = null;

try {
  const filePath = 'C:\\googleapis.json';
  const configFile = fs.readFileSync(filePath, 'utf8');
  const credentials = JSON.parse(configFile);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  sheets = google.sheets({ version: 'v4', auth });
} catch (error) {
  console.error(`Error setting up Google Sheets API client: ${error}`);
  sheets = null;
}

module.exports = sheets;