var path = require("path");
var jsdom = require("jsdom");
var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io").listen(server);
var Datauri = require("datauri");
var datauri = new Datauri();
var { JSDOM } = jsdom;

app.use(express.static(__dirname + "/public"));
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

function setupAuthoritativePhaser() {
    JSDOM.fromFile(path.join(__dirname, "authoritative_server/index.html"), {
        runScripts: "dangerously",
        resources: "usable",
        pretendToBeVisual: true
    })
        .then((dom) => {
            dom.window.URL.createObjectURL = (blob) => {
                if (blob) {
                    return datauri.format(
                        blob.type,
                        blob[Object.getOwnPropertySymbols(blob)[0]]._buffer
                    ).content;
                }
            };
            dom.window.URL.revokeObjectURL = (objectURL) => {};

            dom.window.gameLoaded = () => {
                var port = process.env.PORT;
                if (port == null || port == "") {
                    port = 8082;
                }
                server.listen(port, () => {
                    console.log(`Listening on ${server.address().port}`);
                });
            };
            dom.window.io = io;
        })
        .catch((error) => {
            console.log(error.message);
        });
}

setupAuthoritativePhaser();
