const BOT_ID = process.env.BOT_ID;
const TOKEN = process.env.TOKEN;

async function updateTable(tableName, columnName, apiUrl) {
  try {
    console.log(`Fetching data from ${apiUrl}...`);
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch from ${apiUrl}: ${response.statusText}`);
    }
    const apiResponse = await response.json();

    let rows = [];
    if (tableName === 'LocationsFilterTable') {
      // For locations: apiResponse.data.locations is an array of strings
      rows = apiResponse.data.locations.map(location => ({ [columnName]: location }));
    } else if (tableName === 'OfficeImagesTable') {
      // For images: apiResponse.data is an object { key: url, ... }
      rows = Object.entries(apiResponse.data).map(([name, url]) => ({ [columnName]: { name, url } }));
    }

    console.log(`Deleting all rows from ${tableName}...`);
    const deleteRes = await fetch(`https://api.botpress.cloud/v1/tables/${tableName}/rows/delete`, {
      method: 'POST',
      headers: {
        'x-bot-id': BOT_ID,
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ deleteAllRows: true })
    });

    if (!deleteRes.ok) {
      throw new Error(`Failed to delete rows in ${tableName}: ${deleteRes.statusText}`);
    }

    const deleteData = await deleteRes.json();
    console.log(`Deleted rows:`, deleteData);

    if (rows.length > 0) {
      console.log(`Inserting ${rows.length} new rows into ${tableName}...`);
      const insertRes = await fetch(`https://api.botpress.cloud/v1/tables/${tableName}/rows`, {
        method: 'POST',
        headers: {
          'x-bot-id': BOT_ID,
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rows, waitComputed: true })
      });

      if (!insertRes.ok) {
        throw new Error(`Failed to insert rows into ${tableName}: ${insertRes.statusText}`);
      }

      const insertData = await insertRes.json();
      console.log(`Inserted rows:`, insertData);
    }

    console.log(`✅ ${tableName} updated successfully!`);
  } catch (error) {
    console.error(`❌ Error updating ${tableName}:`, error.message);
    process.exit(1);
  }
}

async function main() {
  await updateTable('LocationsFilterTable', 'Locations', 'https://irres-location-scraper.onrender.com/api/locations');
  await updateTable('OfficeImagesTable', 'Image', 'https://irres-location-scraper.onrender.com/api/office-images');
}

main();