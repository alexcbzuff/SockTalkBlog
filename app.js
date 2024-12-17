require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('../server/config/db');
const { isActiveRoute } = require('../server/helpers/routeHelpers');

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI
    }),
}));

// Static Files
app.use(express.static('public'));

// Template Engine
app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

// Routes
app.use('/', require('../server/routes/main'));
app.use('/', require('../server/routes/admin'));

// Set locals
app.locals.isActiveRoute = isActiveRoute;

// Error Handling
app.on('error', (error) => {
    console.error('Server Error:', error);
});

// Connect to database
connectDB();

// Export the app
module.exports = app;