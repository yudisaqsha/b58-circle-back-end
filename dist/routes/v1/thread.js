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
const threadController = __importStar(require("../../controllers/threadController"));
const authmiddleware_1 = require("../../middlewares/authmiddleware");
const uploadfile_1 = __importDefault(require("../../middlewares/uploadfile"));
const threadRoute = express_1.default.Router();
threadRoute.get('/', authmiddleware_1.authentication, threadController.showThreads);
threadRoute.get('/profile/:username', authmiddleware_1.authentication, threadController.showThreadsbyUsername);
threadRoute.get('/:id', authmiddleware_1.authentication, threadController.showThreadsbyId);
threadRoute.post('/create', authmiddleware_1.authentication, uploadfile_1.default.single('image'), threadController.createThread);
threadRoute.put('/:id/edit', authmiddleware_1.authentication, uploadfile_1.default.single('image'), threadController.updateThread);
threadRoute.delete('/delete/:id', authmiddleware_1.authentication, threadController.deleteThread);
threadRoute.post('/:id/like', authmiddleware_1.authentication, threadController.likeThread);
threadRoute.get('/:id/comment', authmiddleware_1.authentication, threadController.showComments);
threadRoute.post('/:id/addcomment', authmiddleware_1.authentication, uploadfile_1.default.single('image'), threadController.addComment);
threadRoute.delete('/:threadId/comment/:commentId', authmiddleware_1.authentication, threadController.deleteComment);
threadRoute.put('/:threadId/comment/:commentId/update', uploadfile_1.default.single('image'), authmiddleware_1.authentication, threadController.updateComment);
threadRoute.get('/:threadId/comment/:commentId/', authmiddleware_1.authentication, threadController.showCommentsById);
exports.default = threadRoute;
