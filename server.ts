import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// JSON parser
app.use(express.json());

// Helper function to sanitize OxaPay keys (trims, removes zero-width spaces/invisible characters)
function cleanKey(key: any): string {
  if (!key || typeof key !== "string" || key.trim() === "") {
    return "HLSOHL-M4XCBM-MXMW4B-0BD5YD";
  }
  // Trim spaces and remove invisible/zero-width formatting characters
  return key.trim().replace(/[\u200B-\u200D\uFEFF\s]/g, "");
}

// Proxy endpoints for OxaPay to bypass client-side CORS issues
app.post("/api/oxapay/create", async (req, res) => {
  try {
    const { apiKey, amount, userId } = req.body;
    const orderId = `dep_${userId}_${Date.now()}`;
    const sanitizedKey = cleanKey(apiKey);
    
    const response = await fetch("https://api.oxapay.com/v1/payment/invoice", {
      method: "POST",
      headers: {
        "merchant_api_key": sanitizedKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Number(amount),
        currency: "USDT",
        order_id: orderId,
      }),
    });

    const data = await response.json();
    // Always return HTTP 200 to prevent platform nginx/ingress from converting errors to HTML
    res.status(200).json(data);
  } catch (error: any) {
    console.error("Server OxaPay Create Invoice Error:", error);
    res.status(200).json({ status: 500, message: error.message || "Failed to contact OxaPay API" });
  }
});

app.post("/api/oxapay/verify", async (req, res) => {
  try {
    const { apiKey, trackId } = req.body;
    const sanitizedKey = cleanKey(apiKey);
    
    // Call the GET endpoint which is stable and supports merchant_api_key in headers
    const response = await fetch(`https://api.oxapay.com/v1/payment?track_id=${trackId}`, {
      method: "GET",
      headers: {
        "merchant_api_key": sanitizedKey,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    // Always return HTTP 200 to prevent platform nginx/ingress from converting errors to HTML
    res.status(200).json(data);
  } catch (error: any) {
    console.error("Server OxaPay Verify Invoice Error:", error);
    res.status(200).json({ status: 500, message: error.message || "Failed to contact OxaPay API" });
  }
});

app.post("/api/oxapay/payout", async (req, res) => {
  try {
    const { apiKey, address, amount } = req.body;
    const sanitizedKey = cleanKey(apiKey);
    
    const response = await fetch("https://api.oxapay.com/v1/payout", {
      method: "POST",
      headers: {
        "payout_api_key": sanitizedKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address: address,
        currency: "USDT",
        amount: Number(amount),
        network: "bsc",
      }),
    });

    const data = await response.json();
    // Always return HTTP 200 to prevent platform nginx/ingress from converting errors to HTML
    res.status(200).json(data);
  } catch (error: any) {
    console.error("Server OxaPay Payout Error:", error);
    res.status(200).json({ status: 500, message: error.message || "Failed to contact OxaPay Payout API" });
  }
});

// Setup Vite middleware or serve static files
async function setupApp() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupApp();
