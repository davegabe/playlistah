module.exports = function(io) {
    var express = require("express");
    var createError = require('http-errors');
    var cookie = require('cookie');
    
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
            let isTemporary = playlist.isTemporary==null?false:playlist.isTemporary;
            let isAdmin = playlist.admin==req.cookies.user;
            res.render("playlist", {
                state: "SUCCESS",
                name: playlist.name,
                isTemporary: isTemporary,
                isAdmin: isAdmin
            });
        } catch (e) {
            next(createError(404));
        }
    });
    
    io.on("connection", (socket)=>{
        socket.on('GETPLAYLIST', async function (data) {
            let name = data.playlistID;
            var cookies = cookie.parse(socket.handshake.headers.cookie);
            var session = cookies.user;
            try {
                var playlist = await getPlaylist(name, session);
                socket.emit(name+" video", {
                    state: "SUCCESS",
                    videos: playlist.videos
                });
            } catch (e) {
                socket.emit(name, {
                    state: "ERROR"
                });
            }
        });
        
        socket.on('ADDVIDEO', async function (data) {
            let id = data.video;
            var cookies = cookie.parse(socket.handshake.headers.cookie);
            var session = cookies.user;
            let video = {
                id: id,
                session: session
            };
            let name = data.playlistID;
            try {
                await addVideo(name, video)
                io.emit(name, {
                    state: "SUCCESS",
                    isRemoved: false
                });
            } catch (e) {
                socket.emit(name, {
                    state: "ERROR"
                });
            }
        });

        socket.on('REMOVEVIDEO', async function (data) {
            let id = data.video;
            var cookies = cookie.parse(socket.handshake.headers.cookie);
            var session = cookies.user;
            let video = {
                id: id,
                session: session
            };
            let name = data.playlistID;
            try {
                await removeVideo(name, video, session);
                io.emit(name, {
                    state: "SUCCESS",
                    isRemoved: true
                });
            } catch (e) {
                socket.emit(name, {
                    state: "ERROR"
                });
            }
        });
    });

    
    return router;
}