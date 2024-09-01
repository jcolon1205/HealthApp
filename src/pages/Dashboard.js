import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/clients?caseWorkerId=123', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch members');
      const data = await response.json();
      setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
      // Handle error (e.g., show error message)
    } finally {
      setLoading(false);
    }
  };

  const handleMemberClick = (memberId) => {
    navigate(`/client/${memberId}`);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <h2>Your Members</h2>
      {members.length === 0 ? (
        <p>No members found.</p>
      ) : (
        <ul className="member-list">
          {members.map(member => (
            <li key={member.id} onClick={() => handleMemberClick(member.id)}>
              {member.name} - {member.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dashboard;