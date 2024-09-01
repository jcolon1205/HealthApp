import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MemberForm.css';

function MemberForm() {
  const navigate = useNavigate();
  const [member, setMember] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    social_security_number: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    phone_number: '',
    email: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    blood_type: '',
    allergies: '',
    medical_conditions: '',
    medications: '',
    insurance_provider: '',
    insurance_policy_number: '',
    primary_care_physician: ''
  });

  const [isDuplicate, setIsDuplicate] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone_number' || name === 'emergency_contact_phone') {
      // Allow only numeric characters and auto-format as XXX-XXX-XXXX
      const numericValue = value.replace(/\D/g, '').slice(0, 10); // Limit to 10 digits
      const formattedValue = numericValue
        .replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
        .replace(/(\d{3})(\d{3})/, '$1-$2')
        .replace(/(\d{3})/, '$1');
      setMember(prevState => ({
        ...prevState,
        [name]: formattedValue
      }));
    } else {
      setMember(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
    setIsDuplicate(false); // Reset duplicate status when form changes
  };

  const checkDuplicate = async () => {
    try {
      console.log('Checking for duplicate...'); // Debug log
      const response = await fetch('http://localhost:5000/api/members/check-duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: member.first_name,
          last_name: member.last_name,
          date_of_birth: member.date_of_birth,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to check for duplicate');
      }
      const data = await response.json();
      console.log('Duplicate check response:', data); // Debug log
      setIsDuplicate(data.isDuplicate);
      return data.isDuplicate;
    } catch (error) {
      console.error('Error checking for duplicate:', error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const duplicateCheck = await checkDuplicate();
    console.log('Duplicate check result:', duplicateCheck); // Debug log
    if (duplicateCheck) {
      alert('A member with this name and date of birth already exists.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(member),
      });
      if (!response.ok) {
        throw new Error('Failed to add member');
      }
      const data = await response.json();
      console.log('Member added successfully:', data);
      alert('Member has been added successfully!');
      // Refresh the page
      navigate(0);
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Error adding member. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="member-form">
      <h2>Member Information Form</h2>
      
      <div className="form-group">
        <label htmlFor="first_name">First Name</label>
        <input type="text" id="first_name" name="first_name" value={member.first_name} onChange={handleChange} required />
      </div>

      <div className="form-group">
        <label htmlFor="last_name">Last Name</label>
        <input type="text" id="last_name" name="last_name" value={member.last_name} onChange={handleChange} required />
      </div>

      <div className="form-group">
        <label htmlFor="date_of_birth">Date of Birth</label>
        <input type="date" id="date_of_birth" name="date_of_birth" value={member.date_of_birth} onChange={handleChange} required />
      </div>

      <div className="form-group">
        <label htmlFor="gender">Gender</label>
        <select id="gender" name="gender" value={member.gender} onChange={handleChange}>
          <option value="">Select...</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="social_security_number">Social Security Number</label>
        <input type="text" id="social_security_number" name="social_security_number" value={member.social_security_number} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label htmlFor="address">Address</label>
        <input type="text" id="address" name="address" value={member.address} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label htmlFor="city">City</label>
        <input type="text" id="city" name="city" value={member.city} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label htmlFor="state">State</label>
        <input type="text" id="state" name="state" value={member.state} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label htmlFor="zip_code">Zip Code</label>
        <input type="text" id="zip_code" name="zip_code" value={member.zip_code} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label htmlFor="phone_number">Phone Number</label>
        <input type="tel" id="phone_number" name="phone_number" value={member.phone_number} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input type="email" id="email" name="email" value={member.email} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label htmlFor="emergency_contact_name">Emergency Contact Name</label>
        <input type="text" id="emergency_contact_name" name="emergency_contact_name" value={member.emergency_contact_name} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label htmlFor="emergency_contact_phone">Emergency Contact Phone</label>
        <input type="tel" id="emergency_contact_phone" name="emergency_contact_phone" value={member.emergency_contact_phone} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label htmlFor="blood_type">Blood Type</label>
        <select id="blood_type" name="blood_type" value={member.blood_type} onChange={handleChange}>
          <option value="">Select...</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="allergies">Allergies</label>
        <textarea id="allergies" name="allergies" value={member.allergies} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label htmlFor="medical_conditions">Medical Conditions</label>
        <textarea id="medical_conditions" name="medical_conditions" value={member.medical_conditions} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label htmlFor="medications">Medications</label>
        <textarea id="medications" name="medications" value={member.medications} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label htmlFor="insurance_provider">Insurance Provider</label>
        <input type="text" id="insurance_provider" name="insurance_provider" value={member.insurance_provider} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label htmlFor="insurance_policy_number">Insurance Policy Number</label>
        <input type="text" id="insurance_policy_number" name="insurance_policy_number" value={member.insurance_policy_number} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label htmlFor="primary_care_physician">Primary Care Physician</label>
        <input type="text" id="primary_care_physician" name="primary_care_physician" value={member.primary_care_physician} onChange={handleChange} />
      </div>

      {isDuplicate && (
        <p style={{color: 'red'}}>A member with this name and date of birth already exists.</p>
      )}

      <button type="submit">Submit</button>
    </form>
  );
}

export default MemberForm;
