import mongoose from 'mongoose'

const ShortLinkSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    originalUrl: { type: String, required: true },
    shortCode: { type: String, required: true, unique: true, index: true },
    clicks: { type: Number, default: 0 },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export default mongoose.models.ShortLink || mongoose.model('ShortLink', ShortLinkSchema)
