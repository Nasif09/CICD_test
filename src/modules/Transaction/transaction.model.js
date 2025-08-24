const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: false },
    transactionId: { type: String, required: false },
    paymentMethod: { type: String, required: false },
    subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', required: false }
    // status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('TransactionModel', transactionSchema);