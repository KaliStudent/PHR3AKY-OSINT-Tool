export function getReputationScore(number) {
  // Placeholder logic (replace with Hiya/Truecaller later)

  let hash = 0;
  for (let i = 0; i < number.length; i++) {
    hash += number.charCodeAt(i);
  }

  const score = (hash % 100) / 100;

  let label = "low_risk";
  if (score > 0.85) label = "high_risk";
  else if (score > 0.6) label = "likely_spam";
  else if (score > 0.3) label = "unknown";

  return { score, label };
}
