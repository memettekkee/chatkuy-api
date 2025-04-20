"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const multer_1 = __importDefault(require("../middleware/multer"));
const auth_1 = __importDefault(require("../middleware/auth"));
const conversationController_1 = require("../controller/conversationController");
const messageController_1 = require("../controller/messageController");
router.post('/conversations', auth_1.default, multer_1.default.none(), conversationController_1.createPersonalConversationCtrl); // membuat chat baru 1 on 1
router.get('/conversations', auth_1.default, conversationController_1.getUserConversationsCtrl); // semua chat berdasarkan yang login
router.get('/conversations/:id', auth_1.default, conversationController_1.getConversationByIdCtrl); // detail chatnya
router.post('/conversations/:conversationId/messages', auth_1.default, multer_1.default.none(), messageController_1.sendMessageCtrl); // Mengirim pesan berdasarkan conversationId
router.get('/conversations/:conversationId/messages', auth_1.default, messageController_1.getMessageCtrl); // Mengambil semua pesan berdasarkan conversationId
exports.default = router;
//# sourceMappingURL=chatRoutes.js.map