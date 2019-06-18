const express = require("express");
const multer = require("multer");

const Post = require("../models/post");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "application/msword": "doc",
  "application/msword": "dot",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.template": "dotx",
  "application/vnd.ms-word.document.macroEnabled.12": "docm",
  "application/vnd.ms-word.template.macroEnabled.12": "dotm",
  "application/vnd.ms-excel": "xls",
  "application/vnd.ms-excel": "xlt",
  "application/vnd.ms-excel": "xla",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.template": "xltx",
  "application/vnd.ms-excel.sheet.macroEnabled.12": "xlsm",
  "application/vnd.ms-excel.template.macroEnabled.12": "xltm",
  "application/vnd.ms-excel.addin.macroEnabled.12": "xlam",
  "application/vnd.ms-excel.sheet.binary.macroEnabled.12": "xlsb",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.ms-powerpoint": "pot",
  "application/vnd.ms-powerpoint": "pps",
  "application/vnd.ms-powerpoint": "ppa",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "application/vnd.openxmlformats-officedocument.presentationml.template": "potx",
  "application/vnd.openxmlformats-officedocument.presentationml.slideshow": "ppsx",
  "application/vnd.ms-powerpoint.addin.macroEnabled.12": "ppam",
  "application/vnd.ms-powerpoint.presentation.macroEnabled.12": "pptm",
  "application/vnd.ms-powerpoint.template.macroEnabled.12": "potm",
  "application/vnd.ms-powerpoint.slideshow.macroEnabled.12": "ppsm",
  "application/vnd.ms-access": "mdb"
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValid) {
      error = null;
    }
    cb(error, "backend/images");
  },
  filename: (req, file, cb) => {
    const name = file.originalname
      .toLowerCase()
      .split(" ")
      .join("-");
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + "-" + Date.now() + "." + ext);
  }
});

router.post(
  "",
  checkAuth ,
  multer({ storage: storage }).single("file"),
  (req, res, next) => {
    const url = req.protocol + "://" + req.get("host");
    const post = new Post({
      fileName: req.body.fileName,
      filePath: url + "/images/" + req.file.filename,
      // author: req.body.author,
      author: req.userData.userId,
      dateUploaded: req.body.dateUploaded,
      fileTags: req.body.fileTags,
      dateLastModified: req.body.dateLastModified,
      userLastModified: req.userData.userId
    });
    post.save().then(createdPost => {
      res.status(201).json({
        message: "Post added successfully",
        post: {
          ...createdPost,
          id: createdPost._id
        }
      });
    })
    .catch(error => {
      res.status(500).json({
        message: 'Creating a post failed'
      })
    });
  }
);

router.put(
  "/:id",
  checkAuth,
  multer({ storage: storage }).single("file"),
  (req, res, next) => {
    let filePath = req.body.filePath;
    if (req.file) {
      const url = req.protocol + "://" + req.get("host");
      filePath = url + "/images/" + req.file.filename
    }
    const post = new Post({
      _id: req.body.id,
      fileName: req.body.fileName,
      filePath: filePath,
      author: req.body.author,
      dateUploaded: req.body.dateUploaded,
      fileTags: req.body.fileTags,
      dateLastModified: req.body.dateLastModified,
      userLastModified: req.userData.userId
    });
    // Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post).then(result => {
    Post.updateOne({ _id: req.params.id }, post).then(result => {
      if(result.nModified > 0) {
        res.status(200).json({ message: "Update successful!" });
      }
      else {
        res.status(401).json({ message: "Nothing was updated!" });
      }
    })
    .catch(error => {
      res.status(500).json({
        message: 'Could not update post'
      })
    });
  }
);

router.get("", (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  let fetchedPosts;
  const postQuery = Post.find();
  if (pageSize && currentPage) {
    postQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);                   //inefficient for large datasets
  }
  postQuery.then(documents => {
    fetchedPosts = documents;
    return Post.count();
  }).then (count => {
      res.status(200).json({
      message: "Posts fetched successfully!",
      posts: fetchedPosts,
      maxPosts: count
    });
  })
  .catch(error => {
    res.status(500).json({
      message: 'Fetching posts failed'
    })
  });
});

router.get("/:id", (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: "Post not found!" });
    }
  })
  .catch(error => {
    res.status(500).json({
      message: 'Fetching post failed'
    })
  });
});

router.delete("/:id", checkAuth, (req, res, next) => {
  // Post.deleteOne({ _id: req.params.id, creator: req.userData.userId }).then(result => {
  Post.deleteOne({ _id: req.params.id }).then(result => {
    if(result.n > 0) {
      res.status(200).json({ message: "Delete successful!" });
    } else {
      res.status(401).json({ message: "Not authorized!" });
    }
  })
  .catch(error => {
    res.status(500).json({
      message: 'Deleting post failed'
    })
  });
});

module.exports = router;
