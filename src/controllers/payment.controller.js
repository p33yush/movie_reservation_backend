const prisma = require('../config/database');

async function handleWebhook(req, res, next) {
    try {
        const event = req.body;


        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            const reservationId = parseInt(paymentIntent.metadata.reservationId);

            await prisma.reservation.update({
                where: { id: reservationId },
                data: { status: 'CONFIRMED' }
            });

            await prisma.payment.update({
                where: { reservationId: reservationId },
                data: { status: 'COMPLETED' }
            });

            console.log(`Reservation ${reservationId} has been confirmed!`);
        }

        res.json({ received: true });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    handleWebhook
};
