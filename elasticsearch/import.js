var elasticsearch = require('elasticsearch');
var csv = require('csv-parser');
var fs = require('fs');

var esClient = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'error',
  requestTimeout: 60000
});

esClient.indices.create({
  index: '911',
  body : {
    mappings: {
      call: {
        properties : {
          location : { type: 'geo_point' },
          category:{
            type: "text",
            fielddata: true
          }
        }
      }
    }
  }
}, (err, resp) => {
  if (err) console.trace(err.message);
});

// Fonction utilitaire permettant de formatter les données pour l'insertion "bulk" dans elastic
const createBulkInsertQuery = calls => {
  const body = calls.reduce((acc, call) => {
    acc.push({ index: { _index: '911', _type: 'call' }})
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
        location: {
          lat: parseFloat(data.lat),
          lon: parseFloat(data.lng)
        },
        description: data.desc,
        zip: data.zip,
        category: data.title.split(':')[0],
        title: data.title.split(':')[1],
        timeStamp: data.timeStamp,
        date: new Date(data.timeStamp),
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
