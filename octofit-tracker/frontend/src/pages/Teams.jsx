import { useState, useEffect } from 'react';
import { API_BASE } from '../api/config';

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [addMember, setAddMember] = useState({ teamId: '', userId: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tRes, uRes] = await Promise.all([
        fetch(`${API_BASE}/api/teams`),
        fetch(`${API_BASE}/api/users`),
      ]);
      setTeams(await tRes.json());
      const usersData = await uRes.json();
      setUsers(usersData);
      if (usersData.length > 0) setAddMember(m => ({ ...m, userId: usersData[0]._id }));
    } catch {
      setError('Failed to load data. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      const res = await fetch(`${API_BASE}/api/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        setFormError(err.message || 'Failed to create team');
        return;
      }
      setForm({ name: '', description: '' });
      fetchData();
    } catch {
      setFormError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMember = async (teamId) => {
    if (!addMember.userId) return;
    await fetch(`${API_BASE}/api/teams/${teamId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: addMember.userId }),
    });
    fetchData();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this team?')) return;
    await fetch(`${API_BASE}/api/teams/${id}`, { method: 'DELETE' });
    fetchData();
  };

  return (
    <div>
      <h2 className="mb-4">🤝 Team Creation &amp; Management</h2>

      <div className="card shadow-sm mb-4">
        <div className="card-header bg-warning text-dark">Create New Team</div>
        <div className="card-body">
          {formError && <div className="alert alert-danger py-2">{formError}</div>}
          <form onSubmit={handleCreate} className="row g-3">
            <div className="col-md-4">
              <input className="form-control" placeholder="Team name" required
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="col-md-6">
              <input className="form-control" placeholder="Description (optional)"
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="col-md-2">
              <button className="btn btn-warning w-100" type="submit" disabled={submitting}>
                {submitting ? 'Saving…' : 'Create Team'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4"><div className="spinner-border" /></div>
      ) : error ? (
        <div className="alert alert-warning">{error}</div>
      ) : teams.length === 0 ? (
        <p className="text-muted">No teams yet. Create one above!</p>
      ) : (
        <div className="row g-3">
          {teams.map(team => (
            <div className="col-md-6" key={team._id}>
              <div className="card shadow-sm h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <strong>{team.name}</strong>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(team._id)}>Delete</button>
                </div>
                <div className="card-body">
                  {team.description && <p className="text-muted small">{team.description}</p>}
                  <h6>Members ({team.members.length})</h6>
                  {team.members.length === 0 ? (
                    <p className="text-muted small">No members yet.</p>
                  ) : (
                    <ul className="list-group list-group-flush mb-2">
                      {team.members.map(m => (
                        <li key={m._id} className="list-group-item py-1 px-0">
                          <span className="badge bg-primary me-2">{m.fitnessLevel}</span>{m.username}
                        </li>
                      ))}
                    </ul>
                  )}
                  {users.length > 0 && (
                    <div className="d-flex gap-2 mt-2">
                      <select className="form-select form-select-sm"
                        value={addMember.userId}
                        onChange={e => setAddMember({ teamId: team._id, userId: e.target.value })}>
                        {users.map(u => <option key={u._id} value={u._id}>{u.username}</option>)}
                      </select>
                      <button className="btn btn-sm btn-outline-primary" onClick={() => handleAddMember(team._id)}>
                        Add
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
