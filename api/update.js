// api/update.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const body = req.body;

    if (!body.callback_query || !body.callback_query.data) {
      return res.status(400).send("❌ Invalid Telegram callback payload.");
    }

    const { data, id: callbackId } = body.callback_query;
    const [action, recordId] = data.split("_");

    if (!recordId || !["approve", "reject"].includes(action)) {
      return res.status(400).send("❌ Invalid callback format.");
    }

    // Make POST request to your PHP server
    const phpResponse = await fetch("https://icecric.online/check_recharge.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: parseInt(recordId), action })
    });

    let resultText = "❌ Unknown error";
    let success = false;

    if (phpResponse.ok) {
      const result = await phpResponse.json();
      success = result.success;
      resultText = result.success
        ? `✅ Payment ${action === "approve" ? "approved" : "rejected"}!`
        : `❌ ${result.message || "Update failed"}`;
    } else {
      resultText = `❌ PHP Server Error: ${phpResponse.statusText}`;
    }

    // Answer the Telegram callback to avoid "pending updates"
    await fetch(`https://api.telegram.org/bot7149543362:AAG5u2YExDPeko8uR8QzeBnQfeYp6mTj_uA/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackId,
        text: resultText,
        show_alert: true
      })
    });

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error.message);
    res.status(500).json({ error: "Webhook internal error" });
  }
}
