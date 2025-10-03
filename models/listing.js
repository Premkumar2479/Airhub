const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        requried:true,
    },

    description: String,
    image:{
        filename:{
            type:String,
            default:"listingimage"
        },
        url:{
        type:String,
        default:
            "https://www.pexels.com/photo/red-tables-and-chairs-in-the-room-4116411/",
        set:(v) => v ===""?"https://www.pexels.com/photo/red-tables-and-chairs-in-the-room-4116411/":v,
        }
    },
    price: Number,
    location:String,
    country:String,

});

const listing =mongoose.model("Listing",listingSchema);
module.exports =listing;