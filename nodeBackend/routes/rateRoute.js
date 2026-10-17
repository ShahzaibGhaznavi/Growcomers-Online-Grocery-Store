const express = require("express");

const router = express.Router();

router.get("/dai-inr", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=dai&vs_currencies=inr",
      { signal: AbortSignal.timeout(8000) }
    );

    if (!response.ok) {
      console.error("DAI rate provider returned HTTP", response.status);
      return res.status(502).json({
        message: "Exchange-rate provider is temporarily unavailable",
      });
    }

    const data = await response.json();
    const inr = Number(data?.dai?.inr);

    if (!Number.isFinite(inr) || inr <= 0) {
      return res.status(502).json({
        message: "Exchange-rate provider returned an invalid rate",
      });
    }

    res.set("Cache-Control", "public, max-age=30");
    return res.json({ INR: inr });
  } catch (error) {
    console.error("Failed to fetch DAI/INR rate:", error.message);

    return res.status(502).json({
      message: "Unable to fetch the DAI exchange rate right now",
    });
  }
});

module.exports = router;