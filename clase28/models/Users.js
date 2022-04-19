import mongoose from "mongoose";

const UsersSchema = new mongoose.Schema({
    email: {type:String, required:true},
    password: {type:String, required:true},

});

const Users = mongoose.model('Users', UsersSchema);

export default Users;
