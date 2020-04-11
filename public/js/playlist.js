const gapikey = "AIzaSyBR7EnowNigvDzFmSAm12D53e0_bF-uSd4";
const queuedAlert = `<div class="notification is-success"> QUEUED </div>`;
const removedAlert = `<div class="notification is-success"> REMOVED </div>`;
const alreadyQueuedAlert = `<div class="notification is-danger"> ALREADY IN PLAYLIST </div>`;
const alreadyRemovedAlert = `<div class="notification is-danger"> CAN'T REMOVE VIDEO </div>`;
var waitingSearch;
var timeoutAlert;
var currentVideoId = "";
var currentVideoPos = 0;
var videos;
var isTemporary = false;
var playlistID = window.location.pathname.split("/")[2];

//socket stuff
var socket = io.connect(window.location.hostname + ":" + window.location.port);
socket.on('connect', function () { //On connect request videos
    getVideos();
});

socket.on(playlistID + " video", function (playlist) { //Server just sent video list. Let's process it.
    videos = playlist.videos;
    isTemporary=playlist.isTemporary
    updateVideoList(playlist, playlist.isRemoved);
});

socket.on(playlistID, function (data) { //Server just sent an error. Let's manage it.
    if (data.state == "ERROR") {
        $("#alerts").empty();
        clearTimeout(timeoutAlert);
        if (data.isRemoved)
            $("#alerts").append(alreadyRemovedAlert);
        else
            $("#alerts").append(alreadyQueuedAlert);
        timeoutAlert = setTimeout(() => {
            $("#alerts").empty();
        }, 2500);
        return;
    }
    getVideos();
});

socket.on(playlistID + " " + document.cookie.match(/user=[^;]+/)[0].substring(5), function (data) { //Server just sent search results. Let's manage it.
    if (data.state == "SUCCESS") {
        $("#results").empty();
        $("#results").append(data.html);
    }
});

async function getVideos() {
    socket.emit('GETPLAYLIST', {
        playlistID: playlistID
    });
}

async function addVideo(id) {
    modalClose();
    socket.emit('ADDVIDEO', {
        playlistID: playlistID,
        video: id
    });
}

async function removeVideo(id) {
    socket.emit('REMOVEVIDEO', {
        playlistID: playlistID,
        video: id
    });
}

async function searchVideo(query) {
    socket.emit('SEARCHVIDEO', {
        playlistID: playlistID,
        query: query
    });
}
//end socket stuff

//html management stuff
$(".modal-button").click(function () {
    $(".modal").addClass("is-active");
});

$(".modal-close-button").click(function () {
    modalClose();
});

$(".modal-background").click(function () {
    modalClose();
});

function modalClose() {
    $(".modal").removeClass("is-active");
}

async function updateVideoList(playlist, isRemove) {
    $("#videos-list").empty();

    for (let i = 0; i < playlist.videos.length; i++) {
        $("#videos-list").append(playlist.videos[i].html);
    }

    if (player == null) {
        openVideo();
    } else {
        $("#alerts").empty();
        clearTimeout(timeoutAlert);
        if (isRemove)
            $("#alerts").append(removedAlert);
        else
            $("#alerts").append(queuedAlert);
        timeoutAlert = setTimeout(() => {
            $("#alerts").empty();
        }, 2500);
    }
}

function openDialog() {
    $("#alerts").empty();
}

async function submitSearch() {
    q = $("#query").val();

    if (waitingSearch) {
        clearTimeout(waitingSearch);
        waitingSearch = null;
    }

    if (q.length >= 3) {
        waitingSearch = setTimeout(searchVideo, 1000, q);
    }

    return false;
}
//end html management stuff

//youtube player stuff
var player = null;

function openVideo() {
    if (videos.length > 0) {
        if (player == null) {
            currentVideoId = videos[0].id;
            currentVideoPos = 0;
            player = new YT.Player("player", {
                width: "100%",
                height: "100%",
                playerVars: {
                    modestbranding: 1,
                    rel: 0,
                    showinfo: 0,
                    iv_load_policy: 3,
                    cc_load_policy: 0
                },
                videoId: currentVideoId,
                events: {
                    "onStateChange": onPlayerStateChange
                }
            });
        }
    } else {
        player = null;
    }
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        let oldCurrentVideoId = currentVideoId;
        if (isTemporary) {
            removeVideo(oldCurrentVideoId);
        } else {
            animatePlayVideo(oldCurrentVideoId);
        }
        let newIndexVideo = findIndexVideo(currentVideoId) + 1;
        console.log(newIndexVideo);

        if (newIndexVideo < videos.length) {
            if (newIndexVideo == 0) { //if can't find the prev video (-1)
                newIndexVideo = currentVideoPos;
            }
            playVideo(videos[newIndexVideo].id);
        }
    } else {
        if (event.data === YT.PlayerState.PAUSED) {
            $(`li[video-id='${currentVideoId}']`).find("div.play").css({
                'background-image': 'url("../../images/eq-static.gif")'
            });
        } else {
            if (event.data === YT.PlayerState.PLAYING) {
                $(`li[video-id='${currentVideoId}']`).find("div.play").css({
                    'background-image': 'url("../../images/eq.gif")'
                });
            }
        }
    }
}

function animatePlayVideo(oldCurrentVideoId) {
    if (oldCurrentVideoId != null)
        $(`li[video-id='${oldCurrentVideoId}']`).find("div.play").removeAttr('style');
    $(`li[video-id='${currentVideoId}']`).find("div.play").css({
        'background-image': 'url("../../images/eq.gif")'
    });
}

function playVideo(videoId) {
    let oldCurrentVideoId = currentVideoId;
    currentVideoId = videoId;
    currentVideoPos = findIndexVideo(videoId);
    if (player != null) {
        player.loadVideoById(currentVideoId, 0, "large");
        animatePlayVideo(oldCurrentVideoId);
    } else {
        openVideo();
    }
}

function showPlayer() {
    if ($('div.video').width() > 0) {
        $('div.video').css({
            'width': '0%'
        });
        $('button#arrowHide').css({
            'transform': 'rotate(180deg)'
        });
    } else {
        $('div.video').width('');
        $('button#arrowHide').css({
            'transform': 'rotate(0deg)'
        });
    }
}

function findIndexVideo(videoId) {
    return videos.findIndex(function (video) {
        return video.id === videoId
    });
}
//end youtube player stuff