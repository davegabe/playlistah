const gapikey = "AIzaSyBR7EnowNigvDzFmSAm12D53e0_bF-uSd4";
const queuedAlert = `<div class="alert alert-success" role="alert"> QUEUED </div>`;
const alreadyQueuedAlert = `<div class="alert alert-danger" role="alert"> ALREADY IN PLAYLIST </div>`;
const removedAlert = `<div class="alert alert-success" role="alert"> REMOVED </div>`;
const alreadyRemovedAlert = `<div class="alert alert-danger" role="alert"> CANNOT REMOVE VIDEO </div>`;
var isFirst = true;
var waitingSearch;
var currentVideo=0;
var videos;
var isTemporary=false;
var playlistID = window.location.pathname.split("/")[2];

var isMobile = false;

if (
    /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
        navigator.userAgent
    ) ||
    /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        navigator.userAgent.substr(0, 4)
    )
) {
    isMobile = true;
}

//socket stuff
var socket = io.connect(window.location.hostname+":"+window.location.port);
socket.on('connect', function(){
    getVideos();
});

socket.on(playlistID + " video", function (playlist) {
    videos = playlist.videos;
    updateVideoList(playlist, playlist.isRemoved);
});

socket.on(playlistID, function (data) {
    if (data.state == "ERROR") {
        if (data.isRemoved)
            $("#alerts").append(alreadyRemovedAlert);
        else
            $("#alerts").append(alreadyQueuedAlert);
        setTimeout(() => {
            $("#alerts").empty();
        }, 2500);
        return;
    }
    getVideos();
});

socket.on(playlistID+ " "+ document.cookie.match(/user=[^;]+/)[0].substring(5), function (data) {
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
async function updateVideoList(playlist, isRemove) {
    $("#videos-list").empty();
    
    for(let i=0; i<playlist.videos.length;i++){
        $("#videos-list").append(playlist.videos[i].html);
    }

    if (isFirst) {
        isFirst = false;
        openVideo();
    } else {
        if (isRemove)
            $("#alerts").append(removedAlert);
        else
            $("#alerts").append(queuedAlert);
        setTimeout(() => {
            $("#alerts").empty();
        }, 2500);
    }
}

function openDialog(){
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
    if(player==null){
        if(videos.length>0){
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
                videoId: videos[currentVideo].id,
                events: {
                "onStateChange": onPlayerStateChange
                }
            });
            animatePlayVideo();
            $( `li[video-id='${videos[currentVideo].id}']`).find("div.play").css({'background-image':'url("../../images/eq-static.gif")'});
        }
    }
}

function onPlayerStateChange(event) {
    if(event.data === YT.PlayerState.ENDED) {
        let oldCurrentVideo=currentVideo;
        if(!isTemporary){
            if(currentVideo+1<videos.length){
                currentVideo++;
                player.loadVideoById(videos[currentVideo].id, 0, "large");
            }
        } else {
            removeVideo(videos[0].id);
            currentVideo=1;
            if(videos.length>1)
            player.loadVideoById(videos[currentVideo].id, 0, "large");
        }
        animatePlayVideo(oldCurrentVideo);
    } else {
        if(event.data === YT.PlayerState.PAUSED) {
            $( `li[video-id='${videos[currentVideo].id}']`).find("div.play").css({'background-image':'url("../../images/eq-static.gif")'});
        } else {
            if(event.data === YT.PlayerState.PLAYING) {
                $( `li[video-id='${videos[currentVideo].id}']`).find("div.play").css({'background-image':'url("../../images/eq.gif")'});
            }
        }
    }
}

function animatePlayVideo(oldCurrentVideo){
    if(oldCurrentVideo!=null)
        $( `li[video-id='${videos[oldCurrentVideo].id}']`).find("div.play").removeAttr('style');
    $( `li[video-id='${videos[currentVideo].id}']`).find("div.play").css({'background-image':'url("../../images/eq.gif")'});
}

function playVideo(id){
    let oldCurrentVideo=currentVideo;
    currentVideo=id;
    if(player!=null){
        player.loadVideoById(videos[currentVideo].id, 0, "large");
        animatePlayVideo(oldCurrentVideo);
    } else {
        openVideo();
    }
}

function showPlayer() {
    if($('div.video').width()>0){
        $('div.video').css({'width':'0%'});
        $('button#arrowHide').css({'transform': 'rotate(180deg)'});
    }
    else{
        $('div.video').width('');
        $('button#arrowHide').css({'transform': 'rotate(0deg)'});
    }
}
//end youtube player stuff