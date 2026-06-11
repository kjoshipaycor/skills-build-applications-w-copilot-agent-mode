import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity extends Document {
  user: mongoose.Types.ObjectId;
  activityType: string;
  duration: number;
  distance?: number;
  caloriesBurned: number;
  date: Date;
  notes?: string;
}

const ActivitySchema = new Schema<IActivity>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  activityType: {
    type: String,
    required: true,
    enum: ['running', 'walking', 'cycling', 'swimming', 'strength_training', 'yoga', 'other'],
  },
  duration: { type: Number, required: true, min: 1 },
  distance: { type: Number, min: 0 },
  caloriesBurned: { type: Number, required: true, min: 0 },
  date: { type: Date, default: Date.now },
  notes: { type: String, default: '' },
});

export default mongoose.model<IActivity>('Activity', ActivitySchema);
