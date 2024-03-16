const mysql=require('mysql');

const conn=mysql.createConnection({
    "host":"localhost",
    "user":"root",
    "password":"",
    "database":"myecomm"

});

conn.connect(()=>{
    if(conn){
        console.log("Database Connection Estabillished");
    }
})
module.exports=conn