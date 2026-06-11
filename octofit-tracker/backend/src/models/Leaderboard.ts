import mongoose, { Document, Schema } from 'mongoose';

export interface ILeaderboard extends Document {
  user: mongoose.Types.ObjectId;
  totalPoints: number;
  totalActivities: number;
  totalDuration: number;
  totalCalories: number;
  updatedAt: Date;
}

const LeaderboardSchema = new Schema<ILeaderboard>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  totalPoints: { type: Number, default: 0 },
  totalActivities: { type: Number, default: 0 },
  totalDuration: { type: Number, default: 0 },
  totalCalories: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<ILeaderboard>('Leaderboard', LeaderboardSchema);
