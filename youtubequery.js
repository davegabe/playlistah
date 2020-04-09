var fetch = require("node-fetch");
const gapikey = process.env.GAPI_KEY;
var {google} = require('googleapis');

const yt = google.youtube({
    version: 'v3',
    auth: gapikey
  });

async function getHtmlVideo(video, index) {
    var result = await yt.videos.list({
        part: "snippet, id, contentDetails",
        id: video
    });
    
    var output = getOutput(result.data.items[0], false, index);
    return output;  //html of video
}

async function search(query) {
    var output;
    var result = await yt.search.list({
        part: "snippet, id",
        q: query,
        type: "video",
        maxResults: 5
    });
    result.data.items.forEach(async item => {
        output += getOutput(item, true, false);
    });
    return output;  //html of searched videos
}


// Build output
function getOutput(item, isSearch, i) {
    var title = item.snippet.title;
    var thumb = item.snippet.thumbnails.default.url;
    var channelTitle = item.snippet.channelTitle;
    var onClickScript = `class = "media" `;
    if(isSearch){
        var videoID = item.id.videoId;
        var xButton = ``;
        onClickScript = `class="media hand" onClick = "addVideo('${videoID}')" data-dismiss="modal"`;
    }
    else {
        var videoID = item.id;
        var xButton = `<button type="button" class="close" onClick="removeVideo('${videoID}')">×</button>`;
        var time="";
        let duration = item.contentDetails.duration;
        let hours = duration.match(/(\d+)H/);
        let minutes = duration.match(/(\d+)M/);
        let seconds = duration.match(/(\d+)S/);
        if (hours) time+=hours[1]+":";
        if (minutes)
            time+=minutes[1].toString().padStart(2,"0")+":";
        else
            time+="00:";
        if (seconds)
            time+=seconds[1].toString().padStart(2,"0");
        else
            time+="00";
    }

    var output = `<li class="list-group-item song" video-id="${videoID}">
            ${xButton}
            <div ${onClickScript}>
                <div id="image" style="position:relative">
                <img class="align-self-center mr-3" src="${thumb}">
                    ${!isSearch?`<div class="time"> ${time} </div>
                    <div class="play" onclick="playVideo(${i})"></div>`:"" }
                </div>
                <div class="media-body">
                <h5 class="mt-0">${title}</h5>
                <small>By <span class="cTitle">${channelTitle}</small>
            </div>
        </li>
        <div class="clearfix"></div>`;
    return output;
}


module.exports = {
    getHtmlVideo: getHtmlVideo,
    search: search

};