import prisma from '../database/prisma'

export const createGroupConversation = async (name: string, creatorId: string) => {
    const conversation = await prisma.conversation.create({
        data: {
            name,
            isGroup: true,
            participants: {
                create: [
                    { 
                        userId: creatorId,
                        role: 'ADMIN' // yg buat, otomatis jadi admin
                    }
                ]
            }
        },
        include: {
            participants: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true
                        }
                    }
                }
            }
        }
    });

    return conversation;
};

export const isGroup = async (conversationId: string) => {
    const conversation = await prisma.conversation.findUnique({
        where: {
            id: conversationId
        },
        select: {
            isGroup: true,
            name: true
        }
    });

    return conversation || { isGroup: false, name: null };
};

export const isGroupAdmin = async (userId: string, conversationId: string) => {
    const participant = await prisma.participant.findFirst({
        where: {
            userId: userId,
            conversationId: conversationId,
            role: 'ADMIN'
        }
    });

    return !!participant;
};

export const updateGroupConversation = async (conversationId: string, name: string, image: string) => {
    const conversation = await prisma.conversation.update({
        where: {
            id: conversationId
        },
        data: {
            name, 
            image
        },
        include: {
            participants: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true
                        }
                    }
                }
            }
        }
    });

    return conversation;
};

export const deleteGroupConversation = async (conversationId: string) => {
    await prisma.conversation.delete({
        where: {
            id: conversationId
        }
    });

    return true;
};