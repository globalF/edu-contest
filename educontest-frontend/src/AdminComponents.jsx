import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Admin Login
function AdminLogin({ setToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:5000/login', { email, password });
      setToken(res.data.token);
      setMessage(res.data.message);
    } catch (err) {
      setMessage('Login failed');
    }
  };

  return (
    <div>
      <h2>Admin Login</h2>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
      <p>{message}</p>
    </div>
  );
}

// Admin Dashboard
function AdminDashboard({ token }) {
  const [users, setUsers] = useState([]);
  const [contests, setContests] = useState([]);
  const [newContest, setNewContest] = useState({ round_number: '', question: '', reward: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/admin/users', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setUsers(res.data))
      .catch(() => setMessage('Error fetching users'));

    axios.get('http://localhost:5000/contests')
      .then(res => setContests(res.data))
      .catch(() => setMessage('Error fetching contests'));
  }, [token]);

  const handleContestCreate = async () => {
    try {
      const res = await axios.post('http://localhost:5000/admin/contest', newContest, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage(res.data.message);
      setContests([...contests, res.data.contest]);
    } catch (err) {
      setMessage('Error creating contest');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Admin Dashboard</h1>

      <h2>Users</h2>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th><th>Username</th><th>Email</th><th>Subscribed</th><th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>{u.subscribed ? 'Yes' : 'No'}</td>
              <td>{u.balance}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Create Contest</h2>
      <input type="number" placeholder="Round Number"
        value={newContest.round_number}
        onChange={(e) => setNewContest({ ...newContest, round_number: e.target.value })}
      />
      <input type="text" placeholder="Question"
        value={newContest.question}
        onChange={(e) => setNewContest({ ...newContest, question: e.target.value })}
      />
      <input type="number" placeholder="Reward"
        value={newContest.reward}
        onChange={(e) => setNewContest({ ...newContest, reward: e.target.value })}
      />
      <button onClick={handleContestCreate}>Create Contest</button>

      <p>{message}</p>
    </div>
  );
}

export { AdminLogin, AdminDashboard };
