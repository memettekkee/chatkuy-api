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
exports.getMessageCtrl = exports.sendMessageCtrl = void 0;
const messageModel_1 = require("../model/messageModel");
const sendMessageCtrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { conversationId } = req.params;
        const { content } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!content || content.trim() === '') {
            res.status(400).json({
                error: true,
                message: "Message cannot be empty !"
            });
            return;
        }
        const isParticipant = yield (0, messageModel_1.isUserInConversation)(userId, conversationId);
        if (!isParticipant) {
            res.status(403).json({
                error: true,
                message: "You don't have access to this conversation !"
            });
            return;
        }
        const message = yield (0, messageModel_1.createMessage)(conversationId, userId, content);
        res.status(201).json({
            error: false,
            message: "Message sent successfully !",
            data: message
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
exports.sendMessageCtrl = sendMessageCtrl;
const getMessageCtrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { conversationId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const isParticipant = yield (0, messageModel_1.isUserInConversation)(userId, conversationId);
        if (!isParticipant) {
            res.status(403).json({
                error: true,
                message: "You don't have access to this conversation !"
            });
            return;
        }
        const messages = yield (0, messageModel_1.getMessages)(conversationId);
        res.status(200).json({
            error: false,
            message: "All message retrieved !",
            allMsg: messages
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
exports.getMessageCtrl = getMessageCtrl;
//# sourceMappingURL=messageController.js.map