
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

    // 🔍 DEBUG: check actual Twilio response in logs
    console.log("Twilio response:", JSON.stringify(data, null, 2));

    // ✅ Handle BOTH possible Twilio response formats
    const lineType =
      data.line_type_intelligence?.type ||
      data.carrier?.type ||
      "unknown";

    const carrier =
      data.line_type_intelligence?.carrier_name ||
      data.carrier?.name ||
      "unknown";

    const reputation = getReputationScore(normalized);

    const response = {
      phone: normalized,
      valid: true,
      number_type: lineType,
      carrier: carrier,
      subscriber_type: lineType,
      region: {
        country: data.country_code || "US",
      },
      reputation,
      name: null,
      confidence: carrier !== "unknown" ? 0.9 : 0.6,
    };

    // ✅ Cache response (reduces API cost)
    res.setHeader(
      "Cache-Control",
      "s-maxage=86400, stale-while-revalidate"
    );

    return res.status(200).json(response);
  } catch (err) {
    console.error("Lookup error:", err);

    return res.status(500).json({
      error: "Lookup failed",
      details: err.message,
    });
  }
}
