import { useState, useEffect } from 'react';
import { API_BASE } from '../api/config';

const FITNESS_LEVELS = ['beginner', 'intermediate', 'advanced'];
const ROLES = ['student', 'teacher'];

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ username: '', email: '', password: '', age: '', fitnessLevel: 'beginner', role: 'student' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/users`);
      const data = await res.json();
      setUsers(data);
    } catch {
      setError('Failed to load users. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      const res = await fetch(`${API_BASE}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, age: Number(form.age) }),
      });
      if (!res.ok) {
        const err = await res.json();
        setFormError(err.message || 'Failed to create user');
        return;
      }
      setForm({ username: '', email: '', password: '', age: '', fitnessLevel: 'beginner', role: 'student' });
      fetchUsers();
    } catch {
      setFormError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    await fetch(`${API_BASE}/api/users/${id}`, { method: 'DELETE' });
    fetchUsers();
  };

  return (
    <div>
      <h2 className="mb-4">👤 User Profiles</h2>

      <div className="card shadow-sm mb-4">
        <div className="card-header bg-primary text-white">Add New User</div>
        <div className="card-body">
          {formError && <div className="alert alert-danger py-2">{formError}</div>}
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-3">
              <input className="form-control" placeholder="Username" required
                value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
            </div>
            <div className="col-md-3">
              <input className="form-control" type="email" placeholder="Email" required
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="col-md-2">
              <input className="form-control" type="password" placeholder="Password" required
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <div className="col-md-2">
              <input className="form-control" type="number" placeholder="Age" required min={1}
                value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} />
            </div>
            <div className="col-md-2">
              <select className="form-select" value={form.fitnessLevel}
                onChange={e => setForm({ ...form, fitnessLevel: e.target.value })}>
                {FITNESS_LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <select className="form-select" value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}>
                {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>
            <div className="col-12">
              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? 'Saving…' : 'Add User'}
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
                <th>Username</th><th>Email</th><th>Age</th><th>Role</th><th>Fitness Level</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-muted">No users yet. Add one above!</td></tr>
              ) : users.map(u => (
                <tr key={u._id}>
                  <td><strong>{u.username}</strong></td>
                  <td>{u.email}</td>
                  <td>{u.age}</td>
                  <td><span className={`badge bg-${u.role === 'teacher' ? 'info text-dark' : 'primary'}`}>{u.role ?? 'student'}</span></td>
                  <td><span className={`badge bg-${u.fitnessLevel === 'advanced' ? 'danger' : u.fitnessLevel === 'intermediate' ? 'warning text-dark' : 'success'}`}>{u.fitnessLevel}</span></td>
                  <td>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(u._id)}>Delete</button>
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
