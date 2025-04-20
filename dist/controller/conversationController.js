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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConversationByIdCtrl = exports.getUserConversationsCtrl = exports.createPersonalConversationCtrl = void 0;
const conversationModel_1 = require("../model/conversationModel");
const userModel_1 = require("../model/userModel");
const createPersonalConversationCtrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { receiverId } = req.body;
        const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!receiverId) {
            res.status(400).json({
                error: true,
                message: "Please input receiver ID !"
            });
            return;
        }
        const receiver = yield (0, userModel_1.userById)(receiverId);
        if (!receiver) {
            res.status(404).json({
                error: true,
                message: "Receiver ID didn't exist !"
            });
            return;
        }
        if (currentUserId === receiverId) {
            res.status(400).json({
                error: true,
                message: "Can't start new chat with same person !"
            });
            return;
        }
        const existingConversation = yield (0, conversationModel_1.findExistingPersonalConversation)(currentUserId, receiverId);
        if (existingConversation) {
            res.status(200).json({
                error: false,
                message: "Conversation exist !",
                conversation: existingConversation
            });
            return;
        }
        const newConversation = yield (0, conversationModel_1.createPersonalConversation)(currentUserId, receiverId);
        res.status(201).json({
            error: false,
            message: "New conversation added !",
            conversation: newConversation
        });
        return;
    }
    catch (e) {
        res.status(500).json({
            error: true,
            message: e.message || "Server error"
        });
        return;
    }
});
exports.createPersonalConversationCtrl = createPersonalConversationCtrl;
const getUserConversationsCtrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const conversations = yield (0, conversationModel_1.getUserConversations)(userId);
        const processedConversations = conversations.map(conv => {
            if (!conv.isGroup) {
                const otherParticipant = conv.participants.find(p => p.userId !== userId);
                return Object.assign(Object.assign({}, conv), { name: (otherParticipant === null || otherParticipant === void 0 ? void 0 : otherParticipant.user.name) || "Unknown", otherUser: (otherParticipant === null || otherParticipant === void 0 ? void 0 : otherParticipant.user) || null, lastMessage: conv.messages[0] || null });
            }
            return Object.assign(Object.assign({}, conv), { lastMessage: conv.messages[0] || null });
        });
        res.status(200).json({
            error: false,
            message: "Success getting all conversation with !",
            conversations: processedConversations
        });
        return;
    }
    catch (e) {
        res.status(500).json({
            error: true,
            message: e.message || "Server error"
        });
        return;
    }
});
exports.getUserConversationsCtrl = getUserConversationsCtrl;
const getConversationByIdCtrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const conversation = yield (0, conversationModel_1.getConversationById)(id, userId);
        if (!conversation) {
            res.status(404).json({
                error: true,
                message: "Conversation not found or you do not have access !"
            });
            return;
        }
        if (!conversation.isGroup) {
            const otherParticipant = conversation.participants.find(p => p.userId !== userId);
            res.status(200).json({
                error: false,
                message: "Conversation founded !",
                conversation: Object.assign(Object.assign({}, conversation), { otherUser: (otherParticipant === null || otherParticipant === void 0 ? void 0 : otherParticipant.user) || null })
            });
            return;
        }
        res.status(200).json({
            error: false,
            message: "Conversation founded !",
            conversation: conversation
        });
    }
    catch (e) {
        res.status(500).json({
            error: true,
            message: e.message || "Server error"
        });
        return;
    }
});
exports.getConversationByIdCtrl = getConversationByIdCtrl;
//# sourceMappingURL=conversationController.js.map