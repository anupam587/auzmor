var appConfigByEnvironment = {
    prod: {
        DATABASES: {
            user: 'postgres', //env var: PGUSER
            database: 'phonedir', //env var: PGDATABASE
            password: 'anupam123', //env var: PGPASSWORD
            host: '127.0.0.1', // Server hosting the postgres database
            port: 5432, //env var: PGPORT
            max: 2, // max number of clients in the pool
            idleTimeoutMillis: 30000// how long a client is allowed to remain idle before being closed]
        },
        INBOUND_STOP_SMS_EXP_TIME: 14400, //4 hours exp time
        OUTBOUND_STOP_SMS_EXP_TIME: 180, //24 hours exp time
        OUTBOUND_SMS_LIMIT: 5 //50 is the limit for outbound sms
    }
};

module.exports = appConfigByEnvironment['prod'];