require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

const sessionsRouter = require("./routes/sessions");
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const usageRouter = require("./routes/usage");
const notificationsRouter = require("./routes/notifications");
const reportsRouter = require("./routes/reports");

app.use('/api', sessionsRouter);
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/usage', usageRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/reports', reportsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SleepGuard API is running' });
});

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
