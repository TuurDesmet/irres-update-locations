const BOT_ID = process.env.BOT_ID;
const TOKEN = process.env.TOKEN;

async function updateTable(tableName, columnName, apiUrl) {
  try {
    // Fetch data from the API
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch from ${apiUrl}: ${response.statusText}`);
    }
    const apiResponse = await response.json();

    let dataToAdd = [];
    if (tableName === 'LocationsFilter') {
      // For locations: apiResponse.data.locations is an array of strings
      dataToAdd = apiResponse.data.locations.map(location => ({ [columnName]: location }));
    } else if (tableName === 'OfficesImages') {
      // For images: apiResponse.data is an object { key: url, ... }
      dataToAdd = Object.entries(apiResponse.data).map(([name, url]) => ({ [columnName]: { name, url } }));
    }

    const baseUrl = `https://api.botpress.cloud/v1/bots/${BOT_ID}/tables/${tableName}`;
    const rowsUrl = `${baseUrl}/rows`;

    // List existing rows
    const listRes = await fetch(rowsUrl, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    if (!listRes.ok) {
      throw new Error(`Failed to list rows for ${tableName}: ${listRes.statusText}`);
    }
    const rows = await listRes.json();

    // Delete existing rows
    for (const row of rows) {
      const deleteRes = await fetch(`${rowsUrl}/${row.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${TOKEN}` }
      });
      if (!deleteRes.ok) {
        console.warn(`Failed to delete row ${row.id} in ${tableName}: ${deleteRes.statusText}`);
      }
    }

    // Add new rows
    for (const item of dataToAdd) {
      const addRes = await fetch(rowsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN}`
        },
        body: JSON.stringify({ data: item })
      });
      if (!addRes.ok) {
        console.error(`Failed to add row to ${tableName}: ${addRes.statusText}`);
      }
    }

    console.log(`Updated ${tableName} with ${dataToAdd.length} items`);
  } catch (error) {
    console.error(`Error updating ${tableName}:`, error);
    process.exit(1);
  }
}

async function main() {
  await updateTable('LocationsFilter', 'Locations', 'https://irres-location-scraper.onrender.com/api/locations');
  await updateTable('OfficesImages', 'Image', 'https://irres-location-scraper.onrender.com/api/office-images');
}

main();