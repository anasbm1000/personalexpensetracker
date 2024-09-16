import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';

const DetailsOfUsers = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [editingUserId, setEditingUserId] = useState(null);
    const [updatedUserData, setUpdatedUserData] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                const userId = localStorage.getItem('userId');

                if (!token || !userId) {
                    console.error("User not logged in or token missing");
                    navigate('/');
                    return;
                }
                const userResponse = await fetch(`http://localhost:3010/user/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`, 
                    },
                });                
                const userData = await userResponse.json();

                if (!userData.success) {
                    throw new Error(userData.message || 'Failed to fetch user data');
                }

                const { role } = userData.user;

                if (role !== 'admin') {
                    alert('Access denied: Only admins can view user details');
                    navigate('/Home'); 
                } else {
                    const response = await fetch('http://localhost:3010/users', {
                        headers: {
                            'Authorization': `Bearer ${token}`, // Add Authorization header
                        },
                    });                    
                    
                    const data = await response.json();

                    if (data.success) {
                        setUsers(data.users);
                    } else {
                        throw new Error(data.message || 'Failed to fetch users');
                    }
                }
            } catch (err) {
                setError(err.message || 'Failed to fetch user data');
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleUpdateClick = (user) => {
        setEditingUserId(user._id);
        setUpdatedUserData(user);
    };

    const handleDelete = async (userId) => {
        try {
            const token = localStorage.getItem('token'); 

            const response = await fetch(`http://localhost:3010/user/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`, 
                },
            });

            const data = await response.json();

            if (data.success) {
                setUsers(users.filter(user => user._id !== userId));
                alert('User deleted successfully');
            } else {
                alert('Error deleting user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleUpdateSubmit = async (event) => {
        event.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:3010/user/${editingUserId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 
                            'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(updatedUserData),
            });

            const data = await response.json();

            if (data.success) {
                setUsers(users.map(user => (user._id === editingUserId ? updatedUserData : user)));
                setEditingUserId(null);
                alert('User updated successfully');
            } else {
                alert('Error updating user');
            }
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const handleChange = (event) => {
        setUpdatedUserData({
            ...updatedUserData,
            [event.target.name]: event.target.value,
        });
    };

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <div className="userhome-page">
                <div><Link to="/Home">Back</Link></div>
                <div><Link to="/" onClick={() => {
                        localStorage.removeItem("userId");
                        localStorage.removeItem("token");
                        navigate("/");
                    }}>Logout</Link>
                </div>
            </div>
            <div className="details-of-users-page">
                {!editingUserId && (
                <div>
                    <table>
                        <thead>
                            <tr>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Email</th>
                                <th>Username</th>
                                <th>User Type</th>
                                <th>Update</th>
                                <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user._id}>
                                    <td>{user.fname}</td>
                                    <td>{user.lname}</td>
                                    <td>{user.email}</td>
                                    <td>{user.username}</td>
                                    <td>{user.role}</td>
                                    <td><button onClick={() => handleUpdateClick(user)}>Update</button></td>
                                    <td><button onClick={() => handleDelete(user._id)}>Delete</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                )}

                {editingUserId && (
                    <form onSubmit={handleUpdateSubmit}>
                        <h3>Update User</h3>
                        <label>
                            First Name:
                            <input
                                type="text"
                                name="fname"
                                value={updatedUserData.fname || ''}
                                onChange={handleChange}
                            />
                        </label>
                        <label>
                            Last Name:
                            <input
                                type="text"
                                name="lname"
                                value={updatedUserData.lname || ''}
                                onChange={handleChange}
                            />
                        </label>
                        <label>
                            Username :
                            <input 
                                type="text"
                                name='username'
                                value={updatedUserData.username}
                                onChange={handleChange} 
                            />
                        </label>
                        <label>
                            Email:
                            <input
                                type="email"
                                name="email"
                                value={updatedUserData.email || ''}
                                onChange={handleChange}
                            />
                        </label>
                        <button type="submit">Update</button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default DetailsOfUsers;


//Instead of fetch we can use axios to avoid the use of response.json()
//---------------------------------------------------------------------

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const DetailsOfUsers = () => {
//     const [users, setUsers] = useState([]);
//     const [error, setError] = useState(null);
//     const navigate = useNavigate();
    
//     useEffect(() => {
//         const fetchUserData = async () => {
//             try {
//                 // Fetch logged-in user details to check role
//                 const userId = localStorage.getItem('userId');
//                 const userResponse = await axios.get(`http://localhost:3010/user/${userId}`);
//                 const { role } = userResponse.data.user;

//                 if (role !== 'admin') {
//                     alert('Access denied: Only admins can view user details');
//                     navigate('/Userhome'); // Redirect to user home if not admin
//                 } else {
//                     // Fetch all users if admin
//                     const response = await axios.get('http://localhost:3010/users');
//                     setUsers(response.data.users);
//                 }
//             } catch (err) {
//                 setError('Error fetching user data');
//             }
//         };

//         fetchUserData();
//     }, [navigate]);

//     if (error) {
//         return <div>{error}</div>;
//     }

//     return (
//         <div>
//             <h2>All User Details</h2>
//             <table>
//                 <thead>
//                     <tr>
//                         <th>First Name</th>
//                         <th>Last Name</th>
//                         <th>Email</th>
//                         <th>User Type</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {users.map(user => (
//                         <tr key={user._id}>
//                             <td>{user.fname}</td>
//                             <td>{user.lname}</td>
//                             <td>{user.email}</td>
//                             <td>{user.role}</td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     );
// };

// export default DetailsOfUsers;
