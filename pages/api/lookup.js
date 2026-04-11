import { normalizeNumber } from "../../lib/normalize.js";
import { getReputationScore } from "../../lib/reputation.js";

export default async function handler(req, res) {
  const { number } = req.query;

  if (!number) {
    return res.status(400).json({ error: "Missing number" });
  }

  const normalized = normalizeNumber(number);

  if (!normalized) {
    return res.status(400).json({ error: "Invalid number" });
  }

  try {
    const auth = Buffer.from(
      process.env.TWILIO_SID + ":" + process.env.TWILIO_AUTH
    ).toString("base64");

    const response = await fetch(
      `https://lookups.twilio.com/v2/PhoneNumbers/${normalized}?Fields=line_type_intelligence`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    const data = await response.json();

    const lineType =
      data.line_type_intelligence?.type ||
      data.carrier?.type ||
      "unknown";

    const carrier =
      data.line_type_intelligence?.carrier_name ||
      data.carrier?.name ||
      "unknown";

    const reputation = getReputationScore(normalized);

    return res.status(200).json({
      phone: normalized,
      valid: true,
      number_type: lineType,
      carrier,
      subscriber_type: lineType,
      region: {
        country: data.country_code || "US",
      },
      reputation,
      name: null,
      confidence: carrier !== "unknown" ? 0.9 : 0.6,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Lookup failed",
      details: err.message,
    });
  }
}
