import mongoose from 'mongoose'

const PollOptionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  votes: { type: Number, default: 0 },
})

const PollSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    question: { type: String, required: true },
    options: [PollOptionSchema],
    status: { type: String, enum: ['active', 'ended'], default: 'active' },
    allowMultiple: { type: Boolean, default: false },
  },
  { timestamps: true },
)

export default mongoose.models.Poll || mongoose.model('Poll', PollSchema)
