import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    username: { type: String, unique: true, sparse: true, default: null },
    plan: { type: String, enum: ['free', 'pro'], default: 'free' },
    lastTxnRef: { type: String, default: null },
    planRenewsAt: { type: Date, default: null },
    allowDataSharing: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export default mongoose.models.User || mongoose.model('User', UserSchema)
