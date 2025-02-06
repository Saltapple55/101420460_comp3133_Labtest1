const mongoose = require('mongoose');

const GroupMessageSchema = new mongoose.Schema({
  from_user: {
    type: String,
  },
  room: {
    type: String
  },
  message: {
    type: String
  },
  date_sent: { 
    type: Date,
    default:Date.now

  },

});


const GroupMessage = mongoose.model("GroupMessage", GroupMessageSchema);
module.exports = GroupMessage;