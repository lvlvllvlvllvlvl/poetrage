const http = require("http");
const request = require("request");

const ninja = /^\/ninja/;
const poe = /^\/poe/;
const wiki = /^\/wiki/;

http
  .createServer(function (req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");

    if (req.method !== "OPTIONS") {
      req
        .pipe(
          request(
            req.url
              .replace(ninja, "https://poe.ninja")
              .replace(wiki, "https://www.poewiki.net")
              .replace(poe, "https://www.pathofexile.com")
          )
        )
        .pipe(res);
    } else {
      res.end();
    }
  })
  .listen(8080);
