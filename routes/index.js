var express = require('express');

var addPlaylist = require('../db').add;

var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index');
});

router.post('/', async function (req, res, next) {
    let playlist = {
        name: req.body.name,
        isTemporary: (req.body.isTemporary=="1"?true:false),
        date: Date.now(),
        admin: req.cookies._id
    };
    try {
        await addPlaylist(playlist)
    } catch (e) {
        console.log(e)
    }
    res.redirect("/p/" + playlist.name);
});

module.exports = router;