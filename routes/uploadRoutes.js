// const express = require('express');
// const { upload } = require('../utils/s3Upload');
// const auth = require('../middleware/auth');
// const admin = require('../middleware/admin');

// const router = express.Router();

// // Upload single image
// router.post('/single', auth, admin, upload.single('image'), (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: 'No file uploaded'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'File uploaded successfully',
//       data: {
//         url: req.file.location,
//         key: req.file.key,
//         originalName: req.file.originalname
//       }
//     });
//   } catch (error) {
//     console.error('Upload error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error during file upload'
//     });
//   }
// });

// // Upload multiple images
// router.post('/multiple', auth, admin, upload.array('images', 5), (req, res) => {
//   try {
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'No files uploaded'
//       });
//     }

//     const uploadedFiles = req.files.map(file => ({
//       url: file.location,
//       key: file.key,
//       originalName: file.originalname
//     }));

//     res.status(200).json({
//       success: true,
//       message: 'Files uploaded successfully',
//       data: uploadedFiles
//     });
//   } catch (error) {
//     console.error('Upload error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error during file upload'
//     });
//   }
// });

// module.exports = router;


const express = require('express');
const StorageRouter = express.Router();
const {

  fetchStorage,
  Uploadpic
} = require('../controllers/StorageController');

const s3 = require('../utils/s3.util');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { v4: uniqueId } = require('uuid');
// const { AdminGuard, AdminUserGuard } = require('../middleware/guard.middleware');

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.BUCKET,
    key: (req, file, cb) => {
      const { fieldname } = file;
      const base =
        fieldname === "file"
          ? process.env.BUCKET_FOLDER
          : process.env.PIC_FOLDER;

      const arr = file.originalname.split(".");
      const ext = arr[arr.length - 1];
      cb(null, `${base}/${uniqueId()}.${ext}`);
    },
    acl: (req, file, cb) => {
      const { fieldname } = file;
      cb(null, fieldname === "pic" ? "public-read" : "private");
    }
  })
});

StorageRouter.get('/', fetchStorage);
// StorageRouter.post('/', AdminGuard, upload.single('file'), createFile);
// StorageRouter.post('/download', AdminUserGuard, downloadFile);
// StorageRouter.post('/delete', AdminGuard, deleteFile);
StorageRouter.post('/upload-pic', upload.single('pic'), Uploadpic);

module.exports = StorageRouter;
