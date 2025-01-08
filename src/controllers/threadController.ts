import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import cloudinary from '../services/cloudinary';
import Server from 'socket.io';
const prisma = new PrismaClient();

export async function showThreads(req: Request, res: Response) {
  const userId = (req as any).user.id;
  try {
    const allThreads = await prisma.thread.findMany({
      where: {
        isDeleted: 0,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        content: true,
        image_url: true,
        image: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        _count: {
          select: { likes: true, comments: { where: { isDeleted: 0 } } },
        },

        likes: userId
          ? {
              where: {
                userId: userId,
              },
              select: {
                id: true,
              },
            }
          : false,
      },
    });

    const threadsWithLikeStatus = allThreads.map((thread) => ({
      ...thread,
      userHasLiked: userId ? thread.likes.length > 0 : false,
    }));

    const sanitizedThreads = threadsWithLikeStatus.map(
      ({ likes, ...rest }) => rest,
    );

    return res.json({
      message: 'Get all threads successful',
      threads: sanitizedThreads,
    });
  } catch (error) {
    console.error('Error fetching threads:', error);
    return res.status(500).json({ message: 'Error fetching threads' });
  }
}
export async function showThreadsbyId(req: Request, res: Response) {
  const { id } = req.params;

  const userId = (req as any).user.id;
  try {
    const thread = await prisma.thread.findUnique({
      where: {
        isDeleted: 0,
        id: Number(id),
      },

      select: {
        id: true,
        content: true,
        image_url: true,
        image: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        _count: {
          select: { likes: true, comments: { where: { isDeleted: 0 } } },
        },

        likes: userId
          ? {
              where: {
                userId: userId,
              },
              select: {
                id: true,
              },
            }
          : false,
      },
    });

    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    const threadWithLikeStatus = {
      ...thread,
      userHasLiked: userId ? thread.likes.length > 0 : false,
    };

    const { likes, ...sanitizedThread } = threadWithLikeStatus;

    return res.json({
      message: 'Get thread successful',
      thread: sanitizedThread,
    });
  } catch (error) {
    console.error('Error fetching thread:', error);
    return res.status(500).json({ message: 'Error fetching thread' });
  }
}
export async function showThreadsbyUsername(req: Request, res: Response) {
  const { username } = req.params;
  const userId = (req as any).user.id;
  try {
    const allThreads = await prisma.thread.findMany({
      where: {
        isDeleted: 0,
        author: { username: username },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        content: true,
        image_url: true,
        image: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        _count: {
          select: { likes: true, comments: { where: { isDeleted: 0 } } },
        },

        likes: userId
          ? {
              where: {
                userId: userId,
              },
              select: {
                id: true,
              },
            }
          : false,
      },
    });

    const threadsWithLikeStatus = allThreads.map((thread) => ({
      ...thread,
      userHasLiked: userId ? thread.likes.length > 0 : false,
    }));

    const sanitizedThreads = threadsWithLikeStatus.map(
      ({ likes, ...rest }) => rest,
    );

    return res.json({
      message: 'Get all threads successful',
      threads: sanitizedThreads,
    });
  } catch (error) {
    console.error('Error fetching threads:', error);
    return res.status(500).json({ message: 'Error fetching threads' });
  }
}
export async function createThread(req: Request, res: Response) {
  const { content } = req.body;
  const authorId = (req as any).user.id;
  if (!content || !authorId) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  let imagePath: string | null = null;

  if (req.file) {
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'thread',
      });

      imagePath = result.secure_url;
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      return res.status(500).json({ message: 'Error uploading image', error });
    }
  }
  let data = {
    content,
    authorId: parseInt(authorId),
    image: imagePath,
  };
  console.log(data);
  try {
    const newThread = await prisma.thread.create({
      data,
    });

    res
      .status(201)
      .json({ message: 'Thread created successfully', thread: newThread });
  } catch (error) {
    res.status(500).json({ message: 'Error creating thread', error });
  }
}

