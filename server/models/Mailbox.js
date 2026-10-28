// Mailbox State Mongoose Schema and Model (Module 5 & Module 6)
const mongoose = require('mongoose');

const MailboxSchema = new mongoose.Schema({
  flashOn: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Mailbox', MailboxSchema);
