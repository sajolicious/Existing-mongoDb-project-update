const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://sajol:K0S3eCZ9R6QXRHnO@cluster0.sngd13i.mongodb.net/';
const dbName = 'mvp2';

async function main() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db(dbName);

    await updateGslCodeForSpecificAsins(db);

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
      "B00026LJQQ", "B000A0IJ08", "B000BASLJG", "B000BW94A4", "B000BZHV74",
      "B000E5RBNK", "B000EEHDZW", "B000EEHEH4", "B000EEHHBW", "B000EEJ5PI",
      "B000EEJ8VE", "B000EEJ9G8", "B000EEJE4K", "B000EEJG9S", "B000EEL3ZS",
      "B000EEL58I", "B000EEL6PA", "B000EEL75O", "B000EEL9H0", "B000EEL9NE",
      "B000EEL9Y8", "B000EEL9YI", "B000EELA60", "B000EELF0G", "B000EEMA6O",
      "B000EEN9GO", "B000EENBVM", "B000EENEC8", "B000EENHHK", "B000EENHJ8",
      "B000EENL4O", "B000ETQE2A", "B000FET3DG", "B000FHGNS6", "B000GS5XPI",
      "B000GZZOPA", "B000IU3VI0", "B000IU3W98", "B000KGY974", "B000KH0EEU",
      "B000L9BXO2", "B000LARYI0", "B000LB13YK", "B000LNEB0G", "B000LPJ28U",
      "B000LPWKZC", "B000M4W2E6", "B000NUYAVW", "B000RW891S", "B000TEDNC4",
      "B000UAAENI", "B000VYX9IA", "B000WIPGG8", "B000ZLXT1G", "B00144DJE0",
      "B0016ISXG8", "B0017S88JY", "B001B75VM8", "B001CIYXD4", "B001DZOKFW",
      "B001E14SDY", "B001J3J008", "B001LIMZHG", "B001M5TZTY", "B001MTERIE",
      "B001OX8K5E", "B001RYSHFI", "B001VD9KCY", "B002FOP6VC", "B0038GWCKO",
      "B003CJTNQS", "B003H029U4", "B003H02ENQ", "B003H02ERM", "B003H03UUW",
      "B003H0869C", "B003H086HY", "B003H0893A", "B003H0BFBS", "B003L0OOVC",
      "B003O9Y9A6", "B003OXWYQ8", "B003R4JFYS", "B003S7433W", "B003UGGOBK",
      "B003ULP8JE", "B003US3ZHO", "B003WOS0U8", "B003WWS2Q2", "B003XNBJQ0",
      "B003XNDGJ8", "B003YH04PW", "B003YLXNM4", "B0045YGP6U", "B00466I4FW",
      "B004BP4Y5C", "B004BP5MNU", "B004BTSCZG", "B004CLA6MA", "B004GSQ7BI",
      "B004HE99OI", "B004KKXALW", "B004LXGKEM", "B004PIZSX2", "B004PJ6AII",
      "B004VZK960", "B004VZKOMO", "B004VZKOYC", "B004VZKV5Y", "B004X5WT52",
      "B004XVOIOQ", "B004Y3SC8Q", "B004YWGX1K", "B0053Q2C70", "B0054HGHWY",
      "B00555U7E4", "B005G2CEBK", "B005QSB5HS", "B005R4QLCA", "B005SF3FGI",
      "B005UGC2EG", "B005XJYAY0", "B00604R04Y", "B0062Y5HD8", "B0062Y7CEU",
      "B0068JBD8K", "B0069LAUL8", "B0069RWQN2", "B006CQVFLY", "B006DI70SS",
      "B006DI8IKW", "B006DI8V22", "B006DIDX0C", "B006FFA1XU", "B006FGWJ3O",
      "B006JNXSTW", "B006JNZXEU", "B006JO1EI8", "B006K409QU", "B006LN85QG",
      "B006VC5X12", "B006VVJK7G", "B0070UL2LO", "B007415792", "B007L19C4Q",
      "B007R2ICTK", "B007RX5UFI", "B007UFCUHE", "B007Y3FBZA", "B0083HGBDW",
      "B0084EH32M", "B008CMYCL6", "B008FW7IDM", "B008K7JPOW", "B008K7JQQ4",
      "B008UV92LO", "B008VDW51U", "B0091CPXG4", "B0093IS19C", "B0094G5H2M",
      "B009F7O77Q", "B009LRIH2G", "B009Q3UW00", "B00A79BFXK", "B00AHUBXOA",
      "B00AIH2HHO", "B00AYGBX74", "B00B24OI1U", "B00B24PPR6", "B00BEQ1F94",
      "B00BFBBHQ4", "B00BFBBOMQ", "B00BFBBQGU", "B00BGAGYWG", "B00BLDKJU6",
      "B00BM892MG", "B00BSVRYWC", "B00BV4V1Y8", "B00CAKD3SE", "B00CAKD5W8",
      "B00CHOC2SA"
    ];

    // Find ASINs in the database
    const foundAsins = await masterAsinUpcCollection.find({ ASIN: { $in: asinsToUpdate } }).toArray();
    const foundAsinList = foundAsins.map(item => item.ASIN);
    const notFoundAsins = asinsToUpdate.filter(asin => !foundAsinList.includes(asin));

    if (foundAsinList.length > 0) {
      // Update found ASINs
      const result = await masterAsinUpcCollection.updateMany(
        { ASIN: { $in: foundAsinList } },
        { $set: { gsl_code: 'D' } }
      );
      console.log(`Updated gsl_code to 'D' for ${result.modifiedCount} documents in master_asin_upc`);
    }
    if (notFoundAsins.length > 0) {
      console.log(`The following ASINs were not found in the database: ${notFoundAsins.join(', ')}`);
    }
  } catch (error) {
    console.error('Error updating gsl_code in master_asin_upc:', error);
  }
}

// Execute the main function
main().catch(console.error);
