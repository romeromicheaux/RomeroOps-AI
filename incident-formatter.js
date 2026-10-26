function formatIncident(incident, index) {
  const score = Number(incident.score);
  const relevance = Number.isFinite(score)
    ? `${(score * 100).toFixed(1)}% similarity`
    : "Similarity unavailable";

  const raw = String(incident.text || "");
  let details = raw;

  try {
    const parsed = JSON.parse(raw);
    const analysis = parsed.ai_analysis || "";
    const message = parsed.error_samples?.[0] || "";

    details = analysis || message || raw;
  } catch {
    const match = raw.match(/"ai_analysis":\s*"((?:\\.|[^"\\])*)/);

    if (match) {
      try {
        details = JSON.parse(`"${match[1]}"`);
      } catch {
        details = raw;
      }
    }
  }

  details = details
    .replace(/^#+\s*/gm, "")
    .replace(/\*\*/g, "*")
    .replace(/\\n/g, "\n")
    .trim();

  const lines = details.split("\n")
    .map(line => line.trim())
    .filter(Boolean);

  const preview = lines.slice(0, 8).join("\n").slice(0, 700);

  return [
    `*Match ${index + 1}* — ${relevance}`,
    preview || "No incident details available.",
    ""
  ].join("\n");
}

module.exports = { formatIncident };
