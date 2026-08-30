import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const PORT = process.env.PORT || 5000;

await connectDB();

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
