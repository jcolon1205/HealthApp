import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './MemberSummary.css';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function MemberSummary() {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const query = useQuery();
  const memberId = query.get('id');

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/members/${memberId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        }
        
        const data = await response.json();
        setMember(data);
      } catch (err) {
        setError('Error fetching member details: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [memberId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!member) return null;

  return (
    <div className="member-summary-page">
      <h2>Member Summary</h2>
      <p><strong>First Name:</strong> {member.first_name}</p>
      <p><strong>Last Name:</strong> {member.last_name}</p>
      <p><strong>Date of Birth:</strong> {new Date(member.date_of_birth).toLocaleDateString()}</p>
      <p><strong>SSN:</strong> {member.ssn}</p>
      <p><strong>Address:</strong> {member.address}</p>
      <p><strong>City:</strong> {member.city}</p>
      <p><strong>Zip Code:</strong> {member.zip_code}</p>
      <p><strong>Phone Number:</strong> {member.phone_number}</p>
      <p><strong>Email:</strong> {member.email}</p>
      <p><strong>Membership Status:</strong> {member.membership_status}</p>
      <p><strong>Emergency Contact:</strong> {member.emergency_contact}</p>
      <p><strong>Primary Care Physician:</strong> {member.primary_care_physician}</p>
    </div>
  );
}

export default MemberSummary;