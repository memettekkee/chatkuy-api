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
exports.leaveGroup = exports.removeParticipant = exports.updateParticipantRole = exports.getParticipantById = exports.getGroupParticipants = exports.getParticipant = exports.addParticipantToGroup = void 0;
const prisma_1 = __importDefault(require("../database/prisma"));
const addParticipantToGroup = (conversationId_1, userId_1, ...args_1) => __awaiter(void 0, [conversationId_1, userId_1, ...args_1], void 0, function* (conversationId, userId, role = 'MEMBER') {
    const existingParticipant = yield prisma_1.default.participant.findFirst({
        where: {
            conversationId,
            userId
        }
    });
    if (existingParticipant) {
        throw new Error('User is already a participant of this group !');
    }
    const participant = yield prisma_1.default.participant.create({
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
});
exports.addParticipantToGroup = addParticipantToGroup;
const getParticipant = (userId, conversationId) => __awaiter(void 0, void 0, void 0, function* () {
    const participant = yield prisma_1.default.participant.findFirst({
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
});
exports.getParticipant = getParticipant;
const getGroupParticipants = (conversationId) => __awaiter(void 0, void 0, void 0, function* () {
    const participants = yield prisma_1.default.participant.findMany({
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
});
exports.getGroupParticipants = getGroupParticipants;
const getParticipantById = (participantId, conversationId) => __awaiter(void 0, void 0, void 0, function* () {
    const participant = yield prisma_1.default.participant.findUnique({
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
});
exports.getParticipantById = getParticipantById;
const updateParticipantRole = (participantId, conversationId, role) => __awaiter(void 0, void 0, void 0, function* () {
    const participant = yield prisma_1.default.participant.update({
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
});
exports.updateParticipantRole = updateParticipantRole;
const removeParticipant = (participantId, conversationId) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.participant.delete({
        where: {
            userId_conversationId: {
                userId: participantId,
                conversationId: conversationId
            }
        }
    });
    return true;
});
exports.removeParticipant = removeParticipant;
const leaveGroup = (userId, conversationId) => __awaiter(void 0, void 0, void 0, function* () {
    const participant = yield prisma_1.default.participant.findFirst({
        where: {
            userId,
            conversationId
        }
    });
    if (!participant) {
        throw new Error('User is not a participant of this group !');
    }
    yield prisma_1.default.participant.delete({
        where: {
            id: participant.id
        }
    });
    const admins = yield prisma_1.default.participant.findMany({
        where: {
            conversationId,
            role: 'ADMIN'
        }
    });
    // klo gaada admin lainnya di grup, salah satu anggota otomatis jadi admin
    if (admins.length === 0) {
        const participants = yield prisma_1.default.participant.findMany({
            where: {
                conversationId
            },
            take: 1
        });
        if (participants.length > 0) {
            yield prisma_1.default.participant.update({
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
});
exports.leaveGroup = leaveGroup;
//# sourceMappingURL=participantModel.js.map