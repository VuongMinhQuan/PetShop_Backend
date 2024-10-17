const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinaryConfig"); // Đường dẫn tới file cấu hình Cloudinary

// Cấu hình CloudinaryStorage cho Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "hotel_images", // Thư mục trên Cloudinary
    allowed_formats: ["jpg", "png", "jpeg", "gif", "webp"], // Các định dạng được phép
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});

// Sử dụng .array() để cho phép upload nhiều file với tên 'IMAGES'
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Kiểm tra định dạng file
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/gif" ||
      file.mimetype === "image/webp"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ cho phép định dạng ảnh JPEG, PNG, GIF, WebP!"), false);
    }
  },
}).array("IMAGES[]", 10); // Cho phép tối đa 10 ảnh

module.exports = upload;
