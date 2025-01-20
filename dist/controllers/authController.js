"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET_KEY = process.env.SECRET_KEY || 'aksjdkl2aj3djaklfji32dj2dj9ld92jd92j';
const prisma = new client_1.PrismaClient();
const SALT_ROUNDS = 10;
async function register(req, res) {
    const { fullName, username, email, password } = req.body;
    if (!fullName || !email || !password) {
        console.log(fullName, username, email, password);
        return res.status(400).json({ message: 'All fields are required' });
    }
    try {
        const existingUser = await prisma.users.findFirst({
            where: {
                OR: [{ username }, { email }],
            },
        });
        if (existingUser) {
            return res
                .status(400)
                .json({ message: 'Username or email already exists' });
        }
        // hash password
        const hashedPassword = await bcrypt_1.default.hash(password, SALT_ROUNDS);
        const newUser = await prisma.users.create({
            data: {
                fullName,
                username,
                email,
                password: hashedPassword,
            },
        });
        res.status(201).json({ message: 'User registered', user: newUser });
    }
    catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
}
async function login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    try {
        const user = await prisma.users.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        // compare password
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (isMatch) {
            const token = jsonwebtoken_1.default.sign({
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
            }, SECRET_KEY, { expiresIn: '12h' });
            res.status(200).json({
                message: 'Login Successful',
                user: {
                    username: user.username,
                    email: user.email,
                },
                token,
            });
        }
        else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
}
