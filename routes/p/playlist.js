module.exports = function(io) {
    var express = require("express");
    var createError = require('http-errors');
    var cookie = require('cookie');
    
    var router = express.Router();
    
    var getPlaylist = require("../../db").get;
    var addVideo = require("../../db").addVideo;
    var removeVideo = require("../../db").removeVideo;
    var search = require("../../youtubequery").search;

    /* GET home page. */
    router.get("/:name", async function (req, res, next) {
        let name = req.params.name;
        if (name.match(/^[a-zA-Z0-9_]*$/)) {
            try {
                var playlist = await getPlaylist(name);
                let isTemporary = playlist.isTemporary==null?false:playlist.isTemporary;
                let isAdmin = playlist.admin==req.cookies.user;
                res.render("playlist", {
                    state: "SUCCESS",
                    page: "playlist",
                    title: playlist.name,
                    name: playlist.name,
                    isTemporary: isTemporary,
                    isAdmin: isAdmin
                });
            } catch (e) {
                next(createError(404));
            }
        } else {
            next(createError(404));
        }
    });

    /* FOR DEBUG
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
    */

    io.on("connection", (socket)=>{
        socket.on('GETPLAYLIST', async function (data) {        //Requested list of videos. If success emit success status and video list, else emit error.
            let name = data.playlistID;
            var cookies = cookie.parse(socket.handshake.headers.cookie);
            var session = cookies.user;
            try {
                var playlist = await getPlaylist(name, session);
                if (playlist.admin!=session){   //if not admin of playlist
                    for (let i = 0; i < playlist.videos.length; i++) {
                        if(!playlist.videos[i].session)  //if user not added video
                        playlist.videos[i].html=playlist.videos[i].html.replace(/<button type="button" class="close" onClick="removeVideo(.*?)button>/, "");  //remove x button (to remove video)
                    }
                }
                socket.emit(name+" video", {
                    state: "SUCCESS",
                    isTemporary: playlist.isTemporary,
                    videos: playlist.videos
                });
            } catch (e) {
                socket.emit(name, {
                    state: "ERROR"
                });
            }
        });
        
        socket.on('ADDVIDEO', async function (data) {           //Requesto to add video. If success emit success status and boolean to check if added/removed, else emit error.
            let id = data.video;
            var cookies = cookie.parse(socket.handshake.headers.cookie);
            var session = cookies.user;
            let video = {
                id: id,
                html: "",   //generated in db.addVideo
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

        socket.on('REMOVEVIDEO', async function (data) {        //Request to remove video. If success emit success status and boolean to check if added/removed, else emit error.
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

        socket.on('SEARCHVIDEO', async function (data) {        //Request to search videos. If success emit success status and html to load. Error not managed yet.
            let query = data.query;
            var cookies = cookie.parse(socket.handshake.headers.cookie);
            var session = cookies.user;
            let name = data.playlistID;
            html = await search(query);
            
            io.emit(name+" "+session, {
                state: "SUCCESS",
                html: html
            });
        });
    });

    
    return router;
}