var pg = require('pg');
var config = require('../../config').DATABASES;


//this initializes a connection pool
//it will keep idle connections open for a 30 seconds
//and set a limit of maximum 10 idle clients
var pool = new pg.Pool(config);

// to run a query we can acquire a client from the pool,
// run a query on the client, and then return the client to the pool
var executeQuery  = function(callBack){
    var query = this.sql_query;
    pool.connect(function(err, client, done) {
        if(err) {
            return console.error('error fetching client from pool', err);
        }
        client.query(query, function(err, result) {
            //call `done()` to release the client back to the pool
            done();

            if(err) {
                return callBack(err,null);
            }
            return callBack(null, result);
            //output: 1
        });
    });

    pool.on('error', function (err, client) {
        // if an error is encountered by a client while it sits idle in the pool
        // the pool itself will emit an error event with both the error and
        // the client which emitted the original error
        // this is a rare occurrence but can happen if there is a network partition
        // between your application and the database, the database restarts, etc.
        // and so you might want to handle it and at least log it out
        return callBack(err, null);
    })
};

module.exports = {
    executeQuery: executeQuery
};