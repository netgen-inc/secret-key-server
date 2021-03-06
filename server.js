var settings = require('./etc/settings.json');
var express = require('express');
var redis = require('redis');
var logger = require('./lib/logger').logger(settings.log);
var tool = require('./lib/tool').tool;
var fs = require('fs');

var app = express.createServer();
app.use(express.bodyParser());

var redisCli = redis.createClient(settings.redis.port, settings.redis.host);
redisCli.select(settings.redis.db);

app.get('/:dataType/get', function(req, res){
    var key = req.param('key');
    if(!key){
        res.end(JSON.stringify({error:"the key is empty"}));
    }else{
        key = req.params.dataType + key;
        redisCli.get(key, function(err, val){
            var log = "GET\t" + key + "\t";
            if(err){
                res.end(JSON.stringify({error:err}));
                log += JSON.stringify(err);
            }else{
                res.end(val);
                log += "success";
            }
            logger.info(log);
        });
     }
});

app.post('/:dataType/set', function(req, res){
    var key = req.body.key;
    var val = req.body.val;
    if(!key || !val){
        res.end(JSON.stringify({error:"the key or the val is empty"})); 
        return;
    }
    
    key = req.params.dataType + key;
    redisCli.set(key, val, function(err, result){
        var log = "SET\t" + key + "\t";
        if(err){
            res.end(JSON.stringify({error:err}));
            log += JSON.stringify(err);
        }else{
            log += "success";
            res.end('SUCCESS');
        }
        logger.info(log);
    });
});

app.get('/status' , function(req, res){
    res.end('The server is ok, the pid is ' + process.pid);
});

app.listen(settings.port);
fs.writeFileSync(__dirname + '/server.pid', process.pid);
console.log('server start at ' + tool.getDateString() + ',pid is ' + process.pid + "\n");
