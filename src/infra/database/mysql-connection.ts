import mysql from 'mysql2/promise';

let port = 3306
if(process.env.MYSQL_PORT){
    port = parseInt(process.env.MYSQL_PORT); 
}
    
export const connection = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: port,  
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    namedPlaceholders: true,
    connectTimeout: 10000,
    //debug: true
});



