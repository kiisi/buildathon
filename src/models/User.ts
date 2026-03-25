import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, unique: true, sparse: true, default: null },
    plan: { type: String, enum: ['free', 'pro'], default: 'free' },
    lastTxnRef: { type: String, default: null },
  },
  { timestamps: true },
)

export default mongoose.models.User || mongoose.model('User', UserSchema)
