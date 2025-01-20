"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController = __importStar(require("../../controllers/userController"));
const authmiddleware_1 = require("../../middlewares/authmiddleware");
const uploadfile_1 = require("../../middlewares/uploadfile");
const userRoute = express_1.default.Router();
userRoute.get('/', authmiddleware_1.authentication, userController.getAllUsers);
userRoute.get('/current-user', authmiddleware_1.authentication, userController.getCurrentUser);
userRoute.get('/suggested', authmiddleware_1.authentication, userController.getSuggestedUsers);
userRoute.put('/update', authmiddleware_1.authentication, uploadfile_1.uploadMultiple, userController.updateUser);
userRoute.delete('/delete/:id', authmiddleware_1.authentication, userController.deleteUser);
userRoute.post('/toggle-follow', authmiddleware_1.authentication, userController.toggleFollow);
userRoute.get('/:username', authmiddleware_1.authentication, userController.getUserByUsername);
userRoute.post('/search', authmiddleware_1.authentication, userController.searchUser);
userRoute.get('/following/:id', authmiddleware_1.authentication, userController.getFollowing);
userRoute.get('/followers/:id', authmiddleware_1.authentication, userController.getFollowers);
userRoute.get('/:id/checkfollow', authmiddleware_1.authentication, userController.checkFollow);
exports.default = userRoute;
