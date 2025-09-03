// const AWS = require('aws-sdk');
// const multer = require('multer');
// const multerS3 = require('multer-s3');

// // Configure AWS
// AWS.config.update({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION
// });

// const s3 = new AWS.S3();

// // Multer S3 configuration
// const upload = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: process.env.AWS_S3_BUCKET,
//     acl: 'public-read',
//     metadata: function (req, file, cb) {
//       cb(null, { fieldName: file.fieldname });
//     },
//     key: function (req, file, cb) {
//       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//       const fileExtension = file.originalname.split('.').pop();
//       cb(null, `uploads/${file.fieldname}-${uniqueSuffix}.${fileExtension}`);
//     }
//   }),
//   fileFilter: function (req, file, cb) {
//     // Check file type
//     if (file.mimetype.startsWith('image/')) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only image files are allowed!'), false);
//     }
//   },
//   limits: {
//     fileSize: 5 * 1024 * 1024 // 5MB limit
//   }
// });

// // Delete file from S3
// const deleteFromS3 = async (key) => {
//   try {
//     await s3.deleteObject({
//       Bucket: process.env.AWS_S3_BUCKET,
//       Key: key
//     }).promise();
//     return true;
//   } catch (error) {
//     console.error('S3 delete error:', error);
//     return false;
//   }
// };

// module.exports = {
//   upload,
//   deleteFromS3,
//   s3
// };


const { S3Client } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

module.exports = s3;
