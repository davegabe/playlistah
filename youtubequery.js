const gapikey = process.env.GAPI_KEY;
var {google} = require('googleapis');

const yt = google.youtube({
    version: 'v3',
    auth: gapikey
  });

async function getHtmlVideo(video) {
    var result = await yt.videos.list({
        part: "snippet, id, contentDetails",
        id: video
    });
    
    var output = getOutput(result.data.items[0], false);
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
function getOutput(item, isSearch) {
    var title = item.snippet.title;
    var thumb = item.snippet.thumbnails.default.url;
    var channelTitle = item.snippet.channelTitle;
    var onClickScript = ` class="media-left" `;
    if(isSearch){
        var videoID = item.id.videoId;
        var xButton = ``;
        onClickScript = `class="media-left pointer" onClick = "addVideo('${videoID}')"`;
    }
    else {
        var videoID = item.id;
        var xButton = `
            <div class="media-right">
                <button class="delete" onClick="removeVideo('${videoID}')"></button>
            </div>
        `;
        var time="";
        let duration = item.contentDetails.duration;
        let hours = duration.match(/(\d+)H/);
        let minutes = duration.match(/(\d+)M/);
        let seconds = duration.match(/(\d+)S/);
        if (hours) time+=hours[1]+":";
        if (minutes)
            time+=minutes[1]+":";
        else
            time+="00:";
        if (seconds)
            time+=seconds[1].toString().padStart(2,"0");
        else
            time+="00";
    }
    var output = `
        <li class="media pointer" video-id="${videoID}" ${onClickScript}>
            <div class="media-left">
                <div class="image has-ratio">
                    <img src="${thumb}">
                    ${!isSearch?`<div class="time"> ${time} </div>
                    <div class="play" onclick="playVideo('${videoID}')"></div>`:"" }
                </div>
            </div>
            <div class="media-content is-completely-center">
                <div class="content">
                    <h1 class="title is-size-5-touch">${title}</h1>
                    <h5 class="subtitle is-size-7-touch">by ${channelTitle}</h2>
                </div>
            </div>
            ${xButton}
        </li>
    `;
    return output;
}


module.exports = {
    getHtmlVideo: getHtmlVideo,
    search: search

};