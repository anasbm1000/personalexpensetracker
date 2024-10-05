
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';


const Profile = () => {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('userId');

    if (!userId) {
        console.error('No userId found in localStorage');
        navigate('/');
        return; 
    }

    const fetchUserProfile = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate("/");
            return;
        }

        try {
            const response = await fetch(`/user/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setUser(data.user);
            } else {
                console.log("Error fetching user profile");
            }
        } catch (error) {
            console.error("Error fetching user profile", error);
        }
    };

    fetchUserProfile();
}, [navigate]);

  if (!user) {
    return <div>Loading...</div>;
  }

  //If DOB need to be printed in the format YYYY-MM-DD without Timezone
  // const formatDate = (date) => {
  //   return new Date(date).toISOString().split('T')[0];
  // };

  //If DOB need to be printed in the format DD-MM-YYYY
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleUpdate = async (event) => {

    event.preventDefault();
    const updatedUser = {
      fname: event.target.fname.value,
      lname: event.target.lname.value,
      dob: event.target.dob.value,
      age: event.target.age.value,
      gender: event.target.gender.value,
      phone: event.target.phone.value,
      countryCode: event.target.countryCode.value,      
      email: event.target.email.value,
      place: event.target.place.value,
      district: event.target.district.value,
      country: event.target.country.value,
      username: event.target.username.value,
      password: event.target.password.value,
      profilePicture: event.target.profilePicture.value,
    };
  
    console.log('Updated user:', updatedUser);

    const token = localStorage.getItem('token');
  
    try {
      const response = await fetch(`/user/${user._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedUser),
      });
  
      console.log('Response:', response);
  
      const data = await response.json();
  
      console.log('Data:', data);
  
      if (data.success) {
        setUser(updatedUser);
        setEditing(false);
        console.log("User profile updated successfully");
      } else {
        console.log("Error updating user profile");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser((prevState) => ({
          ...prevState,
          profilePicture: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };


  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="userhome-page">
        <Link to="/" onClick={() => {
            localStorage.removeItem("userId");
            localStorage.removeItem("token");
            navigate("/");
        }}>Logout</Link>
        <Link to="/Home">Back to Home</Link>
      </div>
      <div className="userprofile-page">
        <h2>User Profile</h2>
        {editing ? (
          <form onSubmit={handleUpdate}>
            <table className="userprofile-table">
              <tbody>
                <tr>
                  <td>First Name:</td>
                  <td><input type="text" name="fname" defaultValue={user.fname} /></td>
                </tr>
                <tr>
                  <td>Last Name:</td>
                  <td><input type="text" name="lname" defaultValue={user.lname} /></td>
                </tr>
                <tr>
                  <td>Date of Birth:</td>
                  <td><input type="date" name="dob" defaultValue={formatDate(user.dob)} /></td>
                </tr>
                <tr>
                  <td>Age:</td>
                  <td><input type="number" name="age" defaultValue={user.age} /></td>
                </tr>
                <tr>
                  <td>Gender:</td>
                  <td><input type="text" name="gender" defaultValue={user.gender} /></td>
                </tr>
                <tr>
                  <td>Phone:</td>
                  <td><input type="text" name="phone" defaultValue={user.phone} /></td>
                </tr>
                <tr>
                  <td>Country Code:</td>
                  <td><input type="text" name="countryCode" defaultValue={user.countryCode} /></td>
                </tr>
                <tr>
                  <td>Email:</td>
                  <td><input type="email" name="email" defaultValue={user.email} /></td>
                </tr>
                <tr>
                  <td>Place:</td>
                  <td><input type="text" name="place" defaultValue={user.place} /></td>
                </tr>
                <tr>
                  <td>District:</td>
                  <td><input type="text" name="district" defaultValue={user.district} /></td>
                </tr>
                <tr>
                  <td>Country:</td>
                  <td><input type="text" name="country" defaultValue={user.country} /></td>
                </tr>
                <tr>
                  <td>Username:</td>
                  <td><input type="text" name="username" defaultValue={user.username} /></td>
                </tr>
                <tr>
                  <td>Password:</td>
                  <td><input type="password" name="password" defaultValue={user.password} /></td>
                </tr>
                <tr>
                  <td>Profile Picture:</td>
                  <td><input type="file" accept='image/*' name="profilePicture" onChange={handleImageChange} /></td>
                </tr>
                <tr>
                  <td colSpan="2"><button type="submit">Update</button></td>
                </tr>
              </tbody>
            </table>
          </form>
        ) : (
          <table className="userprofile-table">
            <tbody>
              <tr>
                <td><strong>First Name:</strong></td>
                <td>{user.fname}</td>
              </tr>
              <tr>
                <td><strong>Last Name:</strong></td>
                <td>{user.lname}</td>
              </tr>
              <tr>
                <td><strong>Date of Birth:</strong></td>
                <td>{formatDate(user.dob)}</td>
              </tr>
              <tr>
                <td><strong>Age:</strong></td>
                <td>{user.age}</td>
              </tr>
              <tr>
                <td><strong>Gender:</strong></td>
                <td>{user.gender}</td>
              </tr>
              <tr>
                <td><strong>Phone:</strong></td>
                <td>{user.phone}</td>
              </tr>
              <tr>
                <td><strong>Country Code:</strong></td>
                <td>{user.countryCode}</td>
              </tr>
              <tr>
                <td><strong>Email:</strong></td>
                <td>{user.email}</td>
              </tr>
              <tr>
                <td><strong>Place:</strong></td>
                <td>{user.place}</td>
              </tr>
              <tr>
                <td><strong>District:</strong></td>
                <td>{user.district}</td>
              </tr>
              <tr>
                <td><strong>Country:</strong></td>
                <td>{user.country}</td>
              </tr>
              <tr>
                <td><strong>Username:</strong></td>
                <td>{user.username}</td>
              </tr>
              <tr>
                <td colSpan="2"><button onClick={() => setEditing(true)}>Edit</button></td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Profile;
