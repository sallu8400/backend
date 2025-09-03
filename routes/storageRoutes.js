const express = require('express');
const StorageRouter = express.Router();

const {
  createFile,
  deleteFile,
  downloadFile,
  fetchStorage,
  Uploadpic,
  UploadProduct,
} = require('../controllers/StorageController');

const s3 = require('../utils/s3.util');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { v4: uniqueId } = require('uuid');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');


const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.BUCKET,
    key: (req, file, cb) => {
      const { fieldname } = file;

      const base =
        fieldname === 'file'
          ? process.env.BUCKET_FOLDER
          : process.env.PIC_FOLDER;

      const arr = file.originalname.split('.');
      const ext = arr[arr.length - 1];

      cb(null, `${base}/${uniqueId()}.${ext}`);
    },
    acl: (req, file, cb) => {
      const { fieldname } = file;
      cb(null, fieldname === 'pic' ? 'public-read' : 'private');
    },
  }),
});

const product = multer({
  storage: multerS3({
    s3: s3, 
    bucket: process.env.BUCKET,
    key: (req, file, cb) => {
      console.log(file,"fle")
      const { fieldname } = file;
      console.log(fieldname,"fieldname")

      const base =
        fieldname === 'product'
          ? process.env.BUCKET_FOLDER
          : process.env.PRODUCT_FOLDER 

      const arr = file.originalname.split('.');
      const ext = arr[arr.length - 1];

      cb(null, `${base}/${uniqueId()}.${ext}`);
    },
    acl: (req, file, cb) => {
      const { fieldname } = file;
      cb(null, fieldname === 'product' ? 'public-read' : 'private');
    },
  }),
});


// Routes
StorageRouter.get('/', fetchStorage);
// StorageRouter.post('/', upload.single('file'), createFile);
StorageRouter.post('/download', downloadFile);
// StorageRouter.post('/delete', deleteFile);
StorageRouter.post('/upload-pic',  upload.single('pic'), Uploadpic);
StorageRouter.post('/upload-product',auth,admin,product.single('product'), UploadProduct);

module.exports = StorageRouter;
