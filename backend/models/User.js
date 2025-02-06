const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true
  },
  firstname: {
    type: String
  },
  lastname: {
    type: String
  },
  password: {
    type: String
  },
  createdon: { 
    type: Date
  },

});


const User = mongoose.model("User", UserSchema);
module.exports = User;