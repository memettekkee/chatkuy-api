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
exports.leaveConversationCtrl = exports.removeParticipantCtrl = exports.updateParticipantRoleCtrl = exports.getParticipantsCtrl = exports.addParticipantCtrl = void 0;
const participantModel_1 = require("../model/participantModel");
const groupConversationModel_1 = require("../model/groupConversationModel");
const userModel_1 = require("../model/userModel");
const addParticipantCtrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { conversationId } = req.params;
        const { userId } = req.body;
        const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const groupCheck = yield (0, groupConversationModel_1.isGroup)(conversationId);
        if (!groupCheck) {
            res.status(400).json({
                error: true,
                message: "Conversation isn't a group !"
            });
            return;
        }
        const isAdmin = yield (0, groupConversationModel_1.isGroupAdmin)(currentUserId, conversationId);
        if (!isAdmin) {
            res.status(403).json({
                error: true,
                message: "Only admin can add members !"
            });
            return;
        }
        const userToAdd = yield (0, userModel_1.userById)(userId);
        if (!userToAdd) {
            res.status(404).json({
                error: true,
                message: "User not found !"
            });
            return;
        }
        const participant = yield (0, participantModel_1.addParticipantToGroup)(conversationId, userId);
        res.status(201).json({
            error: false,
            message: "Member successfully added to group !",
            participant: participant
        });
        return;
    }
    catch (e) {
        if (e.message === 'User is already a participant of this group !') {
            res.status(400).json({
                error: true,
                message: e.message
            });
            return;
        }
        res.status(500).json({
            error: true,
            message: e.message || "Server error"
        });
        return;
    }
});
exports.addParticipantCtrl = addParticipantCtrl;
const getParticipantsCtrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { conversationId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const groupCheck = yield (0, groupConversationModel_1.isGroup)(conversationId);
        if (!groupCheck) {
            res.status(400).json({
                error: true,
                message: "Conversation isn't a group !"
            });
            return;
        }
        const userParticipant = yield (0, participantModel_1.getParticipant)(userId, conversationId);
        if (!userParticipant) {
            res.status(403).json({
                error: true,
                message: "You are not a member of this group !"
            });
            return;
        }
        const participants = yield (0, participantModel_1.getGroupParticipants)(conversationId);
        res.status(200).json({
            error: false,
            message: "All Member in the group",
            participants
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
exports.getParticipantsCtrl = getParticipantsCtrl;
const updateParticipantRoleCtrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { conversationId, participantId } = req.params;
        const { role } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!role || (role !== 'ADMIN' && role !== 'MEMBER')) {
            res.status(400).json({
                error: true,
                message: "Role must be ADMIN or MEMBER !"
            });
            return;
        }
        const groupCheck = yield (0, groupConversationModel_1.isGroup)(conversationId);
        if (!groupCheck) {
            res.status(400).json({
                error: true,
                message: "Conversation isn't a group !"
            });
            return;
        }
        const isAdmin = yield (0, groupConversationModel_1.isGroupAdmin)(userId, conversationId);
        if (!isAdmin) {
            res.status(403).json({
                error: true,
                message: "Only admins can change member roles !"
            });
            return;
        }
        const participant = yield (0, participantModel_1.getParticipantById)(participantId, conversationId);
        if (!participant || participant.conversationId !== conversationId) {
            res.status(404).json({
                error: true,
                message: "Participant not found in this group !"
            });
            return;
        }
        const updatedParticipant = yield (0, participantModel_1.updateParticipantRole)(participantId, conversationId, role);
        res.status(200).json({
            error: false,
            message: "Member role successfully updated !",
            participant: updatedParticipant
        });
        return;
    }
    catch (e) {
        console.log(e.message);
        res.status(500).json({
            error: true,
            message: e.message || "Server error"
        });
        return;
    }
});
exports.updateParticipantRoleCtrl = updateParticipantRoleCtrl;
const removeParticipantCtrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { conversationId, participantId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const groupCheck = yield (0, groupConversationModel_1.isGroup)(conversationId);
        if (!groupCheck) {
            res.status(400).json({
                error: true,
                message: "Conversation isn't a group !"
            });
            return;
        }
        const isAdmin = yield (0, groupConversationModel_1.isGroupAdmin)(userId, conversationId);
        if (!isAdmin) {
            res.status(403).json({
                error: true,
                message: "Only admin can delete members !"
            });
            return;
        }
        const participant = yield (0, participantModel_1.getParticipantById)(participantId, conversationId);
        if (!participant || participant.conversationId !== conversationId) {
            res.status(404).json({
                error: true,
                message: "Participant not found in this group !"
            });
            return;
        }
        if (participant.role === 'ADMIN') {
            const admins = yield (0, participantModel_1.getGroupParticipants)(conversationId);
            const adminCount = admins.filter(p => p.role === 'ADMIN').length;
            if (adminCount <= 1) {
                res.status(400).json({
                    error: true,
                    message: "Cannot delete the last admin, assign admin role to another member first !"
                });
                return;
            }
        }
        yield (0, participantModel_1.removeParticipant)(participantId, conversationId);
        res.status(200).json({
            error: false,
            message: "Member successfully removed from group !"
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
exports.removeParticipantCtrl = removeParticipantCtrl;
const leaveConversationCtrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { conversationId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const groupCheck = yield (0, groupConversationModel_1.isGroup)(conversationId);
        if (!groupCheck) {
            res.status(400).json({
                error: true,
                message: "Conversation isn't a group !"
            });
            return;
        }
        const isAdmin = yield (0, groupConversationModel_1.isGroupAdmin)(userId, conversationId);
        if (isAdmin) {
            const admins = yield (0, participantModel_1.getGroupParticipants)(conversationId);
            const adminCount = admins.filter(p => p.role === 'ADMIN').length;
            if (adminCount <= 1) {
                const participants = yield (0, participantModel_1.getGroupParticipants)(conversationId);
                // klo user satu satunya yg ada di grup, maka dihapus grupnya
                if (participants.length <= 1) {
                    yield (0, participantModel_1.leaveGroup)(userId, conversationId);
                    res.status(200).json({
                        error: false,
                        message: "You have left the group and the group has been deleted because there are no more members !"
                    });
                    return;
                }
                res.status(400).json({
                    error: true,
                    message: "You are the last admin, assign admin roles to other members first !"
                });
                return;
            }
        }
        yield (0, participantModel_1.leaveGroup)(userId, conversationId);
        res.status(200).json({
            error: false,
            message: "You successfully left the group !"
        });
        return;
    }
    catch (e) {
        if (e.message === 'User is not a participant of this group !') {
            res.status(400).json({
                error: true,
                message: e.message
            });
            return;
        }
        res.status(500).json({
            error: true,
            message: e.message || "Server error"
        });
        return;
    }
});
exports.leaveConversationCtrl = leaveConversationCtrl;
//# sourceMappingURL=participantController.js.map