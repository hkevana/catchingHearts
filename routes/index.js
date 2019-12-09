var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

const commentSchema = new mongoose.Schema({
    step: Number,
    name: String,
    comment: String,
    likes: Number,
    dislikes: Number,
});

const Comment = mongoose.model('Comment', commentSchema);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile('index.html', { root: 'public' });
});

router.get('/get', async (req, res) => {
    try {
        let comments = await Comment.find();
        res.send(comments);
    } catch(err) {
        console.log(err);
    }
});

router.post('/', async (req, res) => {
    console.log('in POST comments');
    const comment = new Comment({
        step: req.body.step,
        name: req.body.name,
        comment: req.body.comment,
        likes: 0,
        dislikes: 0
    });
    await comment.save();
    return res.send(comment);
    
});

router.put('/increment', async (req, res) => {
    console.log('in PUT increment');
    var id = { _id: req.body._id };
    try {
        var comment = await Comment.findOne(id);
        if (req.body.type == 1) {
            comment.likes++;
        } else {
            comment.dislikes++;
        }
        await comment.save();
    } catch(err) {
        console.log(err);
    }
    res.send(200);
});

router.delete('/:id', (req, res) => {
    console.log('in DELETE comment-id:' + req.params.id);
    var comment = { _id: req.params.id };
    Comment.deleteOne(comment, (err, obj) => {
        if (err) throw err;
        console.log('deleted successfully');
    });
    res.end('{"Success":"Updated Successfully", "Status": 200}');
});
module.exports = router;
