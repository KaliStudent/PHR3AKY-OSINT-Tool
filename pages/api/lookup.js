import { normalizeNumber } from "../../lib/normalize.js";
import { getReputationScore } from "../../lib/reputation.js";

export default async function handler(req, res) {
  const { number } = req.query;

  if (!number) {
    return res.status(400).json({
      error: "Missing 'number' query parameter",
    });
  }

  const normalized = normalizeNumber(number);

  if (!normalized) {
    return res.status(400).json({
      error: "Invalid phone number",
    });
  }

  try {
    const auth = Buffer.from(
      process.env.TWILIO_SID + ":" + process.env.TWILIO_AUTH
    ).toString("base64");

    const twilioRes = await fetch(
      `https://lookups.twilio.com/v2/PhoneNumbers/${normalized}?Fields=line_type_intelligence`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    if (!twilioRes.ok) {
      throw new Error("Twilio lookup failed");
    }

    const data = await twilioRes.json();

    const reputation = getReputationScore(normalized);

    const response = {
      phone: normalized,
      valid: true,
      number_type: data.line_type_intelligence?.type || "unknown",
      carrier: data.line_type_intelligence?.carrier_name || "unknown",
      subscriber_type:
        data.line_type_intelligence?.carrier_type || "unknown",
      region: {
        country: data.country_code || "US",
      },
      reputation,
      name: null, // placeholder for future enrichment
      confidence: 0.75,
    };

    // Vercel edge caching
    res.setHeader(
      "Cache-Control",
      "s-maxage=86400, stale-while-revalidate"
    );

    return res.status(200).json(response);
  } catch (err) {
    return res.status(500).json({
      error: "Lookup failed",
      details: err.message,
    });
  }
}
