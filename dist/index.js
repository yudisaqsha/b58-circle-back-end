"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const index_route_1 = __importDefault(require("../src/routes/v1/index.route"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use(body_parser_1.default.json()); // for JSON data
app.use(body_parser_1.default.urlencoded({ extended: true })); // for URL-encoded data
app.use((0, cors_1.default)());
dotenv_1.default.config();
const PORT = process.env.PORT;
app.use(express_1.default.json());
app.get('/', (request, response) => {
    response.status(200).send('Hello World');
});
app.use('/api', index_route_1.default);
app
    .listen(PORT, () => {
    console.log('Server running at PORT:', PORT);
})
    .on('error', (error) => {
    throw new Error(error.message);
});
