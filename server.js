const http = require('http');
const request = require('request');

const ninja = /^\/ninja/
const poe = /^\/poe/

http.createServer(function (req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    if (req.method !== "OPTIONS") {
        req.pipe(request(req.url.replace(ninja, "https://poe.ninja").replace(poe, "https://www.pathofexile.com"))).pipe(res);
    } else {
        res.end();
    }
}).listen(8080);
