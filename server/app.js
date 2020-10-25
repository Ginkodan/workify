const express = require('express');
const cors = require('cors');
const logger = require('./serverlog/logger');
const helmet = require('helmet');
const morgan = require('morgan');
const api = require('./routes/api/api');
const fs = require('fs');
const path = require('path');
const bodyparser = require('body-parser');
const middlewares = require('./middlewares');
const accessLogStream = fs.createWriteStream(path.join(__dirname, '../logs/access.log'), { flags: 'a' });
const { connectDb } = require("./mongodb");
const app = express();


app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(morgan('combined', { stream: accessLogStream }));
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

if(process.env.NODE_ENV === 'production') {
    app.use(express.static(__dirname + '/public/'));
    app.get(/.*!/, (req, res) =>
        res.sendFile(__dirname + './public/index.html'));
    logger.info('Production mode active');
} else {
    app.get('/', (req, res) => {
        res.json({
            message: "Developer mode 🐱‍👤"
        });
    });
}

connectDb().then(()=>{
    logger.info("DB connection successful!");
}).catch(err=>{
    logger.error("DB connection failed: " + err)
});


app.use('/api',api);
app.use(middlewares.notFound);
app.use(middlewares.errorHandler);



module.exports = app;
