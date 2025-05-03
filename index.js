import * as express from "express";
import { createHmac } from "crypto";

// Replace this with your actual signing key obtained from the Periskope dashboard (to be stored in .env)
const SHARED_SECRET = "peri_ea194594-c433-4ea7-8c94-af9e63c5df47"; 

const app = express();

app.use(express.json());

// Verification function to check the signature of the request
function verifySignature(rawBody: Record<string, any>, signature: string) {
  // Create an HMAC SHA256 hash using the shared secret key
  const hmac = createHmac("sha256", SHARED_SECRET);


  // Update the HMAC hash with the stringified payload
  hmac.update(JSON.stringify(rawBody));
  
  // Calculate the HMAC digest in hexadecimal format
  const digest = hmac.digest("hex");
  
  // Compare the calculated digest with the signature provided in the header
  return digest === signature;
}

// Webhook endpoint handler for POST requests to /webhook
app.post("/webhook", (req: express.Request, res: express.Response) => {
  // Extract the signature from the 'x-periskope-signature' header
  const signature = req.headers["x-periskope-signature"] as string;

  // Verify the signature of the incoming request.
  // It's important to use the raw request body before any parsing/modification
  // if your framework modifies the body.
  // Here, we assume `req.body` contains the parsed JSON object.
  const isValid = verifySignature(req.body, signature);

  // If the signature is invalid, respond with an Unauthorized status
  if (!isValid) {
    return res.status(401).send("Invalid signature");
  }

  // If the signature is valid, process the webhook event
  console.log("Received valid webhook event:", req.body);
  // Add your custom logic here to handle the event (e.g., update database, send notifications)

  res.status(200).send("ok");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Webhook server listening on port ${PORT}`);
});
