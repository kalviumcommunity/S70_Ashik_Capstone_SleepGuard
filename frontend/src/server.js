
require('dotenv').config();
const express = require('express');
const connectDB = require("./Database/connection");

const app = express();

app.use(express.json());

connectDB();

const sessionsRouter = require("./routes/sessions");

app.use('/api', sessionsRouter);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server started on port ${port}`)); 

const sessionsRouter = require('./routes/sessions');
app.use('/api', sessionsRouter);

