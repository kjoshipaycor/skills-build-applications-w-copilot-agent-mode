import { useState, useEffect } from 'react';
import { API_BASE } from '../api/config';

export default function Leaderboard() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/leaderboard`);
        setEntries(await res.json());
      } catch {
        setError('Failed to load leaderboard. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div>
      <h2 className="mb-4">🏆 Competitive Leaderboard</h2>
      <p className="text-muted">Points are earned by logging activities. More duration and calories = more points!</p>

      {loading ? (
        <div className="text-center py-4"><div className="spinner-border" /></div>
      ) : error ? (
        <div className="alert alert-warning">{error}</div>
      ) : entries.length === 0 ? (
        <div className="alert alert-info">
          No leaderboard data yet. Start logging activities to appear here!
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>Rank</th>
                <th>Athlete</th>
                <th>Fitness Level</th>
                <th>Points</th>
                <th>Activities</th>
                <th>Total Duration</th>
                <th>Total Calories</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, idx) => (
                <tr key={e._id} className={idx === 0 ? 'table-warning' : ''}>
                  <td className="fs-5">
                    {idx < 3 ? medals[idx] : <span className="text-muted">#{idx + 1}</span>}
                  </td>
                  <td><strong>{e.user?.username ?? '—'}</strong></td>
                  <td>
                    <span className={`badge bg-${e.user?.fitnessLevel === 'advanced' ? 'danger' : e.user?.fitnessLevel === 'intermediate' ? 'warning text-dark' : 'success'}`}>
                      {e.user?.fitnessLevel ?? '—'}
                    </span>
                  </td>
                  <td><span className="fw-bold text-primary fs-5">{e.totalPoints}</span></td>
                  <td>{e.totalActivities}</td>
                  <td>{e.totalDuration} min</td>
                  <td>{e.totalCalories} kcal</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
