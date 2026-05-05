import multer from "multer";

// Memory storage use karein kyunki hum ImageKit use kar rahe hain
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed!"), false);
  }
};

export const singleUpload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}).single("avatar"); // "avatar" wahi key hai jo frontend se aayegi
