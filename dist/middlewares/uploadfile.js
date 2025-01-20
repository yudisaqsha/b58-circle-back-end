"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMultiple = void 0;
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinary_1 = require("cloudinary");
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: {
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }],
    },
});
const upload = (0, multer_1.default)({ storage });
exports.uploadMultiple = upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverPic', maxCount: 1 },
]);
exports.default = upload;
