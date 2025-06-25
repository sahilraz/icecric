// api/update.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const body = await req.json();

    // ✅ Check if it's a callback query from Telegram
    if (!body.callback_query || !body.callback_query.data) {
      return res.status(400).send("❌ Invalid Telegram callback");
    }

    const { data } = body.callback_query;
    const [action, id] = data.split("_");

    if (!id || !["approve", "reject"].includes(action)) {
      return res.status(400).send("❌ Invalid callback format");
    }

    // ✅ Prepare data to send to your PHP server
    const postData = {
      id: parseInt(id),
      action: action
    };

    // 🔄 Forward to your PHP API
    const response = await fetch("https://icecric.online/check_recharge.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postData)
    });

    const result = await response.json();

    // ✅ Notify Telegram that the callback was handled
    await fetch(`https://api.telegram.org/bot7149543362:AAG5u2YExDPeko8uR8QzeBnQfeYp6mTj_uA/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: body.callback_query.id,
        text: result.success
          ? `✅ Payment ${action}ed successfully.`
          : `❌ Failed: ${result.message || 'Unknown error'}`,
        show_alert: true
      })
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).send("❌ Internal Server Error");
  }
}
