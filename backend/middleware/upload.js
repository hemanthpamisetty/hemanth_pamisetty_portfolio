const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define storage for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let dest = 'uploads/';
        if (req.originalUrl.includes('/profile')) dest += 'profile/';
        else if (req.originalUrl.includes('/certificates')) dest += 'certificates/';
        else if (req.originalUrl.includes('/projects')) dest += 'projects/';
        else if (req.originalUrl.includes('/resume')) dest += 'resume/';
        else dest += 'others/';

        const fullDest = path.join(__dirname, '../', dest);
        
        // Ensure directory exists
        if (!fs.existsSync(fullDest)) {
            fs.mkdirSync(fullDest, { recursive: true });
        }
        
        cb(null, fullDest);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only images and documents (pdf, doc, docx) are allowed!'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: fileFilter
});

module.exports = upload;
