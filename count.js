const { MongoClient } = require('mongodb');
const fs = require('fs');
const csvParser = require('csv-parser');

const uri = 'mongodb+srv://sajol:K0S3eCZ9R6QXRHnO@cluster0.sngd13i.mongodb.net/';
const dbName = 'mvp2';
const csvFilePath = 'Scan-Table 1.csv';  // Update this with the path to your CSV file

async function main() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db(dbName);
    const collection = db.collection('master_asin_upc');

    // Read and parse the CSV file
    const asinsFromCsv = await readAsinsFromCsv(csvFilePath);
    console.log(`Read ${asinsFromCsv.length} ASINs from CSV file`);

    // Check which ASINs from the CSV are already in the collection
    const existingAsinsCursor = await collection.find({ ASIN: { $in: asinsFromCsv } }, { projection: { ASIN: 1 } });
    const existingAsinsArray = await existingAsinsCursor.toArray();
    const existingAsins = new Set(existingAsinsArray.map(doc => doc.ASIN));

    // Determine ASINs missing from the collection
    const missingAsins = asinsFromCsv.filter(asin => !existingAsins.has(asin));
    console.log(`Missing ASINs in master_asin_upc: ${missingAsins.length}`);

    // Update To_Be_Scraped to 'Y' for existing ASINs
    const result1 = await collection.updateMany(
      { ASIN: { $in: Array.from(existingAsins) } },
      { $set: { To_Be_Scraped: 'Y' } }
    );
    console.log(`Updated To_Be_Scraped to 'Y' for ${result1.modifiedCount} documents`);

    // Update To_Be_Scraped to 'N' for all other ASINs
    const result2 = await collection.updateMany(
      { ASIN: { $nin: asinsFromCsv } },
      { $set: { To_Be_Scraped: 'N' } }
    );
    console.log(`Updated To_Be_Scraped to 'N' for ${result2.modifiedCount} documents`);

    // Count the total number of documents with To_Be_Scraped set to 'Y'
    const countY = await collection.countDocuments({ To_Be_Scraped: 'Y' });
    console.log(`Total documents with To_Be_Scraped = 'Y': ${countY}`);

    // Count the total number of documents with To_Be_Scraped set to 'N'
    const countN = await collection.countDocuments({ To_Be_Scraped: 'N' });
    console.log(`Total documents with To_Be_Scraped = 'N': ${countN}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

async function readAsinsFromCsv(filePath) {
  return new Promise((resolve, reject) => {
    const asins = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => {
        if (row.ASIN) {
          // Sanitize ASINs: trim whitespace and convert to uppercase for consistency
          asins.push(row.ASIN.trim().toUpperCase());
        }
      })
      .on('end', () => {
        resolve(asins);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

main().catch(console.error);