export async function deleteThread(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const checkThreads = await prisma.thread.findUnique({
      where: { id: Number(id) },
    });
    if (!checkThreads) {
      return res.status(404).json({ message: 'Post not Found' });
    }
    if (checkThreads.authorId !== (req as any).user.id) {
      return res
        .status(401)
        .json({ message: 'User not granted to delete this thread' });
    }
    if (checkThreads.isDeleted === 1) {
      return res.status(400).json({ message: 'Thread is already deleted' });
    }
    await prisma.thread.update({
      where: {
        id: Number(id),
      },
      data: {
        isDeleted: 1,
      },
    });
    res.status(200).json({ message: 'Thread delete' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error delete threads', error });
  }
}
export async function updateThread(req: Request, res: Response) {
  const { id } = req.params;
  const { content } = req.body;
  const authorId = (req as any).user.id;
  const loggedInUserId = (req as any).user.id;
  let imagePath: string | null = null;

  if (req.file) {
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'thread',
      });

      imagePath = result.secure_url;
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      return res.status(500).json({ message: 'Error uploading image', error });
    }
  }
  let data = {
    content,
    authorId: parseInt(authorId),
    image: imagePath,
  };
  if (!content) {
    return res
      .status(400)
      .json({ message: 'Content is required to update the thread' });
  }

  try {
    const existingThread = await prisma.thread.findUnique({
      where: { id: Number(id) },
    });

    if (!existingThread) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    if (existingThread.authorId !== loggedInUserId) {
      return res
        .status(401)
        .json({ message: 'User not authorized to update this thread' });
    }

    if (existingThread.isDeleted === 1) {
      return res
        .status(400)
        .json({ message: 'Thread is already deleted and cannot be updated' });
    }

    const updatedThread = await prisma.thread.update({
      where: { id: Number(id) },
      data: data,
    });

    res
      .status(200)
      .json({ message: 'Thread updated successfully', thread: updatedThread });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating thread', error });
  }
}
export async function likeThread(req: Request, res: Response) {
  const { id } = req.params;
  const loggedInUserId = (req as any).user.id;

  try {
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_threadId: {
          userId: loggedInUserId,
          threadId: Number(id),
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          userId_threadId: {
            userId: loggedInUserId,
            threadId: Number(id),
          },
        },
      });
      return res.status(200).json({ message: 'Thread unliked successfully' });
    } else {
      await prisma.like.create({
        data: {
          userId: loggedInUserId,
          threadId: Number(id),
        },
      });
      return res.status(200).json({ message: 'Thread liked successfully' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error toggling like on thread', error });
  }
}
export async function addComment(req: Request, res: Response) {
  const { id } = req.params;
  const { content } = req.body;
  const authorId = (req as any).user.id;

  let imagePath: string | null = null;

  if (req.file) {
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'thread',
      });

      imagePath = result.secure_url;
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      return res.status(500).json({ message: 'Error uploading image', error });
    }
  }
  if (!content || !id) {
    return res
      .status(400)
      .json({ message: 'Content and thread ID are required' });
  }

  try {
    const existingThread = await prisma.thread.findUnique({
      where: { id: Number(id) },
    });

    if (!existingThread || existingThread.isDeleted === 1) {
      return res
        .status(404)
        .json({ message: 'Thread not found or is deleted' });
    }

    const newComment = await prisma.comment.create({
      data: {
        content,
        threadId: Number(id),
        authorId,
        image: imagePath,
      },
    });

    res
      .status(201)
      .json({ message: 'Comment added successfully', comment: newComment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding comment', error });
  }
}

export async function deleteComment(req: Request, res: Response) {
  const { commentId, threadId } = req.params;
  const loggedInUserId = (req as any).user.id;

  try {
    const thread = await prisma.thread.findUnique({
      where: { id: Number(threadId) },
    });

    if (!thread || thread.isDeleted === 1) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: Number(commentId) },
      include: { thread: true },
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.threadId !== Number(threadId)) {
      return res
        .status(400)
        .json({ message: 'Comment does not belong to the specified thread' });
    }

    if (
      comment.authorId !== loggedInUserId &&
      thread.authorId !== loggedInUserId
    ) {
      return res
        .status(401)
        .json({ message: 'User not authorized to delete this comment' });
    }

    if (comment.isDeleted === 1) {
      return res.status(400).json({ message: 'Comment is already deleted' });
    }

    await prisma.comment.update({
      where: { id: Number(commentId) },
      data: { isDeleted: 1 },
    });

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting comment', error });
  }
}
export async function showComments(req: Request, res: Response) {
  const { id } = req.params;
  const allComment = await prisma.comment.findMany({
    where: {
      isDeleted: 0,
      threadId: Number(id),
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      content: true,

      image: true,
      createdAt: true,
      author: {
        select: {
          id: true,
          username: true,
          fullName: true,
          avatar: true,
        },
      },
    },
  });
  res.json({ message: 'get all comment successful', comment: allComment });
}
export async function updateComment(req: Request, res: Response) {
  const { threadId, commentId } = req.params;
  const { content } = req.body;
  const authorId = (req as any).user.id;
  const loggedInUserId = (req as any).user.id;
  let imagePath: string | null = null;

  if (req.file) {
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'thread',
      });

      imagePath = result.secure_url;
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      return res.status(500).json({ message: 'Error uploading image', error });
    }
  }

  let data = {
    content,
    authorId: parseInt(authorId),
    image: imagePath,
  };

  if (!content) {
    return res
      .status(400)
      .json({ message: 'Content is required to update the comment' });
  }

  try {
    const existingComment = await prisma.comment.findFirst({
      where: {
        id: Number(commentId),
        threadId: Number(threadId),
      },
    });

    if (!existingComment) {
      return res
        .status(404)
        .json({ message: 'Comment not found in this thread' });
    }

    if (existingComment.authorId !== loggedInUserId) {
      return res
        .status(401)
        .json({ message: 'User not authorized to update this comment' });
    }

    if (existingComment.isDeleted === 1) {
      return res
        .status(400)
        .json({ message: 'Comment is already deleted and cannot be updated' });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: Number(commentId) },
      data: data,
    });

    res.status(200).json({
      message: 'Comment updated successfully',
      comment: updatedComment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating comment', error });
  }
}
export async function showCommentsById(req: Request, res: Response) {
  const { threadId, commentId } = req.params;

  const comment = await prisma.comment.findFirst({
    where: {
      isDeleted: 0,
      threadId: Number(threadId),
      id: Number(commentId),
    },
    select: {
      id: true,
      content: true,
      image: true,
      createdAt: true,
      author: {
        select: {
          id: true,
          username: true,
          fullName: true,
          avatar: true,
        },
      },
    },
  });

  if (!comment) {
    return res.status(404).json({ message: 'Comment not found' });
  }

  res.json({ message: 'Get comment successful', comment });
}
