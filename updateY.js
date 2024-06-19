const { MongoClient } = require('mongodb');
const fs = require('fs');
const csv = require('csv-parser');

const uri = 'mongodb+srv://sajol:K0S3eCZ9R6QXRHnO@cluster0.sngd13i.mongodb.net/';
const dbName = 'mvp2';
const csvFilePath = 'Scan-Table 1.csv';  

async function readCsvFile(filePath) {
  const asins = new Set();
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        asins.add(row.ASIN); 
      })
      .on('end', () => {
        resolve(asins);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

async function updateToBeScrapedField(db, asinsFromCsv) {
  const collection = db.collection('master_asin_upc');

  try {
    // set y
    const resultY = await collection.updateMany(
      { ASIN: { $in: Array.from(asinsFromCsv) } },
      { $set: { To_Be_Scraped: 'Y' } }
    );
    console.log(`Updated To_Be_Scraped to 'Y' for ${resultY.modifiedCount} documents`);

    // set n
    const resultN = await collection.updateMany(
      { ASIN: { $nin: Array.from(asinsFromCsv) } },
      { $set: { To_Be_Scraped: 'N' } }
    );
    console.log(`Updated To_Be_Scraped to 'N' for ${resultN.modifiedCount} documents`);
  } catch (error) {
    console.error('Error updating To_Be_Scraped field:', error);
  }
}

async function main() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db(dbName);

    const asinsFromCsv = await readCsvFile(csvFilePath);
    await updateToBeScrapedField(db, asinsFromCsv);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

main().catch(console.error);
