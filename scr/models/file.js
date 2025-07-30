import mongoose from "mongoose";

const fileSchema= new mongoose.Schema({
    name:{
        type: String,
        required:true
    },
    imageUrl:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    tag:{
        type:String,
        required:true
    }
});

export default mongoose.model('files',fileSchema);