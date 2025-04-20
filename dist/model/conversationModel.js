"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatedConversation = exports.getConversationById = exports.getUserConversations = exports.createPersonalConversation = exports.findExistingPersonalConversation = void 0;
const prisma_1 = __importDefault(require("../database/prisma"));
const findExistingPersonalConversation = (userId1, userId2) => __awaiter(void 0, void 0, void 0, function* () {
    const conversation = yield prisma_1.default.conversation.findFirst({
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
});
exports.findExistingPersonalConversation = findExistingPersonalConversation;
const createPersonalConversation = (userId1, userId2) => __awaiter(void 0, void 0, void 0, function* () {
    const conversation = yield prisma_1.default.conversation.create({
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
});
exports.createPersonalConversation = createPersonalConversation;
const getUserConversations = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const conversations = yield prisma_1.default.conversation.findMany({
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
});
exports.getUserConversations = getUserConversations;
const getConversationById = (conversationId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    // cek user ini ada di sesi chat ini gak
    const isParticipant = yield prisma_1.default.participant.findFirst({
        where: {
            conversationId: conversationId,
            userId: userId
        }
    });
    if (!isParticipant) {
        return null; // klo bukan, null
    }
    const conversation = yield prisma_1.default.conversation.findUnique({
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
});
exports.getConversationById = getConversationById;
const updatedConversation = (conversationId) => __awaiter(void 0, void 0, void 0, function* () {
    const conversation = yield prisma_1.default.conversation.findUnique({
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
    return conversation;
});
exports.updatedConversation = updatedConversation;
//# sourceMappingURL=conversationModel.js.map