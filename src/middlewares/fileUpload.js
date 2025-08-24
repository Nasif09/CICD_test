const multer = require("multer");
const path = require("path");

module.exports = function (UPLOADS_FOLDER) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, UPLOADS_FOLDER); // Use the provided destination folder
    },
    filename: (req, file, cb) => {
      // console.log("file midleware:: ",file);
      const fileExt = path.extname(file.originalname);
      const filename =
        file.originalname
          .replace(fileExt, "")
          .toLocaleLowerCase()
          .split(" ")
          .join("-") +
        "-" +
        Date.now();

      cb(null, filename + fileExt);
    },
  });

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 200000000, 
    },
    fileFilter: (req, file, cb) => {
      // console.log(file);
      if (file.fieldname == "profileImage") {
        if (
          file.mimetype == "image/jpg" ||
          file.mimetype == "image/png" ||
          file.mimetype == "image/jpeg" ||
          file.mimetype == "image/heic" ||
          file.mimetype == "image/heif"
        ) {
          cb(null, true);

        } else {
          cb(new Error("Only jpg, png, jpeg, heic and heif format allowed!"));
        }
      } 
      else {
        cb(new Error("Only image are allowed!"));
      }
    },
  });

  return upload; 
};
