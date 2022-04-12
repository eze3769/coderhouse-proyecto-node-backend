import mongoose from "mongoose";

const MessagesSchema = new mongoose.Schema({
    email: {type:String, required:true},
    message: {type:Number, required:true},
});

const Messages = mongoose.model('Messages', MessagesSchema);

export default Messages;