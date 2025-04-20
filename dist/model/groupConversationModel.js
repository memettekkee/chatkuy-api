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
exports.deleteGroupConversation = exports.updateGroupConversation = exports.isGroupAdmin = exports.isGroup = exports.createGroupConversation = void 0;
const prisma_1 = __importDefault(require("../database/prisma"));
const createGroupConversation = (name, creatorId) => __awaiter(void 0, void 0, void 0, function* () {
    const conversation = yield prisma_1.default.conversation.create({
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
});
exports.createGroupConversation = createGroupConversation;
const isGroup = (conversationId) => __awaiter(void 0, void 0, void 0, function* () {
    const conversation = yield prisma_1.default.conversation.findUnique({
        where: {
            id: conversationId
        },
        select: {
            isGroup: true,
            name: true
        }
    });
    return conversation || { isGroup: false, name: null };
});
exports.isGroup = isGroup;
const isGroupAdmin = (userId, conversationId) => __awaiter(void 0, void 0, void 0, function* () {
    const participant = yield prisma_1.default.participant.findFirst({
        where: {
            userId: userId,
            conversationId: conversationId,
            role: 'ADMIN'
        }
    });
    return !!participant;
});
exports.isGroupAdmin = isGroupAdmin;
const updateGroupConversation = (conversationId, name, image) => __awaiter(void 0, void 0, void 0, function* () {
    const conversation = yield prisma_1.default.conversation.update({
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
});
exports.updateGroupConversation = updateGroupConversation;
const deleteGroupConversation = (conversationId) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.conversation.delete({
        where: {
            id: conversationId
        }
    });
    return true;
});
exports.deleteGroupConversation = deleteGroupConversation;
//# sourceMappingURL=groupConversationModel.js.map