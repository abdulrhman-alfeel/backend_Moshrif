const { firebase } = require("../firebase/indexfirebase");

const toStr = (v, fallback = "") =>
  v === undefined || v === null ? fallback : String(v);

function normalizeData(obj = {}) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = toStr(v); // FCM data values must be strings
  }
  return out;
}

async function massges(tokens, notification, notification_type, navigationId, data) {
  // فلترة توكنات فاضية/placeholder
  const cleanTokens = (tokens || []).filter(
    (t) => t && t !== "web-token-placeholder"
  );
  if (cleanTokens.length === 0) return;

  // تأمين notification
  const safeNotification = notification
    ? {
        title: toStr(notification.title, "إشعار جديد"),
        body: toStr(notification.body, ""),
        // لو عندك image/icon خليهم نصوص
        ...(notification.image ? { image: toStr(notification.image) } : {}),
      }
    : undefined;

  const payload = {
    tokens: cleanTokens,
    ...(safeNotification ? { notification: safeNotification } : {}),
    data: normalizeData({
      notification_type,
      navigationId,
      data: JSON.stringify(data ?? {}),
    }),
  };

  const res = await firebase.messaging().sendEachForMulticast(payload);

  res.responses.forEach((resp, index) => {
    if (!resp.success) {
      console.error(`Error sending to token ${cleanTokens[index]}:`, resp.error);
    }
  });

  return res;
}

module.exports = { massges };
