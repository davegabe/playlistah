var express = require("express");
var createError = require('http-errors');

var router = express.Router();

var getPlaylist = require("../../db").get;
var addVideo = require("../../db").addVideo;
var removeVideo = require("../../db").removeVideo;

/* GET home page. */
router.get("/:name", async function (req, res, next) {
    let name = req.params.name;
    if (!name.match(/^[a-zA-Z0-9_]*$/)) {
        let newName = "";
        for (var i = 0; i < name.length; i++) {
            if (name[i].match(/^[a-zA-Z0-9_]*$/))
                newName += name[i];
        }
        res.redirect("/p/" + newName)
        return;
    }

    try {
        var playlist = await getPlaylist(name);
        res.render("playlist", {
            state: "SUCCESS",
            name: playlist.name
        });
    } catch (e) {
        next(createError(404));
    }
});

router.get("/:name/videos", async function (req, res, next) {
    let name = req.params.name;
    let session = req.cookies._id;
    try {
        var playlist = await getPlaylist(name, session);
        res.json({
            state: "SUCCESS",
            videos: playlist.videos
        });
    } catch (e) {
        next(createError(404));
    }
});

router.post("/:name", async function (req, res, next) {
    let action = req.body.action;
    let id = req.body.video;
    let session = req.cookies._id;
    let video = {
        id: id,
        session: session
    };
    let name = req.params.name;
    try {
        console.log(req.body)
        if (action == "ADD") await addVideo(name, video)
        else if (action == "REMOVE") await removeVideo(name, video, session);

        var playlist = await getPlaylist(name, session);
        res.json({
            state: "SUCCESS",
            videos: playlist.videos
        });
    } catch (e) {
        res.json({
            state: "ERROR",
            error: e
        });
    }
});

module.exports = router;