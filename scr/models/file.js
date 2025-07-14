import mongoose from "mongoose";

const fileSchema= new mongoose.Schema({
    name:{
        type: String,
        required:true
    },
    size:{
        type:Number,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
});

export default mongoose.model('files',fileSchema);