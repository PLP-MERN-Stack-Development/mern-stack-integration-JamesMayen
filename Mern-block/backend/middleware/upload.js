const multer = require('multer');
const path = require('path');
const fs = require('fs');


const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);


const storage = multer.diskStorage({
destination: (req, file, cb) => cb(null, UPLOAD_DIR),
filename: (req, file, cb) => {
const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
cb(null, unique + path.extname(file.originalname));
}
});
const fileFilter = (req, file, cb) => {
const allowed = /jpeg|jpg|png|gif/;
const ext = path.extname(file.originalname).toLowerCase();
if (allowed.test(ext)) cb(null, true);
else cb(new Error('Unsupported file type'), false);
};


module.exports = multer({ storage, fileFilter });