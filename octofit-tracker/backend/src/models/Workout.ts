import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkout extends Document {
  name: string;
  description: string;
  fitnessLevel: string;
  exercises: {
    name: string;
    sets: number;
    reps: number;
    duration?: number;
    restSeconds: number;
  }[];
  estimatedDuration: number;
  estimatedCalories: number;
  category: string;
}

const ExerciseSchema = new Schema({
  name: { type: String, required: true },
  sets: { type: Number, required: true, min: 1 },
  reps: { type: Number, required: true, min: 1 },
  duration: { type: Number },
  restSeconds: { type: Number, default: 30 },
});

const WorkoutSchema = new Schema<IWorkout>({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  fitnessLevel: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced'],
  },
  exercises: [ExerciseSchema],
  estimatedDuration: { type: Number, required: true, min: 1 },
  estimatedCalories: { type: Number, required: true, min: 0 },
  category: {
    type: String,
    required: true,
    enum: ['strength', 'cardio', 'flexibility', 'balance', 'mixed'],
  },
});

export default mongoose.model<IWorkout>('Workout', WorkoutSchema);
