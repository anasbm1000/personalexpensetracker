import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const Registration = () => {
  const [state, setState] = useState({
    fname: '',
    lname: '',
    dob: '',
    age: '',
    gender: '',
    phone: '',
    countryCode: '',
    email: '',
    place: '',
    district: '',
    country: '',
    username: '',
    password: '',
    confirmpassword: '',
    profilePicture: null,
    role: 'user',
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await fetch('http://localhost:3010/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(state),
    });

    const result = await response.json();
    if (result.success) {
      alert(result.message);
      console.log(result.message);
      setState({
        fname: '',
        lname: '',
        dob: '',
        age: '',
        gender: '',
        phone: '',
        countryCode: '',
        email: '',
        place: '',
        district: '',
        country: '',
        username: '',
        password: '',
        confirmpassword: '',
        profilePicture: null,
        role: 'user',
      });
    } else {
      alert(result.message);
      console.log(result.message);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setState((prevProfile) => ({
          ...prevProfile,
          profilePicture: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleDateChange = (event) => {
    const dob = event.target.value;
    const age = calculateAge(dob);
    setState({ ...state, dob, age });
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age;
  };

  return (
    <div className="login-page">
      
      <div className="form">
      <p className="message">Already registered? <Link to="/">Login Here</Link> </p>
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="First Name"
            name="fname"
            value={state.fname}
            onChange={(e) => setState({ ...state, fname: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            name="lname"
            value={state.lname}
            onChange={(e) => setState({ ...state, lname: e.target.value })}
            required
          />
          <input
            type="date"
            name="dob"
            value={state.dob}
            onChange={handleDateChange}
            required
          />
          <input
            type="number"
            placeholder="Age"
            name="age"
            value={state.age}
            disabled
            readOnly
          />
          <div>
            <input
              type="radio"
              name="gender"
              value="Male"
              style={{ color: 'black', display: 'inline', width: '20px' }}
              checked={state.gender === 'Male'}
              onChange={(e) => setState({ ...state, gender: e.target.value })}
              required
            /><span style={{ color: 'black', display: 'inline', width: '20px' }}>Male</span>
            <input
              type="radio"
              name="gender"
              value="Female"
              style={{ color: 'black', display: 'inline', width: '20px' }}
              checked={state.gender === 'Female'}
              onChange={(e) => setState({ ...state, gender: e.target.value })}
            />
            <span style={{ color: 'black', display: 'inline', width: '20px' }}>Female</span>
          </div>
          <input
            type="tel"
            placeholder="Phone Number"
            name="phone"
            value={state.phone}
            onChange={(e) => setState({ ...state, phone: e.target.value })}
            required
          />
          <select
            name="countryCode"
            value={state.countryCode}
            onChange={(e) => setState({ ...state, countryCode: e.target.value })}
            required
          >
            <option value="+91">+91</option>
            <option value="+1">+1</option>
          </select>
          <input
            type="email"
            placeholder="Email"
            name="email"
            value={state.email}
            onChange={(e) => setState({ ...state, email: e.target.value })}
            required
          />
          <input
            type="text" 
            placeholder="Place" 
            name="place" 
            value={state.place} 
            onChange={(e) => setState({ ...state, place: e.target.value })} 
            required 
          />
          <input 
            type="text" 
            placeholder="District" 
            name="district" 
            value={state.district} 
            onChange={(e) => setState({ ...state, district: e.target.value })} 
            required 
          />
          <input 
            type="text" 
            placeholder="Country" 
            name="country" 
            value={state.country} 
            onChange={(e) => setState({ ...state, country: e.target.value })} 
            required
          />
          <input
            type="text"
            placeholder="Username"
            name="username"
            value={state.username}
            onChange={(e) => setState({ ...state, username: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={state.password}
            onChange={(e) => setState({ ...state, password: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            name="confirmpassword"
            value={state.confirmpassword}
            onChange={(e) => setState({ ...state, confirmpassword: e.target.value })}
            required
          />
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange} 
          />
          <input 
            type="text" 
            style={{ display: 'none' }} 
            name="role" 
            value={state.role} 
            readOnly
            required 
          />
          <input type="submit" className="button" value="Register" />
        </form>
      </div>
    </div>
 
  );
};

export default Registration;