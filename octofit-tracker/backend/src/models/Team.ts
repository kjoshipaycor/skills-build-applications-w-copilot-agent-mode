import mongoose, { Document, Schema } from 'mongoose';

export interface ITeam extends Document {
  name: string;
  description: string;
  members: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const TeamSchema = new Schema<ITeam>({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, default: '' },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<ITeam>('Team', TeamSchema);
