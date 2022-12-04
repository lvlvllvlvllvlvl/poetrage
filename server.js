const http = require("http");
const request = require("request");

const ninja = /^\/ninja/;
const poe = /^\/poe/;
const wiki = /^\/wiki/;

http
  .createServer(function (req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("cache-control", "max-age=3600");

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
        .on("response", (res) => {
          res.headers["cache-control"] = "max-age=3600";
          delete res.headers.age;
          delete res.headers.date;
        })
        .pipe(res);
    } else {
      res.end();
    }
  })
  .listen(8080);
