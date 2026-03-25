import mongoose from 'mongoose'

const QrCodeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    url: { type: String, required: true },
    label: { type: String, default: '' },
    fgColor: { type: String, default: '#1a1a1a' },
    bgColor: { type: String, default: '#ffffff' },
    shape: { type: String, enum: ['square', 'rounded', 'dots'], default: 'rounded' },
    frame: { type: String, enum: ['none', 'simple', 'branded'], default: 'simple' },
  },
  { timestamps: true },
)

export default mongoose.models.QrCode || mongoose.model('QrCode', QrCodeSchema)
