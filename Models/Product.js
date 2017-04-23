/**
 * Created by root on 4/4/17.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ProductSchema = new Schema({
    name:{
        type:String,
        required:true,
        index:true,
        sparse:true
    },
    price:{
        type:Number,
        required:true,
    },
    category:{type: Schema.Types.ObjectId,ref:'Category'},
    technicalDetail:{type:Schema.Types.ObjectId,ref:'TechnicalDetail'},
    amount:{
        type:Number,
        required:true,
    },
    state:{
        type:String,
        required:true,
    },
    thumbnail:{
        type:String,
        required:true,
    },
    mainImage:{
        type:String,
        required:true,
    },
    gift:[Schema.Types.Mixed],
    boughtInMonth:Number,
    guaranteeTime:Number,
})
var model = mongoose.model('Product',ProductSchema);
module.exports = model;