var elasticsearch = require('elasticsearch');
var csv = require('csv-parser');
var fs = require('fs');

var esClient = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'error'
});

// Fonction utilitaire permettant de formatter les données pour l'insertion "bulk" dans elastic
const createBulkInsertQuery = calls => {
  const body = calls.reduce((acc, call) => {
    acc.push({ index: { _index: '911', _type: 'call', _id: call.timeStamp } })
    acc.push(call)
    return acc
  }, []);

  return { body };
}

const calls = [];

fs.createReadStream('../911.csv')
    .pipe(csv())
    .on('data', data => {
      calls.push({
        coords: {
          latitude: data.lat,
          longitude: data.lng
        },
        description: data.desc,
        zip: data.zip,
        title: data.title,
        timeStamp: data.timeStamp,
        twp: data.twp,
        address: data.addr,
        e: data.e 
      });
    })
    .on('end', () => {
      esClient.bulk(createBulkInsertQuery(calls), (err, resp) => {
        if (err) console.trace(err.message);
        else console.log(`Inserted ${resp.items.length} calls`);
        esClient.close();
      });
    });
