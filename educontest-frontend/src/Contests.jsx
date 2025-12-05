import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Contests() {
  const [contests, setContests] = useState([]);
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/contests')
      .then(res => setContests(res.data))
      .catch(() => setMessage('Error fetching contests'));
  }, []);

  const handleParticipate = async (contestId) => {
    try {
      const res = await axios.post('http://localhost:5000/participate', {
        user_id: 1, // replace with logged-in user ID
        contest_id: contestId,
        answer
      });
      setMessage(res.data.message);
    } catch (err) {
      setMessage('Error participating');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Available Contests</h1>
      {contests.map(c => (
        <div key={c.id} style={{ marginBottom: '20px' }}>
          <h3>Round {c.round_number} - Reward: {c.reward}</h3>
          <p>{c.question}</p>
          <input
            type="text"
            placeholder="Your answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <button onClick={() => handleParticipate(c.id)}>Submit Answer</button>
        </div>
      ))}
      <p>{message}</p>
    </div>
  );
}

export default Contests;
