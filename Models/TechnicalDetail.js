/**
 * Created by root on 4/4/17.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var TechnicalDetailSchema = new Schema({
    cpu:String,
    internalStrorage:String,
    ram:String,
    screenSize:Number,
    resolution:String,
    simKind:String,
    GPS:Boolean,
    wifi:String,
    externalStroage:String,

})
var model = mongoose.model('TechnicalDetail',TechnicalDetailSchema);
module.exports = model;