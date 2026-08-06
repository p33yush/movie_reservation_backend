const prisma = require('../config/database');
const emailService=require('../services/email.service');
const QRCode=require('qrcode');
const stripe = require('../config/stripe');

async function handleWebhook(req, res, next) {
    try {
        const sig = req.headers['stripe-signature'];
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

        let event;
        try {
            // This verifies the cryptographic signature to ensure the request actually came from Stripe
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        } catch (err) {
            console.error(' Webhook signature verification failed.', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

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

            const fullReservation=await prisma.reservation.findUnique({
                where:{id:reservationId},
                include:{
                    user:true,
                    showtime:{include:{
                        movie:true,
                        screen:{include:{theatre:true}}
                    }}
                }
            });

            const qrData=JSON.stringify({
                reservationId:fullReservation.id,
                userId: fullReservation.userId,
                status:fullReservation.status

            });
            const qrCodeBase64=await QRCode.toDataURL(qrData);

            await emailService.sendTicketEmail(fullReservation.user.email,fullReservation.showtime.movie.title,fullReservation.showtime,qrCodeBase64);

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
