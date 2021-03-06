'use strict';
//importer nødvendige bibliotek
var Express = require('express');
var Firebase = require('firebase');

//variabel med url til Firebase-noden som inneholder våre data
var baseUrl = 'https://reactfire-demo.firebaseio.com/';

//opprett en instans av Express
var app = Express();

//start serveren med å lytte på port 5555, logg en beskjed til konsollet.
//merk at vi setter serveren til  å lytte på den porten den får tildelt av kjøremiljøet,
//eller 5555 om den eksempelvis kjører på localhost
var server = app.listen(process.env.PORT || 5555, function () {
    console.log('API lytter på port: ' + server.address().port);
});

//Enkel rute på rot som sender en bekreftende beskjed på responsen
app.get('/', function (req, res) {
    res.send('API svarer!')
});

//rute med request-parameter: id
//brukes slik: /.../text/-JiEPn2FMzEZldTFUmxp
//returnerer noden om den finnes, eller en 404 med feilmeldingen fra tjenesten om den ikke finner
app.get('/text/:id', function (req, res) {
    if (req.params.id) {
        _getTextNode(req.params.id).then(function (response) {
            res.status(200).send(response)
        }, function (error) {
            res.status(404).send(error.message)
        });
    }
});

//rute med request-parameter id til Strings-noden
//brukes slik: /.../temperatureposting/-JiEPn2FMzEZldTFUmxp
//returnerer noden om den finnes, eller en 404 med feilmeldingen fra tjenesten om den ikke finner
app.get('/temperatureposting/:id', function (req, res) {
    if (req.params.id) {
        _getTemperaturePostingNode(req.params.id).then(function (response) {
            res.status(200).send(response)
        }, function (error) {
            res.status(404).send(error.message)
        });
    }
});

//rute med request-parametere lokasjon og temperatur
//brukes slik: /.../temperatureposting/create/kallekanin/Oslo/20
//returnerer status 200 og database-ID'en til noden du akkurat skrev
app.put('/temperatureposting/create/:userid/:location/:temperature', function (req, res) {
    if (req.params.userid && req.params.location && req.params.temperature) {
        _writeTemperatureNode(req.params.userid, req.params.location, req.params.temperature).then(function (response) {
            var result = 'New temperatureposting created with key: ' + response.key();
            res.status(200).send(result)
        }, function (error) {
            res.status(404).send(error.message)
        });
    } else {
        var err = new Error("Missing request parameter");
        res.status(400).send(err.message)
    }
});

//asynkron funksjon som leser fra strings noden i Firebase og returnerer noden som matcher id
function _getTextNode(id) {
    return new Promise(function (resolve, reject) {
        var nodeRef = new Firebase(baseUrl + '/strings/' + id);
        nodeRef.once('value', function (snapshot) {
            var ret = snapshot.val();
            if (null !== ret) {
                resolve(ret);
            } else {
                reject(new Error('node not found by id: ' + id));
            }
        });
    });
}

//asynkron funksjon som leser fra temperaturepostings noden i Firebase og returnerer noden som matcher id
function _getTemperaturePostingNode(id) {
    return new Promise(function (resolve, reject) {
        var nodeRef = new Firebase(baseUrl + '/temperatureposting/' + id);
        nodeRef.once('value', function (snapshot) {
            var ret = snapshot.val();
            if (null !== ret) {
                resolve(ret);
            } else {
                reject(new Error('temperatureposting not found by id: ' + id));
            }
        });
    });
}

//asynkron funksjon som skriver en ny temperaturepostings node til Firebase og returnerer ID'en til denne
//hvis .push() - metoden til Firebase returnerer noe annet enn null betyr det
//at operasjonen feilet, og vi sender feilen tilbake, ellers returnerer vi med den nye node ID'en
function _writeTemperatureNode(userid, location, temperature) {
    return new Promise(function (resolve, reject) {
        var nodeRef = new Firebase(baseUrl + '/temperatureposting/');
        var newNodeRef = nodeRef.push({
            "userid": userid,
            "location": location,
            "temperature": temperature
        }, function (firebaseResponse) {
            if (null !== firebaseResponse) {
                reject(new Error('Something wen\'t wrong, please try again!'));
            }
            resolve(newNodeRef);
        });
    });
}
