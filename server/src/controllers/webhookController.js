const { handleWebhookEvent } = require('../services/webhookService');

async function razorpayWebhook(req, res) {
    try {
        const result = await handleWebhookEvent(
            req.body,
            req.headers['x-razorpay-signature'],
            req.headers['x-razorpay-event-id']
        );

        console.log('webhook:', result.outcome, result.event || '', result.eventId || '');
        res.json({ received: true });
    } catch (err) {
        console.error('webhook rejected:', err.message);
        res.status(err.status || 500).json({ message: err.message });
    }
}

module.exports = { razorpayWebhook };