import multer from "multer";
import fs from "node:fs";
import path from "path";
import cloudinary from "../config/cloudinary.config.js";

const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         let uploadPath = "uploads/";
//         //because in future I might keep profile pictures or anything
//         let folderPath;
//         if (file.fieldname === "productImages") {
//             if (!req.uniqueFolderPath) {
//                 uploadPath += "productImages/";
//                 const folderId = Date.now() + "-" + req.user._id;
//                 folderPath = path.join(uploadPath, folderId);
//                 // ensureDirectoryExists(folderPath);
//                 req.uniqueFolderPath = folderPath; //remember this field!!
//             }else{
//                 folderPath=req.uniqueFolderPath;
//             }
//         } else if (file.fieldname === "profilePic") {
//             folderPath = path.join(uploadPath, "profilePics");
//             // need to remove a file with path=uploadPath+req.user._id if exists
//         } else if (file.fieldname === "invoice") {
//             if(req.uniqueFolderPath){
//                 folderPath = req.uniqueFolderPath;
//             }else{
//                 uploadPath += "productImages/";
//                 const folderId = Date.now() + "-" + req.user._id;
//                 folderPath = path.join(uploadPath, folderId);
//                 // ensureDirectoryExists(folderPath);
//                 req.uniqueFolderPath = folderPath; //remember this field!!
//             }
//         }
//         ensureDirectoryExists(folderPath);
//         cb(null, folderPath);
//     },
//     filename: (req, file, cb) => {
//         //as any way storing in unique folder for every file
//         let fileName;
//         if (file.fieldname === "profilePic") {
//             const extension = path.extname(file.originalname);
//             fileName = req.user._id + extension;
//         } else {
//             fileName = path.basename(file.originalname);
//         }
//         cb(null, fileName);
//     }
// });
const storage = multer.memoryStorage(); 

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

export const uploadFilesToCloudinary = async (req, res, next) => {
  try {
    const hasFiles =
      (req.files && Object.keys(req.files).length > 0) ||
      req.file;

    if (!hasFiles) return next();

    const folderId = Date.now() + "-" + req.user._id;

    const uploadSingle = (file, folder, public_id = null) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: "auto",
            public_id,
          },
          (err, result) => {
            if (err) return reject(err);
            resolve(result);
          }
        );
        stream.end(file.buffer);
      });
    };

    req.cloudinary = {
      productImages: [],
      profilePic: null,
      invoice: null,
    };

    // HANDLE single()
    if (req.file) {
      const result = await uploadSingle(
        req.file,
        `profilePics/${req.user._id}`,
        req.user._id
      );

      req.cloudinary.profilePic = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }

    // HANDLE fields()
    if (req.files) {
      if (req.files.productImages) {
        const uploads = req.files.productImages.map(file =>
          uploadSingle(file, `products/${folderId}`)
        );

        const results = await Promise.all(uploads);
        req.cloudinary.productImages = results.map(r => ({
          url: r.secure_url,
          public_id: r.public_id,
        }));
      }

      if (req.files.profilePic) {
        const result = await uploadSingle(
          req.files.profilePic[0],
          `profilePics/${req.user._id}`,
          req.user._id
        );

        req.cloudinary.profilePic = {
          url: result.secure_url,
          public_id: result.public_id,
        };
      }

      if (req.files.invoice) {
        const result = await uploadSingle(
          req.files.invoice[0],
          `products/${folderId}`
        );

        req.cloudinary.invoice = {
          url: result.secure_url,
          public_id: result.public_id,
        };
      }
    }

    next();
  } catch (err) {
    next(err);
  }
};