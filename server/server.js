const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const cryptogenerator = require('crypto');

const app = express();

const JWT_SECRET = cryptogenerator.randomBytes(64).toString('hex');
console.log(JWT_SECRET);


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const dbURI = 'mongodb://localhost:27017/personalexpensetracker';


mongoose.connect(dbURI)
.then(() => console.log('MongoDB connected'))
.catch((err) => console.log(err));

const userSchema = new mongoose.Schema(
    {
        fname: { type: String, required: true },                  
        lname: { type: String, required: true },                  
        dob: { type: Date, required: true },                      
        age: { type: Number, required: true },                    
        gender: { type: String, enum: ['Male', 'Female'], required: true },  
        phone: { type: String, required: true },                  
        countryCode: { type: String, enum: ['+91', '+1'], default: '+91', required: true },            
        email: { type: String, unique: true, default: '+91', required: true },    
        place: { type: String },                                  
        district: { type: String },                               
        country: { type: String },                                
        username: { type: String, unique: true, required: true }, 
        password: { type: String, required: true },               
        profilePicture: { type: String },
        role: { type: String, enum: ['user', 'admin'], default: 'user' }                         
    }, { timestamps: true }
);  

const User = mongoose.model('User', userSchema);

app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username, password });
        if (user) {
            const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
            res.json({ success: true, message: "Login successful", token, userId: user._id });
        } else {
            res.json({ success: false, message: "Invalid credentials" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Error during login" });
    }
});

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Forbidden" });
        req.user = user;
        next();
    });
};

app.post("/register", async (req, res) => {
    const { fname, lname, dob, age, gender, phone, countryCode, email, place, district, country, username, password, confirmpassword, profilePicture, role } = req.body;

    if (password !== confirmpassword) {
        return res.json({ success: false, message: "Passwords do not match" });
    }

    try {
        const newUser = new User({ fname, lname, dob, age, gender, phone, countryCode, email, place, district, country, username, password, confirmpassword, profilePicture, role });
        await newUser.save();
        res.json({ success: true, message: "Registration successful" });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ success: false, message: "Username or Email already exists" });
        } else {
            res.status(500).json({ success: false, message: "Error during registration" });
            console.log(error);
        }
    }
});

app.get("/user/:id", authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            res.json({ success: true, user });
        } else {
            res.json({ success: false, message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching user data" });
    }
});

app.get("/users", authenticateToken, async (req, res) => {
    try {
        const users = await User.find({});
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching users" });
    }
});

app.put('/user/:id', authenticateToken, async (req, res) => {
    try {
      const userId = req.params.id;
      const updatedUser = req.body;
      const user = await User.findByIdAndUpdate(userId, updatedUser, { new: true });
      if (user) {
        res.json({ success: true, user });
      } else {
        res.status(404).json({ success: false, message: 'User not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error updating user' });
    }
});

app.delete('/user/:id', authenticateToken, async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findByIdAndDelete(userId);
        if (user) {
            res.json({ success: true, message: 'User deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error deleting user' });
    }
});

const PORT = 3010;
app.listen(PORT, () => 
    console.log(`Server running on ${PORT}`)
);
