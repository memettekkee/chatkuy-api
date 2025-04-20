import prisma from '../database/prisma'

export const isUserInConversation = async (userId: string, conversationId: string) => {
    const participant = await prisma.participant.findFirst({
        where: {
            userId: userId,
            conversationId: conversationId
        }
    });

    return participant;
};

export const createMessage = async (conversationId: string, userId: string, content: string) => {
    await prisma.conversation.update({
        where: {
            id: conversationId
        },
        data: {
            updatedAt: new Date()
        }
    });
    
    const message = await prisma.message.create({
        data: {
            content,
            userId,
            conversationId
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    avatar: true
                }
            }
        }
    });

    return message;
};

export const getMessages = async (conversationId: string) => {
    const messages = await prisma.message.findMany({
        where: {
            conversationId: conversationId
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    avatar: true
                }
            }
        },
        orderBy: {
            createdAt: 'asc'
        }
    });

    return messages;
};