import { useState, useEffect } from 'react';
import { API_BASE } from '../api/config';

const ACTIVITY_TYPES = ['running', 'walking', 'cycling', 'swimming', 'strength_training', 'yoga', 'other'];

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    user: '', activityType: 'running', duration: '', distance: '', caloriesBurned: '', notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [actRes, userRes] = await Promise.all([
        fetch(`${API_BASE}/api/activities`),
        fetch(`${API_BASE}/api/users`),
      ]);
      setActivities(await actRes.json());
      const usersData = await userRes.json();
      setUsers(usersData);
      if (usersData.length > 0) setForm(f => ({ ...f, user: usersData[0]._id }));
    } catch {
      setError('Failed to load data. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      const payload = {
        ...form,
        duration: Number(form.duration),
        caloriesBurned: Number(form.caloriesBurned),
        distance: form.distance ? Number(form.distance) : undefined,
      };
      const res = await fetch(`${API_BASE}/api/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        setFormError(err.message || 'Failed to log activity');
        return;
      }
      setForm(f => ({ ...f, duration: '', distance: '', caloriesBurned: '', notes: '' }));
      fetchData();
    } catch {
      setFormError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this activity?')) return;
    await fetch(`${API_BASE}/api/activities/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const formatDate = (d) => new Date(d).toLocaleDateString();

  return (
    <div>
      <h2 className="mb-4">🏃 Activity Logging &amp; Tracking</h2>

      <div className="card shadow-sm mb-4">
        <div className="card-header bg-success text-white">Log New Activity</div>
        <div className="card-body">
          {formError && <div className="alert alert-danger py-2">{formError}</div>}
          {users.length === 0 && <div className="alert alert-info py-2">Add a user first before logging activities.</div>}
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-3">
              <label className="form-label">User</label>
              <select className="form-select" required value={form.user}
                onChange={e => setForm({ ...form, user: e.target.value })}>
                {users.map(u => <option key={u._id} value={u._id}>{u.username}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Activity Type</label>
              <select className="form-select" value={form.activityType}
                onChange={e => setForm({ ...form, activityType: e.target.value })}>
                {ACTIVITY_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Duration (min)</label>
              <input className="form-control" type="number" min={1} required
                value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
            </div>
            <div className="col-md-2">
              <label className="form-label">Distance (km)</label>
              <input className="form-control" type="number" min={0} step="0.1"
                value={form.distance} onChange={e => setForm({ ...form, distance: e.target.value })} />
            </div>
            <div className="col-md-2">
              <label className="form-label">Calories Burned</label>
              <input className="form-control" type="number" min={0} required
                value={form.caloriesBurned} onChange={e => setForm({ ...form, caloriesBurned: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Notes</label>
              <input className="form-control" placeholder="Optional notes"
                value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="col-12">
              <button className="btn btn-success" type="submit" disabled={submitting || users.length === 0}>
                {submitting ? 'Saving…' : 'Log Activity'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4"><div className="spinner-border" /></div>
      ) : error ? (
        <div className="alert alert-warning">{error}</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>User</th><th>Type</th><th>Duration</th><th>Distance</th>
                <th>Calories</th><th>Date</th><th>Notes</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activities.length === 0 ? (
                <tr><td colSpan={8} className="text-center text-muted">No activities logged yet.</td></tr>
              ) : activities.map(a => (
                <tr key={a._id}>
                  <td><strong>{a.user?.username ?? '—'}</strong></td>
                  <td><span className="badge bg-secondary">{a.activityType}</span></td>
                  <td>{a.duration} min</td>
                  <td>{a.distance != null ? `${a.distance} km` : '—'}</td>
                  <td>{a.caloriesBurned} kcal</td>
                  <td>{formatDate(a.date)}</td>
                  <td className="text-muted small">{a.notes || '—'}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(a._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
