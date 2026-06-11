import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Users from './pages/Users';
import Activities from './pages/Activities';
import Teams from './pages/Teams';
import Leaderboard from './pages/Leaderboard';
import Workouts from './pages/Workouts';

const logo = '/octofitapp-small.png';

function App() {
  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <NavLink className="navbar-brand d-flex align-items-center gap-2" to="/">
            <img src={logo} alt="OctoFit" height="32" />
            OctoFit Tracker
          </NavLink>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navMenu"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="navMenu">
            <ul className="navbar-nav ms-auto">
              {[
                { to: '/users', label: 'Users' },
                { to: '/activities', label: 'Activities' },
                { to: '/teams', label: 'Teams' },
                { to: '/leaderboard', label: 'Leaderboard' },
                { to: '/workouts', label: 'Workouts' },
              ].map(({ to, label }) => (
                <li className="nav-item" key={to}>
                  <NavLink
                    className={({ isActive }) => 'nav-link' + (isActive ? ' active fw-bold' : '')}
                    to={to}
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      <main className="container py-4">
        <Routes>
          <Route path="/" element={
            <div className="text-center py-5">
              <img src={logo} alt="OctoFit" height="80" className="mb-3" />
              <h1 className="display-4 fw-bold">Welcome to OctoFit Tracker</h1>
              <p className="lead text-muted">
                Mergington High School's fitness tracking platform. Log workouts, compete with teammates, and stay active!
              </p>
              <div className="row mt-4 g-3 justify-content-center">
                {[
                  { to: '/users', icon: '👤', title: 'User Profiles', desc: 'Manage student profiles' },
                  { to: '/activities', icon: '🏃', title: 'Activities', desc: 'Log workouts & track progress' },
                  { to: '/teams', icon: '🤝', title: 'Teams', desc: 'Create and join fitness teams' },
                  { to: '/leaderboard', icon: '🏆', title: 'Leaderboard', desc: 'See who is on top' },
                  { to: '/workouts', icon: '💪', title: 'Workouts', desc: 'Get personalised suggestions' },
                ].map(({ to, icon, title, desc }) => (
                  <div className="col-md-4 col-sm-6" key={to}>
                    <NavLink to={to} className="text-decoration-none">
                      <div className="card h-100 shadow-sm border-0">
                        <div className="card-body text-center py-4">
                          <div style={{ fontSize: '2.5rem' }}>{icon}</div>
                          <h5 className="card-title mt-2">{title}</h5>
                          <p className="card-text text-muted small">{desc}</p>
                        </div>
                      </div>
                    </NavLink>
                  </div>
                ))}
              </div>
            </div>
          } />
          <Route path="/users" element={<Users />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/workouts" element={<Workouts />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
