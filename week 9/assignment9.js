var express = require('express');
var request = require('request');
var handlebars = require('express-handlebars').create({ defaultLayout: 'main' });
var credentials = require('./public/credentials.js');

var app = express();

var bodyParser = require('body-parser');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3000);

app.get('/', function (req, res, next) {
    var context = {};
    res.render('home', context);
});

app.post('/', function (req, res, next) {
    if (req.body['makesAPI']) {
        renderMakes(req, res, next);
    }
    if (req.body['dealerAPI']) {
        renderDealers(req, res, next);
    }
});

function renderMakes(req, res, next) {
    var context = {};
    request('https://api.edmunds.com/api/vehicle/v2/makes?fmt=json&api_key=' + credentials.edmundsKey, function (err, response, body) {
        if (!err && response.statusCode < 400) {
            var parsedBody = JSON.parse(body);
            console.log(parsedBody);
            context.makesCount = parsedBody.makesCount;
            context.makesList = parsedBody.makes;
            res.render('home', context);
        } else {
            console.log(err);
            if (response) {
                console.log(response.statusCode);
            }
            next(err);
        }
    });
}

function renderDealers(req, res, next) {
    var context = {};
    var url = 'http://api.edmunds.com/v1/api/dealer?zipcode=' + req.body['zipcode'] + '&api_key=' + credentials.edmundsKey + '&fmt=json';
    request(url, function (err, response, body) {
        if (!err && response.statusCode < 400) {
            var parsedBody = JSON.parse(body);
            console.log(parsedBody);
            context.dealerList = parsedBody.dealerHolder;
            res.render('home', context);
        } else {
            console.log(err);
            if (response) {
                console.log(response.statusCode);
            }
            next(err);
        }
    });
}

app.use(function (req, res) {
    res.status(404);
    res.render('404');
});

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.type('plain/text');
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), function () {
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
