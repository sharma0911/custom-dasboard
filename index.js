import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
app.use(bodyParser.json());
app.use(cors()); // Optional: allows access from frontend if needed

// In-memory storage for received tickets
let tickets = [];

// Webhook endpoint — ticket system POSTs here
app.post('/ticket-webhook', (req, res) => {
  const ticketData = req.body;

  // Store the ticket
  tickets.push(ticketData);

  console.log('Ticket received:', ticketData);
  res.status(200).send('Ticket received');
});

// Endpoint to view all received tickets as JSON
app.get('/', (req, res) => {
  res.json(tickets);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
