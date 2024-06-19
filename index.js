const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://sajol:K0S3eCZ9R6QXRHnO@cluster0.sngd13i.mongodb.net/';
const dbName = 'mvp2';

async function main() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db(dbName);

    await copyAsinFromMasterAsin(db);
  

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

async function copyAsinFromMasterAsin(db) {
  const masterAsinCollection = db.collection('master_asin');
  const masterAsinUpcCollection = db.collection('master_asin_upc');

  try {
    const asinsToCopy = await masterAsinCollection.find({}, { projection: { ASIN: 1 } }).toArray();

    if (asinsToCopy.length === 0) {
      console.log('No ASINs found in master_asin collection.');
      return;
    }

    const bulkOperations = asinsToCopy.map(doc => ({
      updateOne: {
        filter: { ASIN: doc.ASIN },
        update: { $set: { ASIN: doc.ASIN } },
        upsert: true,
      },
    }));

    const result = await masterAsinUpcCollection.bulkWrite(bulkOperations);
    console.log(`Copied ASIN from master_asin to master_asin_upc for ${result.modifiedCount} documents`);
  } catch (error) {
    console.error('Error during copyAsinFromMasterAsin:', error);
  }
}


// Execute the main function
main().catch(console.error);
