import mongoose from 'mongoose'

const PaymentHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    txnRef: { type: String, required: true, unique: true },
    amount: { type: Number, required: true }, // in kobo
    status: { type: String, enum: ['success', 'failed', 'pending'], default: 'pending' },
    plan: { type: String, enum: ['pro'], required: true },
    period: { type: String, default: 'monthly' },
  },
  { timestamps: true },
)

export default mongoose.models.PaymentHistory ||
  mongoose.model('PaymentHistory', PaymentHistorySchema)
