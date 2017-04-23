/**
 * Created by root on 4/4/17.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var CategorySchema = new Schema({
    name:{
        type:String,
        required:true,
        index:true,
        sparse:true
    },

})
var model = mongoose.model('Category',CategorySchema);
module.exports = model;