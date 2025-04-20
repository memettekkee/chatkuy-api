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
exports.deleteConversationCtrl = exports.updateConversationCtrl = exports.createGroupConversationCtrl = void 0;
const groupConversationModel_1 = require("../model/groupConversationModel");
const createGroupConversationCtrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!name || name.trim() === '') {
            res.status(400).json({
                error: true,
                message: "Group name required !"
            });
            return;
        }
        const conversation = yield (0, groupConversationModel_1.createGroupConversation)(name, userId);
        res.status(201).json({
            error: false,
            message: "Group created successfully !",
            conversation: conversation
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
exports.createGroupConversationCtrl = createGroupConversationCtrl;
const updateConversationCtrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { name, image } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const groupCheck = yield (0, groupConversationModel_1.isGroup)(id);
        if (!groupCheck) {
            res.status(400).json({
                error: true,
                message: "This conversation is not a group !"
            });
            return;
        }
        const isAdmin = yield (0, groupConversationModel_1.isGroupAdmin)(userId, id);
        if (!isAdmin) {
            res.status(403).json({
                error: true,
                message: "Only admin can change the group info !"
            });
            return;
        }
        if (!name || name.trim() === '') {
            res.status(400).json({
                error: true,
                message: "Group name required !"
            });
            return;
        }
        const conversation = yield (0, groupConversationModel_1.updateGroupConversation)(id, name, image);
        res.status(200).json({
            error: false,
            message: "Group successfully updated !",
            conversation
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
exports.updateConversationCtrl = updateConversationCtrl;
const deleteConversationCtrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const groupCheck = yield (0, groupConversationModel_1.isGroup)(id);
        if (!groupCheck) {
            res.status(400).json({
                error: true,
                message: "This conversation is not a group !"
            });
            return;
        }
        const isAdmin = yield (0, groupConversationModel_1.isGroupAdmin)(userId, id);
        if (!isAdmin) {
            res.status(403).json({
                error: true,
                message: "Only admin can delete the group !"
            });
            return;
        }
        yield (0, groupConversationModel_1.deleteGroupConversation)(id);
        res.status(200).json({
            error: false,
            message: "Group successfully deleted !"
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
exports.deleteConversationCtrl = deleteConversationCtrl;
//# sourceMappingURL=groupConversationController.js.map