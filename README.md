# auzmor
Above Repository is node js app, which provides rest api service for phone dir data.

<b>Install Repository Files </b>  
To start the above app follow the below steps:
1. git clone https://github.com/anupam587/auzmor.git
2. cd Auzmor
3. npm install

Above steps will install all the required modules from global npm repository

<b>Postgresql Database </b>  
Now install the PostgreSQL in your local machine   
import the sql dump data in postgresql from below location  
https://gist.github.com/paragradke/a629bb4e332125b1388390fcc156cfcd [sql dump file]


<b>Redis cache </b>  
Download redis in the local machine. So server can connected on default host: 'localhost' and port '6379'.  


<b>Start App </b>  
Now Above app is ready to start with database and reids cache inplace  
To start above app   
node bin/www  
above app will by default start on 6789 port number 

<b>App config </b>  
In above app <b>config/index.js </b> we have the configuration for above rest api service    

DATABASES:    
   
    user: PGUSER, //env var: PGUSER
    database: PGDATABASE //env var: PGDATABASE
    password: PGPASSWORD //env var: PGPASSWORD
    host: '127.0.0.1' // Server hosting the postgres database
    port: 5432 //env var: PGPORT
    max: 2 // max number of client connection in the pool
    idleTimeoutMillis: 30000// how long a client is allowed to remain idle before being closed]

OTHER SETTINGS:

    INBOUND_STOP_SMS_EXP_TIME: 14400, //4 hours exp time  
    OUTBOUND_STOP_SMS_EXP_TIME: 86400, //24 hours exp time  
    OUTBOUND_SMS_LIMIT: 50, //50 is the limit for outbound sms  
    APP_PORT: 6789,  
    REDIS_SERVER_HOST: 'localhost', //default redis server host   
    REDIS_SERVER_PORT: '6379' //default redis server port 
    
<b> Rest Services </b>  

<b> Get Request </b>  
     
    url : 'http://localhost:6789/':  
    Result : {"title":"Auzmor"}


<b> POST Request </b> 

<b> /inbound/sms </b>

    url:  http://localhost:6789/inbound/sms
    Content-Type : 'application/json'
    Request headers for basic authentication:
      username: azr1
      auth_id: 20S0KPNOIM
    Payload : {"to": "3253280329", "fro": "4924195509012", "text": "hello"}


    Multiple Responses:
    Based on the payload and request header differnt responses will come.
    
    {
      "status": 200,
      "message": "Inbound Sms OK"
    }
    
    {
      "status": 400,
      "message": "error frm is invalid"
    }
    
    {
      "status": 500,
      "message": "to parameter not found"
    }
    
    {
      "status": 400,
      "message": "to is missing"
    }
    
    {
     "status": 400,
     "message": "to is missing"
    }
    
   
<b> /outbound/sms </b>

    url:  http://localhost:6789/outbound/sms
    Content-Type : 'application/json'
    Request headers for basic authentication:
      username: azr1
      auth_id: 20S0KPNOIM
    Payload : {"to": "3253280329", "fro": "4924195509012", "text": "hello"}


    Multiple Responses:
    Based on the payload and request header differnt responses will come.
    
    {
      "status": 200,
      "message": "Outbound Sms OK"
    }
    
    {
      "status": 400,
      "message": "error frm is invalid"
    }
    
    {
      "status": 500,
      "message": "from parameter not found"
    }
    
    {
     "status": 400,
     "message": "to is missing"
    } 
    
    {
      "status": 500,
      "message": "limit reached  for from 4924195509012"
    }
    
    {
      "status": 400,
      "message": "sms from 4924195509012 to 3253280329 is blocked"
    }
    
    
    
    
