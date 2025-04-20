import prisma from '../database/prisma'

export const findExistingPersonalConversation = async (userId1: string, userId2: string) => {
    const conversation = await prisma.conversation.findFirst({
        where: {
            isGroup: false,
            AND: [
                {
                    participants: {
                        some: {
                            userId: userId1
                        }
                    }
                },
                {
                    participants: {
                        some: {
                            userId: userId2
                        }
                    }
                }
            ]
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
            },
            messages: {
                orderBy: {
                    createdAt: 'desc'
                },
                take: 1
            }
        }
    });

    return conversation;
};

export const createPersonalConversation = async (userId1: string, userId2: string) => {
    const conversation = await prisma.conversation.create({
        data: {
            isGroup: false,
            participants: {
                create: [
                    { userId: userId1 },
                    { userId: userId2 }
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

export const getUserConversations = async (userId: string) => {
    const conversations = await prisma.conversation.findMany({
        where: {
            participants: {
                some: {
                    userId: userId
                }
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
            },
            messages: {
                orderBy: {
                    createdAt: 'desc'
                },
                take: 1,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            }
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });

    return conversations;
};

export const getConversationById = async (conversationId: string, userId: string) => {
    // cek user ini ada di sesi chat ini gak
    const isParticipant = await prisma.participant.findFirst({
        where: {
            conversationId: conversationId,
            userId: userId
        }
    });

    if (!isParticipant) {
        return null; // klo bukan, null
    }

    const conversation = await prisma.conversation.findUnique({
        where: {
            id: conversationId
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

export const updatedConversation = async (conversationId: string) => {
    const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
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
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              user: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      });

      
    return conversation
}