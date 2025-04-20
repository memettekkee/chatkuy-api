import { Role } from '@prisma/client';
import prisma from '../database/prisma'

export const addParticipantToGroup = async (conversationId: string, userId: string, role: Role = 'MEMBER') => {

    const existingParticipant = await prisma.participant.findFirst({
        where: {
            conversationId,
            userId
        }
    });

    if (existingParticipant) {
        throw new Error('User is already a participant of this group !');
    }

    const participant = await prisma.participant.create({
        data: {
            conversationId,
            userId,
            role
        },
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
    });

    return participant;
};

export const getParticipant = async (userId: string, conversationId: string) => {
    const participant = await prisma.participant.findFirst({
        where: {
            userId,
            conversationId
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true
                }
            },
            conversation: true
        }
    });

    return participant;
};

export const getGroupParticipants = async (conversationId: string) => {
    const participants = await prisma.participant.findMany({
        where: {
            conversationId
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true
                }
            }
        },
        orderBy: {
            role: 'asc'
        }
    });

    return participants;
};

export const getParticipantById = async (participantId: string, conversationId: string) => {
    const participant = await prisma.participant.findUnique({
        where: {
            userId_conversationId: {
                userId: participantId,
                conversationId: conversationId
            }
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true
                }
            },
            conversation: true
        }
    });

    return participant;
};

export const updateParticipantRole = async (participantId: string, conversationId: string, role: Role) => {
    const participant = await prisma.participant.update({
        where: {
            userId_conversationId: {
                userId: participantId,
                conversationId: conversationId
            }
        },
        data: {
            role
        },
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
    });

    return participant;
};

export const removeParticipant = async (participantId: string, conversationId: string) => {
    await prisma.participant.delete({
        where: {
            userId_conversationId: {
                userId: participantId,
                conversationId: conversationId
            }
        }
    });

    return true;
};

export const leaveGroup = async (userId: string, conversationId: string) => {
    const participant = await prisma.participant.findFirst({
        where: {
            userId,
            conversationId
        }
    });

    if (!participant) {
        throw new Error('User is not a participant of this group !');
    }

    await prisma.participant.delete({
        where: {
            id: participant.id
        }
    });

    const admins = await prisma.participant.findMany({
        where: {
            conversationId,
            role: 'ADMIN'
        }
    });

    // klo gaada admin lainnya di grup, salah satu anggota otomatis jadi admin
    if (admins.length === 0) {
        const participants = await prisma.participant.findMany({
            where: {
                conversationId
            },
            take: 1
        });

        if (participants.length > 0) {
            await prisma.participant.update({
                where: {
                    id: participants[0].id
                },
                data: {
                    role: 'ADMIN'
                }
            });
        }
    }

    return true;
};