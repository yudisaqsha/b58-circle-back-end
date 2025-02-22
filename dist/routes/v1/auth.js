"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../../controllers/authController");
// import { upload } from '../middleware/uploadfile';
const authRoute = express_1.default.Router();
authRoute.post('/register', authController_1.register);
authRoute.post('/login', authController_1.login);
exports.default = authRoute;
