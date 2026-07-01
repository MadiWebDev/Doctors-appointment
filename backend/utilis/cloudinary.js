import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { Readable } from "stream";

// Lazy-configure Cloudinary — called at request time so env vars are already loaded.
const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

// Custom storage engine for Cloudinary
const cloudinaryStorage = (options = {}) => {
  return {
    _handleFile: (req, file, cb) => {
      configureCloudinary();
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder || "doctor-appointments",
          allowed_formats: options.allowed_formats || ["jpg", "jpeg", "png"],
          transformation: options.transformation || [],
          resource_type: options.resource_type || "image",
        },
        (error, result) => {
          if (error) {
            return cb(error);
          }
          cb(null, {
            filename: result.public_id,
            path: result.secure_url,
            originalname: file.originalname,
          });
        }
      );

      const stream = Readable.from(file.buffer);
      stream.pipe(uploadStream);
    },
    _removeFile: (req, file, cb) => {
      cloudinary.uploader.destroy(file.filename, (error) => {
        if (error) {
          return cb(error);
        }
        cb(null);
      });
    },
  };
};

// Memory storage for processing before upload
const memoryStorage = multer.memoryStorage();

// Upload middleware for profile images
export const uploadProfileImage = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(file.mimetype);
    if (extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files (jpeg, jpg, png, webp) are allowed"));
  },
});

// Upload middleware for documents
export const uploadDocument = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|jpeg|jpg|png/;
    const extname = allowedTypes.test(file.mimetype);
    if (extname) {
      return cb(null, true);
    }
    cb(new Error("Only PDF and image files are allowed"));
  },
});

// Helper function to upload buffer to Cloudinary
export const uploadToCloudinary = async (buffer, options) => {
  configureCloudinary();
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
    
    const stream = Readable.from(buffer);
    stream.pipe(uploadStream);
  });
};

// Helper function to delete image from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  configureCloudinary();
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
  }
};

export default cloudinary;
