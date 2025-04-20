import express from 'express'
const router = express.Router();
import upload from '../middleware/multer';

import verifyToken from '../middleware/auth';

import { 
    createPersonalConversationCtrl, 
    getConversationByIdCtrl, 
    getUserConversationsCtrl
} from '../controller/conversationController';

import { 
    sendMessageCtrl,
    getMessageCtrl
} from '../controller/messageController';

router.post('/conversations', verifyToken, upload.none(), createPersonalConversationCtrl) // membuat chat baru 1 on 1
router.get('/conversations', verifyToken, getUserConversationsCtrl) // semua chat berdasarkan yang login
router.get('/conversations/:id', verifyToken, getConversationByIdCtrl) // detail chatnya

router.post('/conversations/:conversationId/messages', verifyToken, upload.none(), sendMessageCtrl) // Mengirim pesan berdasarkan conversationId
router.get('/conversations/:conversationId/messages', verifyToken, getMessageCtrl) // Mengambil semua pesan berdasarkan conversationId

export default router