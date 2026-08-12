const YOUTUBE_RE =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)[\w\-?=&%.]+$/i;

function validateResourcePayload(body, { partial = false } = {}) {
  const type = body.type || "code";
  const errors = [];

  if (!partial && !body.title?.trim()) {
    errors.push("Title is required");
  }

  if (body.type && !["code", "note", "youtube", "file"].includes(body.type)) {
    errors.push("Invalid resource type");
  }

  if (!partial || body.type || body.code !== undefined) {
    if (type === "code" && !(body.code || "").trim() && !partial) {
      errors.push("Code is required for code resources");
    }
  }

  if (!partial || body.type || body.note !== undefined) {
    if (type === "note" && !(body.note || "").trim() && !partial) {
      errors.push("Note content is required");
    }
  }

  if (type === "youtube") {
    const url = (body.youtubeUrl || "").trim();
    if (!partial && !url) errors.push("YouTube URL is required");
    if (url && !YOUTUBE_RE.test(url)) errors.push("Invalid YouTube URL");
  }

  if (type === "file") {
    if (!partial && !(body.fileName || "").trim()) {
      errors.push("File name is required for file resources");
    }
  }

  return errors;
}

function normalizeTags(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) {
    return tags.map((t) => String(t).trim()).filter(Boolean);
  }
  return String(tags)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

module.exports = { validateResourcePayload, normalizeTags, YOUTUBE_RE };
