const cloudinary = require("cloudinary").v2;
const path = require("path");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Middleware function to upload file to Cloudinary
function uploadToCloudinary(req, res, next) {
  if (!req.file) {
    return next(new Error('No file uploaded'));
  }

  const uploadOptions = {
    folder: req.body.folderName || "melange",
    overwrite: true,
    public_id: req.body.givenFileName // Set the public_id of the file (name)
  };

  // Upload the file using cloudinary.uploader.upload
  cloudinary.uploader.upload(req.file.path, uploadOptions, (error, result) => {
    if (error) {
      return next(error);
    }
    req.cloudinaryUrl = result.secure_url;
    next();
  });
}

module.exports = uploadToCloudinary;
