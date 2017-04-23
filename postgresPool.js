/**
 * Created by root on 4/7/17.
 */
var pg = require('pg');
pg.defaults.ssl = true;
var config ={
    user:'irrhddwpmwfaqm',
    database:'d5mbk0nc05rfq5',
    password:'5d6a8fb9f554dd42d294bf1c96152c242ca41a8a7edf84c7d243cd1346afe556',
    host:'ec2-54-243-185-123.compute-1.amazonaws.com',
    port:5432
}
var pool = new pg.Pool(config);
module.exports = pool;