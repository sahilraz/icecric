// api/update.js
export default async function handler(req, res) {
  const { id, action } = req.query;

  if (!id || !['approve', 'reject'].includes(action)) {
    return res.status(400).send("❌ Invalid parameters.");
  }

  const postData = {
    id: parseInt(id),
    action: action.toLowerCase()
  };

  try {
    const response = await fetch("https://icecric.online/check_recharge.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postData)
    });

    const result = await response.json();

    if (result.success) {
      return res.status(200).send(`✅ Payment ${action === 'approve' ? 'approved' : 'rejected'} successfully.`);
    } else {
      return res.status(500).send(`❌ Failed: ${result.message}`);
    }

  } catch (error) {
    return res.status(500).send(`❌ Error connecting to server: ${error.message}`);
  }
}
