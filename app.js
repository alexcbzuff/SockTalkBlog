require('dotenv').config();
console.log('Environment variables loaded');

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');


const connectDB = require('./server/config/db');
console.log('Database configuration loaded');
const { isActiveRoute } = require('./server/helpers/routeHelpers');


const app = express();
console.log('Express app initialized');

const PORT = process.env.PORT || 3000;
console.log(`Port set to: ${PORT}`);

// Database connection
console.log('Attempting to connect to database...');
connectDB();

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
    //cookie: { maxAge: new Date ( Date.now() + (3600000) ) } 
  }));
  
  app.use(express.static('public'));





// Static Files Middleware
console.log('Setting up static files middleware...');
app.use(express.static('public'));
console.log('Static files middleware configured - serving from /public directory');

// Template Engine Setup
console.log('Configuring template engine...');
app.use(expressLayout);
console.log('Express-ejs-layouts middleware configured');

app.set('layout', './layouts/main');
console.log('Default layout set to: ./layouts/main');

app.set('view engine', 'ejs');
console.log('View engine set to: ejs');

// Routes
console.log('Setting up routes...');
app.use('/', require('./server/routes/main'));
app.use('/', require('./server/routes/admin'));
console.log('Main routes configured');

// Start Server
app.listen(PORT, () => {
    console.log('-----------------------------------');
    console.log(`Server startup complete!`);
    console.log(`Server is running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
    console.log('-----------------------------------');
});

// Error Handling
app.on('error', (error) => {
    console.error('Server Error:', error);
});

app.locals.isActiveRoute = isActiveRoute; 

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});