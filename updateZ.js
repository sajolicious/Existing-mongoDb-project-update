
const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://sajol:K0S3eCZ9R6QXRHnO@cluster0.sngd13i.mongodb.net/';
const dbName = 'mvp2';

async function main() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db(dbName);

    await updateGslCodeForSpecificAsins(db); // Only update GSL codes

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

async function updateGslCodeForSpecificAsins(db) {
  const masterAsinUpcCollection = db.collection('master_asin_upc');

  try {
    const asinsToUpdate = [
     
      'B0000C47DM',
     
    ];

    // Find ASINs in master_asin_upc collection and update gsl_code to 'D'
    const result = await masterAsinUpcCollection.updateMany(
      { ASIN: { $in: asinsToUpdate } },
      { $set: { gsl_code: 'Z' } }
    );

    console.log(`Updated gsl_code to 'Z' for ${result.modifiedCount} documents in master_asin_upc`);
  } catch (error) {
    console.error('Error updating gsl_code in master_asin_upc:', error);
  }
}

// Execute the main function
main().catch(console.error);
