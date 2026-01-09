import multer from "multer";
import fs from "node:fs";
import path from "path";

const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = "uploads/";
        //because in future I might keep profile pictures or anything
        let folderPath;
        if (file.fieldname === "productImages") {
            if (!req.uniqueFolderPath) {
                uploadPath += "productImages/";
                const folderId = Date.now() + "-" + req.user._id;
                folderPath = path.join(uploadPath, folderId);
                // ensureDirectoryExists(folderPath);
                req.uniqueFolderPath = folderPath; //remember this field!!
            }else{
                folderPath=req.uniqueFolderPath;
            }
        } else if (file.fieldname === "profilePic") {
            folderPath = path.join(uploadPath, "profilePics");
            // need to remove a file with path=uploadPath+req.user._id if exists
        } else if (file.fieldname === "invoice") {
            if(req.uniqueFolderPath){
                folderPath = req.uniqueFolderPath;
            }else{
                uploadPath += "productImages/";
                const folderId = Date.now() + "-" + req.user._id;
                folderPath = path.join(uploadPath, folderId);
                // ensureDirectoryExists(folderPath);
                req.uniqueFolderPath = folderPath; //remember this field!!
            }
        }
        ensureDirectoryExists(folderPath);
        cb(null, folderPath);
    },
    filename: (req, file, cb) => {
        //as any way storing in unique folder for every file
        let fileName;
        if (file.fieldname === "profilePic") {
            const extension = path.extname(file.originalname);
            fileName = req.user._id + extension;
        } else {
            fileName = path.basename(file.originalname);
        }
        cb(null, fileName);
    }
});

export const upload = multer({ storage });

export const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        console.log(err)
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: "File too large. Maximum size is 500MB.",
            })
        }
        if (err.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({
                success: false,
                message: "Too many files. Maximum 1 file allowed.",
            })
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({
                success: false,
                message: "Unexpected field name for file upload.",
            })
        }
    }

    if (err.message.includes("Invalid file type")) {
        return res.status(400).json({
            success: false,
            message: err.message,
        })
    }

    next(err);
}