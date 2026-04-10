require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const routes = require('./routes');
const errorHandler = require('./middleware/error.middleware');


const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

app.use(cors());           // Allows requests from your React frontend
app.use(helmet());         // Adds security headers to protect your API
app.use(morgan('dev'));    // Logs every request: "GET / 200 5ms"
app.use(express.json());   // Parses JSON in request body (for POST/PUT requests)


app.get('/', (req, res) => {
    res.json({ message: 'MovieReservation API' });
});

app.use('/api', routes);
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
