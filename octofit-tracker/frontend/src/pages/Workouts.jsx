import { useState, useEffect } from 'react';
import { API_BASE } from '../api/config';

const FITNESS_LEVELS = ['beginner', 'intermediate', 'advanced'];
const CATEGORIES = ['strength', 'cardio', 'flexibility', 'balance', 'mixed'];

export default function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [form, setForm] = useState({
    name: '', description: '', fitnessLevel: 'beginner',
    estimatedDuration: '', estimatedCalories: '', category: 'strength',
    exercises: [{ name: '', sets: 3, reps: 10, restSeconds: 30 }],
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchWorkouts = async (level = '') => {
    try {
      setLoading(true);
      const url = level
        ? `${API_BASE}/api/workouts/suggest/${level}`
        : `${API_BASE}/api/workouts`;
      const res = await fetch(url);
      setWorkouts(await res.json());
    } catch {
      setError('Failed to load workouts. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWorkouts(); }, []);

  const handleFilter = (level) => {
    setFilterLevel(level);
    fetchWorkouts(level);
  };

  const updateExercise = (idx, field, value) => {
    setForm(f => {
      const exercises = [...f.exercises];
      exercises[idx] = { ...exercises[idx], [field]: value };
      return { ...f, exercises };
    });
  };

  const addExercise = () =>
    setForm(f => ({ ...f, exercises: [...f.exercises, { name: '', sets: 3, reps: 10, restSeconds: 30 }] }));

  const removeExercise = (idx) =>
    setForm(f => ({ ...f, exercises: f.exercises.filter((_, i) => i !== idx) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      const payload = {
        ...form,
        estimatedDuration: Number(form.estimatedDuration),
        estimatedCalories: Number(form.estimatedCalories),
        exercises: form.exercises.map(ex => ({
          ...ex, sets: Number(ex.sets), reps: Number(ex.reps), restSeconds: Number(ex.restSeconds),
        })),
      };
      const res = await fetch(`${API_BASE}/api/workouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        setFormError(err.message || 'Failed to create workout');
        return;
      }
      setForm({
        name: '', description: '', fitnessLevel: 'beginner',
        estimatedDuration: '', estimatedCalories: '', category: 'strength',
        exercises: [{ name: '', sets: 3, reps: 10, restSeconds: 30 }],
      });
      setShowForm(false);
      fetchWorkouts(filterLevel);
    } catch {
      setFormError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this workout?')) return;
    await fetch(`${API_BASE}/api/workouts/${id}`, { method: 'DELETE' });
    fetchWorkouts(filterLevel);
  };

  const levelColor = (l) => l === 'advanced' ? 'danger' : l === 'intermediate' ? 'warning text-dark' : 'success';
  const catColor = (c) => ({ strength: 'primary', cardio: 'danger', flexibility: 'info', balance: 'secondary', mixed: 'dark' })[c] || 'secondary';

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">💪 Personalized Workout Suggestions</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Workout'}
        </button>
      </div>

      {/* Filter bar */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        <span className="text-muted me-2 align-self-center">Filter by level:</span>
        <button className={`btn btn-sm ${filterLevel === '' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => handleFilter('')}>All</button>
        {FITNESS_LEVELS.map(l => (
          <button key={l}
            className={`btn btn-sm btn-${filterLevel === l ? '' : 'outline-'}${levelColor(l).split(' ')[0]}`}
            onClick={() => handleFilter(l)}>
            {l.charAt(0).toUpperCase() + l.slice(1)}
          </button>
        ))}
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-primary text-white">Create Workout Plan</div>
          <div className="card-body">
            {formError && <div className="alert alert-danger py-2">{formError}</div>}
            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Name</label>
                <input className="form-control" required value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="col-md-2">
                <label className="form-label">Fitness Level</label>
                <select className="form-select" value={form.fitnessLevel}
                  onChange={e => setForm({ ...form, fitnessLevel: e.target.value })}>
                  {FITNESS_LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">Duration (min)</label>
                <input className="form-control" type="number" min={1} required
                  value={form.estimatedDuration} onChange={e => setForm({ ...form, estimatedDuration: e.target.value })} />
              </div>
              <div className="col-md-2">
                <label className="form-label">Calories</label>
                <input className="form-control" type="number" min={0} required
                  value={form.estimatedCalories} onChange={e => setForm({ ...form, estimatedCalories: e.target.value })} />
              </div>
              <div className="col-12">
                <label className="form-label">Description</label>
                <input className="form-control" placeholder="Optional description"
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>

              <div className="col-12">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label mb-0">Exercises</label>
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={addExercise}>+ Add Exercise</button>
                </div>
                {form.exercises.map((ex, idx) => (
                  <div key={idx} className="row g-2 mb-2 align-items-center">
                    <div className="col-md-3">
                      <input className="form-control form-control-sm" placeholder="Exercise name" required
                        value={ex.name} onChange={e => updateExercise(idx, 'name', e.target.value)} />
                    </div>
                    <div className="col-md-2">
                      <input className="form-control form-control-sm" type="number" min={1} placeholder="Sets"
                        value={ex.sets} onChange={e => updateExercise(idx, 'sets', e.target.value)} />
                    </div>
                    <div className="col-md-2">
                      <input className="form-control form-control-sm" type="number" min={1} placeholder="Reps"
                        value={ex.reps} onChange={e => updateExercise(idx, 'reps', e.target.value)} />
                    </div>
                    <div className="col-md-2">
                      <input className="form-control form-control-sm" type="number" min={0} placeholder="Rest (s)"
                        value={ex.restSeconds} onChange={e => updateExercise(idx, 'restSeconds', e.target.value)} />
                    </div>
                    <div className="col-md-1">
                      {form.exercises.length > 1 && (
                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeExercise(idx)}>✕</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="col-12">
                <button className="btn btn-primary" type="submit" disabled={submitting}>
                  {submitting ? 'Saving…' : 'Create Workout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-4"><div className="spinner-border" /></div>
      ) : error ? (
        <div className="alert alert-warning">{error}</div>
      ) : workouts.length === 0 ? (
        <p className="text-muted">No workouts found{filterLevel ? ` for ${filterLevel} level` : ''}. Create one!</p>
      ) : (
        <div className="row g-3">
          {workouts.map(w => (
            <div className="col-md-6 col-lg-4" key={w._id}>
              <div className="card h-100 shadow-sm">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <div>
                    <span className={`badge bg-${levelColor(w.fitnessLevel).split(' ')[0]} me-2`}>{w.fitnessLevel}</span>
                    <span className={`badge bg-${catColor(w.category)}`}>{w.category}</span>
                  </div>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(w._id)}>✕</button>
                </div>
                <div className="card-body">
                  <h5 className="card-title">{w.name}</h5>
                  {w.description && <p className="card-text text-muted small">{w.description}</p>}
                  <div className="d-flex gap-3 mb-3 text-muted small">
                    <span>⏱ {w.estimatedDuration} min</span>
                    <span>🔥 {w.estimatedCalories} kcal</span>
                  </div>
                  <h6 className="mb-1">Exercises:</h6>
                  <ul className="list-unstyled mb-0">
                    {w.exercises.map((ex, i) => (
                      <li key={i} className="small text-muted">
                        • {ex.name} — {ex.sets}×{ex.reps} <span className="text-muted">({ex.restSeconds}s rest)</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
