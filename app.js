const httpError = require('http-errors');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');
const errorHandler = require('./middleware/error');

//Load env vars
dotenv.config({path: './config/config.env'});

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

//EJS 
app.use(expressLayouts);
app.set('view engine', 'ejs');

//Bodyparser
app.use(express.urlencoded({extended: false}));
app.use(express.json());

// Express session
app.use(
    session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true
    })
);

//Mount Router
app.use('/', require('./routes/web'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(httpError(404));
    //res.render('error');
});

app.use(errorHandler);
// error handler
// app.use(function(err, req, res, next) {
//     // set locals, only providing error in development
//     res.locals.message = err.message;
//     res.locals.error = req.app.get('env') === 'development' ? err : {};
//     // render the error page
//     res.status(err.status || 500);
//     res.render('error');
//   });
  
const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server started on port ${PORT} in ${process.env.NODE_ENV}`));