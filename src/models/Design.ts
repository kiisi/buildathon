import mongoose from 'mongoose'

const DesignSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    profileTitle: { type: String, default: '' },
    profileBio: { type: String, default: '' },
    profileLayout: { type: String, enum: ['classic', 'hero'], default: 'classic' },
    activeTheme: { type: String, default: 't1' },
    bgColor: { type: String, default: '#ffffff' },
    btnShape: { type: String, enum: ['rect', 'soft', 'pill'], default: 'pill' },
    btnStyle: { type: String, enum: ['solid', 'outline', 'shadow'], default: 'shadow' },
    btnColor: { type: String, default: '#ffffff' },
    btnFontColor: { type: String, default: '#0f172a' },
    fontFamily: { type: String, default: 'Plus Jakarta Sans' },
    fontColor: { type: String, default: '#0f172a' },
    profileImage: { type: String, default: '' },
  },
  { timestamps: true },
)

export default mongoose.models.Design || mongoose.model('Design', DesignSchema)
