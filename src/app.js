require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const routes = require('./routes');
const errorHandler = require('./middleware/error.middleware');
const { connectRedis } = require('./config/redis');
const {globalLimiter}=require('./middleware/rateLimiter');

const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const paymentController = require('./controllers/payment.controller');

app.use(cors());           // reqs from react frontend
app.use(helmet());         // security headers for api
app.use(morgan('dev'));    // logs every req

app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

app.use(express.json());   // json parsed in request body 
app.use(globalLimiter);    // rate limiting for all reqs

app.get('/', (req, res) => {
    res.json({ message: 'MovieReservation API' });
});

app.use('/api', routes);
app.use(errorHandler);

connectRedis().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}).catch((error) => {
    console.log(`Failed to start server on port ${port}`, error);
});

