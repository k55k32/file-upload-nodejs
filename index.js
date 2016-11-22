var express = require('express');
var fs = require('fs');
var multiparty = require('multiparty');
var config = require(process.argv[2] || './config')
var app = express();
var uuid = require('node-uuid').v4;

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", req.headers['origin']);
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Headers", req.headers['access-control-request-headers']);
    res.header("Access-Control-Allow-Methods",req.headers['access-control-request-method']);
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

app.get('/file/:file', function(req, res) {
    var filename = req.params.file
    var filepath = config.uploadDir + filename;
    res.header("Content-Type", "image/png");
    res.sendFile(config.uploadDir + filename);
});

app.post('/upload', function (req, res){

    var form = new multiparty.Form({uploadDir: config.uploadDir});
    form.on('error', function(err) {
        console.log('Error parsing form: ' + err.stack);
        res.send({success: false, msg: err.toString()})
    });
    form.parse(req, function (err, fields, files){
        if (err){
            res.send({success: false, msg: err.toString()});
        } else {
            var fileDataArr = files['file'];
            var fileData = fileDataArr[0];
            var oldName = fileData.path;
            var newName = uuid() + oldName.substr(oldName.lastIndexOf('.'))
            fs.rename(oldName, config.uploadDir + newName)
            res.send(config.downDomain + newName);
        }
    });
});

app.listen(config.port);
console.log('listen on port:', config)
