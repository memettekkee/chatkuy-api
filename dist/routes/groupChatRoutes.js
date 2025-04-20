"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../middleware/auth"));
const multer_1 = __importDefault(require("../middleware/multer"));
const groupConversationController_1 = require("../controller/groupConversationController");
const participantController_1 = require("../controller/participantController");
const router = express_1.default.Router();
router.post('/groups', auth_1.default, multer_1.default.none(), groupConversationController_1.createGroupConversationCtrl); // Bikin grup baru
router.put('/conversations/:id', auth_1.default, multer_1.default.none(), groupConversationController_1.updateConversationCtrl); // edit info grup
router.delete('/conversations/:id', auth_1.default, groupConversationController_1.deleteConversationCtrl); // hapus grup, hanya yg buat grup yg bisa
router.post('/conversations/:conversationId/participants', auth_1.default, multer_1.default.none(), participantController_1.addParticipantCtrl); // Tambah orang ke group (hanya admin)
router.get('/conversations/:conversationId/participants', auth_1.default, participantController_1.getParticipantsCtrl); // Melihat siapa saja yg ada di grup
router.put('/conversations/:conversationId/participants/:participantId/role', auth_1.default, multer_1.default.none(), participantController_1.updateParticipantRoleCtrl); // Membuat anggota lain jadi admin (hanya admin)
router.delete('/conversations/:conversationId/participants/:participantId', auth_1.default, participantController_1.removeParticipantCtrl); // kick anggota dari grup
router.post('/conversations/:conversationId/leave', auth_1.default, participantController_1.leaveConversationCtrl); // keluar dari grup
exports.default = router;
//# sourceMappingURL=groupChatRoutes.js.map