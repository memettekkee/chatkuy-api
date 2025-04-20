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
exports.getMessages = exports.createMessage = exports.isUserInConversation = void 0;
const prisma_1 = __importDefault(require("../database/prisma"));
const isUserInConversation = (userId, conversationId) => __awaiter(void 0, void 0, void 0, function* () {
    const participant = yield prisma_1.default.participant.findFirst({
        where: {
            userId: userId,
            conversationId: conversationId
        }
    });
    return participant;
});
exports.isUserInConversation = isUserInConversation;
const createMessage = (conversationId, userId, content) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.conversation.update({
        where: {
            id: conversationId
        },
        data: {
            updatedAt: new Date()
        }
    });
    const message = yield prisma_1.default.message.create({
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
});
exports.createMessage = createMessage;
const getMessages = (conversationId) => __awaiter(void 0, void 0, void 0, function* () {
    const messages = yield prisma_1.default.message.findMany({
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
});
exports.getMessages = getMessages;
//# sourceMappingURL=messageModel.js.map