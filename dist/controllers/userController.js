"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = getAllUsers;
exports.getSuggestedUsers = getSuggestedUsers;
exports.getUserByUsername = getUserByUsername;
exports.searchUser = searchUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.checkFollow = checkFollow;
exports.toggleFollow = toggleFollow;
exports.getCurrentUser = getCurrentUser;
exports.getFollowers = getFollowers;
exports.getFollowing = getFollowing;
const client_1 = require("@prisma/client");
const cloudinary_1 = __importDefault(require("../services/cloudinary"));
const SECRET_KEY = process.env.SECRET_KEY || 'aksjdkl2aj3djaklfji32dj2dj9ld92jd92j';
const prisma = new client_1.PrismaClient();
async function getAllUsers(req, res) {
    const { id } = req.user.id;
    const allUsers = await prisma.users.findMany({
        where: {
            isDeleted: 0,
        },
        select: {
            username: true,
            email: true,
            fullName: true,
            _count: {
                select: {
                    followers: true,
                    following: true,
                },
            },
        },
    });
    res.json({ message: 'get all users successful', users: allUsers });
}
async function getSuggestedUsers(req, res) {
    try {
        const userId = req.user.id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const notFollowedBack = await prisma.users.findMany({
            where: {
                following: {
                    some: {
                        followerId: Number(userId),
                    },
                },
                followers: {
                    none: {
                        followingId: Number(userId),
                    },
                },
                isDeleted: 0,
            },
            select: {
                id: true,
                username: true,
                fullName: true,
                avatar: true,
            },
        });
        const priorityId = notFollowedBack.map((user) => user.id);
        const mostFollowers = await prisma.users.findMany({
            where: {
                id: {
                    notIn: [...priorityId, Number(userId)],
                },
                isDeleted: 0,
                followers: {
                    none: {
                        followingId: Number(userId),
                    },
                },
            },
            select: {
                id: true,
                username: true,
                fullName: true,
                avatar: true,
            },
            orderBy: {
                followers: {
                    _count: 'desc',
                },
            },
        });
        const suggestions = [...notFollowedBack, ...mostFollowers];
        res.status(200).json({
            message: 'get all suggested successful',
            users: suggestions,
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error retrieving user',
            error,
        });
    }
}
async function getUserByUsername(req, res) {
    const { username } = req.params;
    try {
        const user = await prisma.users.findUnique({
            where: {
                username: username,
            },
            select: {
                id: true,
                username: true,
                email: true,
                fullName: true,
                bio: true,
                avatar: true,
                _count: {
                    select: {
                        followers: true,
                        following: true,
                    },
                },
            },
        });
        if (user) {
            res.json({ message: 'User found', user });
        }
        else {
            res.status(404).json({ message: 'User not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving user', error });
    }
}
async function searchUser(req, res) {
    const { username } = req.body;
    const id = req.user.id;
    try {
        const users = await prisma.users.findMany({
            where: {
                username: {
                    contains: username,
                    mode: 'insensitive',
                },
                id: { not: id },
            },
            select: {
                id: true,
                username: true,
                email: true,
                fullName: true,
                bio: true,
                avatar: true,
                _count: {
                    select: {
                        followers: true,
                        following: true,
                    },
                },
            },
        });
        if (users) {
            res.json({ message: 'User found', users });
        }
        else {
            res.status(404).json({ message: 'User not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving user', error });
    }
}
async function updateUser(req, res) {
    const id = req.user.id;
    const { username, fullName, bio } = req.body;
    try {
        const user = await prisma.users.findUnique({ where: { id: Number(id) } });
        if (!user || user.isDeleted === 1) {
            return res.status(404).json({ message: 'User not found or deleted' });
        }
        const updatedData = {};
        if (username) {
            const existingUser = await prisma.users.findFirst({
                where: {
                    username,
                    NOT: { id: Number(id) },
                },
            });
            if (existingUser) {
                return res.status(400).json({ message: 'Username is already taken' });
            }
            updatedData.username = username;
        }
        if (fullName)
            updatedData.fullName = fullName;
        if (bio)
            updatedData.bio = bio;
        if (req.files) {
            const files = req.files;
            if (files.avatar && files.avatar[0]) {
                try {
                    const result = await cloudinary_1.default.uploader.upload(files.avatar[0].path, {
                        folder: 'user-profiles',
                    });
                    updatedData.avatar = result.secure_url;
                }
                catch (error) {
                    console.error('Error uploading avatar:', error);
                    return res
                        .status(500)
                        .json({ message: 'Error uploading avatar', error });
                }
            }
            if (files.coverPic && files.coverPic[0]) {
                try {
                    const result = await cloudinary_1.default.uploader.upload(files.coverPic[0].path, {
                        folder: 'user-profiles',
                        transformation: [{ width: 1000, height: 400, crop: 'limit' }],
                    });
                    updatedData.coverPic = result.secure_url;
                }
                catch (error) {
                    console.error('Error uploading coverPic:', error);
                    return res
                        .status(500)
                        .json({ message: 'Error uploading coverPic', error });
                }
            }
        }
        if (Object.keys(updatedData).length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }
        const updatedUser = await prisma.users.update({
            where: { id: Number(id) },
            data: updatedData,
        });
        res.status(200).json({
            message: 'User updated successfully',
            user: {
                username: updatedUser.username,
                fullName: updatedUser.fullName,
                bio: updatedUser.bio,
                avatar: updatedUser.avatar,
                coverPic: updatedUser.coverPic,
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating user', error });
    }
}
async function deleteUser(req, res) {
    const { id } = req.body;
    try {
        const user = await prisma.users.findUnique({ where: { id: Number(id) } });
        if (!user || user.isDeleted === 1) {
            return res
                .status(404)
                .json({ message: 'user not found or already deleted' });
        }
        const deletedUser = await prisma.users.update({
            where: { id: Number(id) },
            data: { isDeleted: 1 },
        });
        res.status(200).json({
            message: 'User deleted successfully',
            user: { email: deletedUser.email, username: deletedUser.username },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting user', error });
    }
}
async function checkFollow(req, res) {
    const { userId } = req.query;
    const { id } = req.params;
    try {
        const existingFollow = await prisma.follow.findFirst({
            where: {
                followerId: Number(userId),
                followingId: Number(id),
            },
        });
        return res.status(200).json({
            isFollowing: !!existingFollow,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error checking follow status', error });
    }
}
async function toggleFollow(req, res) {
    const { userId } = req.body;
    const currentUserId = req.user.id;
    if (currentUserId === userId) {
        return res.status(400).json({ message: 'You cannot follow yourself' });
    }
    try {
        const userToToggle = await prisma.users.findUnique({
            where: { id: Number(userId) },
        });
        if (!userToToggle || userToToggle.isDeleted === 1) {
            return res.status(404).json({ message: 'User not found or deleted' });
        }
        const existingFollow = await prisma.follow.findFirst({
            where: {
                followerId: Number(userId),
                followingId: currentUserId,
            },
        });
        if (existingFollow) {
            await prisma.follow.delete({
                where: {
                    id: existingFollow.id,
                },
            });
            return res.status(200).json({ message: 'User unfollowed successfully' });
        }
        else {
            const newFollow = await prisma.follow.create({
                data: {
                    followerId: Number(userId),
                    followingId: currentUserId,
                },
            });
            return res.status(200).json({
                message: 'User followed successfully',
                follow: newFollow,
            });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error toggling follow', error });
    }
}
async function getCurrentUser(req, res) {
    const id = req.user.id;
    try {
        const user = await prisma.users.findUnique({
            where: {
                id: Number(id),
            },
            select: {
                id: true,
                username: true,
                email: true,
                fullName: true,
                avatar: true,
                coverPic: true,
                bio: true,
                followers: true,
                following: true,
                _count: {
                    select: {
                        followers: true,
                        following: true,
                    },
                },
            },
        });
        if (user) {
            res.json({ message: 'User found', user });
        }
        else {
            res.status(404).json({ message: 'User not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving user', error });
    }
}
async function getFollowers(req, res) {
    const { id } = req.params;
    try {
        const result = await prisma.follow.findMany({
            where: {
                followerId: Number(id),
            },
            include: {
                following: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        avatar: true,
                    },
                },
            },
        });
        res.status(200).json({
            message: 'Success get following',
            followers: result.map((f) => f.following),
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error Retrieving Following',
        });
    }
}
async function getFollowing(req, res) {
    const { id } = req.params;
    try {
        const result = await prisma.follow.findMany({
            where: {
                followingId: Number(id),
            },
            include: {
                follower: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        avatar: true,
                    },
                },
            },
        });
        res.status(200).json({
            message: 'Success get following',
            following: result.map((f) => f.follower),
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error Retrieving Followers',
        });
    }
}
