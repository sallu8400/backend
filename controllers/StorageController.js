
const mime = require('mime-types');
const Exc = require('../utils/exc.util');
const {
    ListObjectsV2Command,
    GetObjectCommand,
    DeleteObjectCommand
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const s3 = require('../utils/s3.util');

exports.fetchStorage = Exc(async (req, res) => {

    const cmd = new ListObjectsV2Command({
        Bucket: process.env.BUCKET,
        Prefix: process.env.PIC_FOLDER
    });
    const data = await s3.send(cmd);
    res.json(data.Contents);
});

// exports.createFile = Exc((req, res) => {
//     console.log("create file");
//     res.json(req.file);
// });

exports.Uploadpic = Exc((req, res) => {
    console.log("Uploadpic file");
    res.json(req.file);
});


exports.UploadProduct = Exc((req, res) => {
    console.log("product file");
    res.json(req.file);
});



exports.downloadFile = Exc(async (req, res) => {
    const { type } = req.query;
    const { path } = req.body;

    const ContentType = mime.lookup(path);
    const cmd = new GetObjectCommand({
        Bucket: process.env.BUCKET,
        Key: path,
    });

    if (type !== "file") {
        const url = await getSignedUrl(s3, cmd, { expiresIn: 3600 });
        return res.json({ url });
    }

    const data = await s3.send(cmd);
    res.setHeader("Content-Type", ContentType);
    res.setHeader("Content-Disposition", `inline; ${path.split("/").pop()}`);

    data.Body.pipe(res).on("error", () => {
        res.status(424).json({ message: "Send file failed" });
    });
});

// exports.deleteFile = Exc(async (req, res) => {
//     const { path } = req.body;
//     const cmd = new DeleteObjectCommand({
//         Bucket: process.env.BUCKET,
//         Key: path
//     });
//     await s3.send(cmd);
//     res.json({ message: 'File deleted' });
// });
