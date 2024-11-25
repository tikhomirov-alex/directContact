const axios = require('axios');
const sheets = require('./google_sheets_client');

const API_URL = 'http://94.103.91.4:5000';
const AUTH_ENDPOINT = '/auth/login';
const CLIENTS_ENDPOINT = '/clients';

const DATA_ITEMS_CHUNK = 1000;
const REQUEST_INTERVAL = 2000;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const main = async () => {
  const username = 'alex-tikhomiroff';

  const tokenResponse = await axios.post(
    `${API_URL}${AUTH_ENDPOINT}`,
    { username },
  );

  if (!tokenResponse || !tokenResponse.data) {
    throw new Error('Не удалось получить токен');
  }

  const { token } = tokenResponse.data;

  const config = {
    headers: {
      Authorization: token
    }
  };

  const spreadsheetId = '1kHKkaLki6Kt1AV-pOh-4xqDQmV1zCT7xyjmmzb5T4ic';
  const range = 'Clients';

  let page = 0;
  while (true) {
    const limit = DATA_ITEMS_CHUNK;
    const offset = page * DATA_ITEMS_CHUNK;

    const queryUrl = `${API_URL}${CLIENTS_ENDPOINT}?limit=${limit}&offset=${offset}`;

    await sleep(REQUEST_INTERVAL);

    const clientsResponse = await axios.get(
      queryUrl,
      config
    );
    if (!clientsResponse || !clientsResponse.data) {
      throw new Error('Ошибка получения данных');
    }

    const clients = clientsResponse.data;

    const data = [];
    for (const client of clients) {
      data.push([
        client.id,
        client.firstName,
        client.lastName,
        client.gender,
        client.address,
        client.city,
        client.phone,
        client.email,
        client.status
      ]);
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${range}!A${offset + 1}:I${limit + page * limit}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: data,
      },
    });

    if (clients.length < DATA_ITEMS_CHUNK) {
      console.log('Данные успешно внесены в таблицу');
      break;
    }
    page++;
  }

}

main().catch(console.error);