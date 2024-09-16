const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinaryConfig"); // Import cấu hình Cloudinary

// Cấu hình lưu trữ Multer để upload ảnh lên Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "hotel_images", // Thư mục trên Cloudinary
    allowed_formats: ["jpg", "png"], // Chỉ cho phép định dạng JPG và PNG
  },
});

// Middleware Multer để xử lý upload ảnh
const upload = multer({ storage: storage });

module.exports = upload;
