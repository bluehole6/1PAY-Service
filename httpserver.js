var http = require("http")

http.createServer(function (req, res){
    var body = "hello, server";
    res.setHeader('content-Type', 'text/html; charset=utf-8');
    res.end("<html><h1>hello server</h1></html>")
})