const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const cryptogenerator = require('crypto');

const app = express();

const JWT_SECRET = process.env.JWT_SECRET || cryptogenerator.randomBytes(64).toString('hex');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const dbURI = 'mongodb://localhost:27017/personalexpensetracker';


mongoose.connect(dbURI)
.then(() => console.log('MongoDB connected'))
.catch((err) => console.log(err));

let userSchema = new mongoose.Schema(
    {
        fname: { type: String, required: true },                  
        lname: { type: String, required: true },                  
        dob: { type: Date, required: true },                      
        age: { type: Number, required: true },                    
        gender: { type: String, enum: ['Male', 'Female'], required: true },  
        phone: { type: String, required: true },                  
        countryCode: { type: String, enum: ['+91', '+1'], default: '+91', required: true },            
        email: { type: String, unique: true, required: true },    
        place: { type: String },                                  
        district: { type: String },                               
        country: { type: String },                                
        username: { type: String, unique: true, required: true }, 
        password: { type: String, required: true },               
        profilePicture: { type: String },
        role: { type: String, enum: ['user', 'admin'], default: 'user' }                         
    }, { timestamps: true }
);  

let User = mongoose.model('User', userSchema);


let categoryLimitsSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    income: { type: Number, required: true },
    budgetCategories: [{
        categoryName: { type: String, required: true },
        limitPercentage: { type: Number, required: true },
        amount: { type: Number, required: true }
    }]
}, { timestamps: true }
);

let CategoryLimits = mongoose.model('CategoryLimits', categoryLimitsSchema);

let expensesSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true }
}, { timestamps: true });

let Expenses = mongoose.model('Expenses', expensesSchema);

// Complaint/Suggestion Schema
const complaintSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    nameOfUser: { type: String, required: true },
    emailOfUser: { type: String, required: true },
    dateOfSubmission: { type: Date, required: true },
    submissionType: { type: String, enum: ['Complaint', 'Suggestion'], required: true },
    description: { type: String, required: true }
  }, { timestamps: true });
  
  const Complaint = mongoose.model('Complaint', complaintSchema);
  
  
  const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Forbidden" });
        req.user = user;
        next();
    });
};

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

app.post("/categorylimits", authenticateToken, async (req, res) => {
    const { userId, income, budgetCategories } = req.body;
    try {
        const newCategoryLimits = new CategoryLimits({  userId, income, budgetCategories });
        await newCategoryLimits.save();
        res.status(201).json({ success: true, message: "Category limits added", categoryLimits: newCategoryLimits });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error adding category limits", error });
    }
});

app.post("/expenses", authenticateToken, async (req, res) => {
    try {
        const newExpense = new Expenses(req.body);
        await newExpense.save();
        res.json({ success: true, message: "Expense added successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error adding expense" });
    }
});

app.get("/expenses/:userId", authenticateToken, async (req, res) => {
    const { userId } = req.params;
    try {
        const expenses = await Expenses.find({ userId }).sort({ date: -1 });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: "Error fetching expenses" });
    }
});

app.get("/categorylimits/:userId", authenticateToken, async (req, res) => {
    try {
        const categoryLimits = await CategoryLimits.findOne({ userId: req.params.userId });
        
        if (categoryLimits) {
            res.json({ success: true, categoryLimits });
        } else {
            res.status(404).json({ success: false, message: "Category limits not found" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching category limits", error });
    }
});

app.put("/categorylimits/:userId", authenticateToken, async (req, res) => {
    const { income, budgetCategories } = req.body;

    try {
        const updatedCategoryLimits = await CategoryLimits.findOneAndUpdate(
            { userId: req.params.userId },
            { income, budgetCategories },
            { new: true }
        );
        if (updatedCategoryLimits) {
            res.json({ success: true, message: "Category limits updated successfully", categoryLimits: updatedCategoryLimits });
        } else {
            res.status(404).json({ success: false, message: "Category limits not found" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating category limits", error });
    }
});


app.put('/expenses/:expenseId', authenticateToken, async (req, res) => {
    const { expenseId } = req.params;
    const { name, amount, category, date } = req.body;
  
    try {
      const updatedExpense = await Expenses.findByIdAndUpdate(
        expenseId,
        { name, amount, category, date },
        { new: true }
      );
  
      if (!updatedExpense) {
        return res.status(404).json({ error: 'Expense not found' });
      }
  
      res.status(200).json(updatedExpense);
    } catch (error) {
      res.status(500).json({ error: 'Error updating expense' });
    }
  });
  

app.delete("/expenses/:expenseId", authenticateToken, async (req, res) => {
    const { expenseId } = req.params;
    try {
        await Expenses.findByIdAndDelete(expenseId);
        res.json({ success: true, message: "Expense deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting expense" });
    }
});

// POST route to submit a complaint/suggestion
app.post('/complaints', authenticateToken, async (req, res) => {
    const { userId, nameOfUser, emailOfUser, dateOfSubmission, submissionType, description } = req.body;
  
    try {
      const newComplaint = new Complaint({
        userId,
        nameOfUser,
        emailOfUser,
        dateOfSubmission,
        submissionType,
        description,
      });
  
      await newComplaint.save();
      res.status(201).json({ success: true, message: 'Complaint/Suggestion submitted' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error submitting complaint', error });
    }
  });
  
  // GET route to retrieve all complaints by user ID
  app.get('/complaints/:userId', authenticateToken, async (req, res) => {
    const { userId } = req.params;
  
    try {
        const complaints = await Complaint.find({ userId }).sort({ createdAt: -1 });
        res.json({ success: true, complaints });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching complaints', error });
    }
  }); 

const PORT = 3010;
app.listen(PORT, () => 
    console.log(`Server running on ${PORT}`)
);
