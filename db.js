const mongoose = require('mongoose');
mongoose.connect('mongodb://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' + process.env.DB_HOST, {
    useNewUrlParser: true
});

const playlistSchema = mongoose.Schema({
    name: String,
    date: Date,
    admin: String,
    isTemporary: Boolean,
    videos: [{
        id: String,
        session: String
    }]
});

get = (name, session) => {
    return new Promise((resolve, reject) => {
        let query = {
            name: name
        }
        Playlist.findOne(query, function (error, result) {
            if (error) reject(Error("Error on db"));
            if (!result) {
                reject(Error("Playlist doesn't exist."));
            } else {
                result = result.toJSON();
                for (var i = 0; i < result.videos.length; i++) {
                    let isSessionValid = session == result.videos[i].session | session == result.admin;
                    delete result.videos[i]._id;
                    delete result.videos[i].session;
                    result.videos[i].session = isSessionValid;
                }
                resolve(result);
            }
        });
    });
}

add = (playlist) => {
    return new Promise((resolve, reject) => {
        let query = {
            name: playlist.name
        }
        Playlist.findOne(query, function (error, result) {
            if (error) reject(Error("Error on db"));
            if (!result) {
                var PL = new Playlist(playlist)
                PL.save(function (err) {
                    if (err) return reject(err);
                    resolve("Playlist created.");
                });
            } else {
                if((result.videos.length>0 && Date.now()-result.date > 1000*60*60*24 /*1 giorno*/) || result.videos.length==0){
                    Playlist.update(result,playlist);
                    resolve("Playlist created.");
                } else {
                    reject(Error("Playlist already exist."));
                }
            }
        });
    });
}

erase = (playlist) => {
    return new Promise((resolve, reject) => {
        let query = {
            name: playlist.name
        }
        Playlist.findOne(query, function (error, result) {
            if (error) reject(Error("Error on db"));
            if (!result) {
                reject(Error("Playlist doesn't exist."));
            } else {
                Playlist.deleteOne(query, function (err) {
                    if (err) return reject(err);
                    resolve("Playlist removed");
                });
            }
        });
    });
}

addVideo = (playlistName, video) => {
    return new Promise((resolve, reject) => {
        let query = {
            name: playlistName
        }
        Playlist.findOne(query, function (error, result) {
            if (error) reject(Error("Error on db"));
            if (result) {
                for (var i = 0; i < result.videos.length; i++) {
                    if (result.videos[i].id == video.id)
                        return reject(Error("Video already exist in this playlist."));
                }
                result.videos.push(video);
                result.save(function (err) {
                    if (err) return reject(err);
                    resolve("Video added.");
                });
            } else {
                return reject(Error("Playlist doesn't exist."));
            }
        });
    });
}

removeVideo = (playlistName, video, session) => {
    return new Promise((resolve, reject) => {
        let query = {
            name: playlistName
        }
        Playlist.findOne(query, function (error, result) {
            if (!error) {
                if (result) {
                    var index = -1;
                    var isSessionValid = false;
                    for (var i = 0; i < result.videos.length; i++) {
                        if (result.videos[i].id == video.id) {
                            index = i;
                            if (session == result.videos[i].session || session == result.admin) {
                                isSessionValid = true;
                            }
                            break;
                        }
                    }
                    if (index == -1) return reject(Error("Video doesn't exist in this playlist."));
                    if (!isSessionValid) return reject(Error("You're not allowed to remove this video."));
                    result.videos.splice(index, 1);
                    result.save(function (err) {
                        if (err) return reject(err);
                        resolve("Video removed.");
                    });
                }
            } else {
                reject(Error("Playlist doesn't exist."));
            }
        });
    });
}

const Playlist = mongoose.model('Playlist', playlistSchema);

module.exports = {
    Playlist: Playlist,
    add: add,
    erase: erase,
    get: get,
    addVideo: addVideo,
    removeVideo: removeVideo,
};