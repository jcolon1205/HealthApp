import React, { useState, useEffect } from 'react';
import './MemberList.css';

function MemberList() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchParams, setSearchParams] = useState({
    name: '',
    dob: '',
    memberId: '',
    phoneNumber: ''
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams(searchParams).toString();
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/members/search?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
      
      const data = await response.json();
      setMembers(data);
    } catch (err) {
      setError('Error fetching members: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'name') {
      // Allow only alphabetic characters
      const alphaValue = value.replace(/[^a-zA-Z\s]/g, '');
      setSearchParams(prev => ({ ...prev, [name]: alphaValue }));
    } else if (name === 'phoneNumber') {
      // Allow only numeric characters and auto-format as XXX-XXX-XXXX
      const numericValue = value.replace(/\D/g, '').slice(0, 10); // Limit to 10 digits
      const formattedValue = numericValue
        .replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
        .replace(/(\d{3})(\d{3})/, '$1-$2')
        .replace(/(\d{3})/, '$1');
      setSearchParams(prev => ({ ...prev, [name]: formattedValue }));
    } else {
      setSearchParams(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleMemberClick = (memberId) => {
    const newWindow = window.open(`/member-summary?id=${memberId}`, '_blank', 'noopener,noreferrer');
    if (newWindow) newWindow.opener = null;
  };

  return (
    <div className="member-list">
      <h1>Member Search</h1>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          name="name"
          value={searchParams.name}
          onChange={handleInputChange}
          placeholder="Name"
        />
        <input
          type="date"
          name="dob"
          value={searchParams.dob}
          onChange={handleInputChange}
          placeholder="Date of Birth"
        />
        <input
          type="text"
          name="memberId"
          value={searchParams.memberId}
          onChange={handleInputChange}
          placeholder="Member ID"
        />
        <input
          type="tel"
          name="phoneNumber"
          value={searchParams.phoneNumber}
          onChange={handleInputChange}
          placeholder="Phone Number"
        />
        <button type="submit">Search</button>
      </form>

      {loading && <div>Loading...</div>}
      {error && <div className="error">{error}</div>}
      
      {members.length > 0 && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Member ID</th>
                <th>Name</th>
                <th>Date of Birth</th>
                <th>Phone Number</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} onClick={() => handleMemberClick(member.id)}>
                  <td>{member.id}</td>
                  <td>{`${member.first_name} ${member.last_name}`}</td>
                  <td>{new Date(member.date_of_birth).toLocaleDateString()}</td>
                  <td>{member.phone_number}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MemberList;