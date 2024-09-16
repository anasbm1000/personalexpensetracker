const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

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
    }, { timestamps: true 
    }
);  

const User = mongoose.model('User', userSchema);

app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username, password });
        if (user) {
            res.json({ success: true, message: "Login successful", userId: user._id });
        } else {
            res.json({ success: false, message: "Invalid credentials" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Error during login" });
    }
});


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

app.get("/user/:id", async (req, res) => {
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

app.get("/users", async (req, res) => {
    try {
        const users = await User.find({});
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching users" });
    }
});

const PORT = 3010;
app.listen(PORT, () => 
    console.log(`Server running on ${PORT}`)
);
