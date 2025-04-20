import express from 'express';
import verifyToken from '../middleware/auth';
import upload from '../middleware/multer';

import { 
    createGroupConversationCtrl,
    updateConversationCtrl,
    deleteConversationCtrl 
} from '../controller/groupConversationController';

import { 
    addParticipantCtrl,
    getParticipantsCtrl,
    updateParticipantRoleCtrl,
    removeParticipantCtrl,
    leaveConversationCtrl 
} from '../controller/participantController';

const router = express.Router()

router.post('/groups', verifyToken, upload.none(), createGroupConversationCtrl) // Bikin grup baru
router.put('/conversations/:id', verifyToken, upload.none(), updateConversationCtrl) // edit info grup
router.delete('/conversations/:id', verifyToken, deleteConversationCtrl) // hapus grup, hanya yg buat grup yg bisa

router.post('/conversations/:conversationId/participants', verifyToken, upload.none(), addParticipantCtrl); // Tambah orang ke group (hanya admin)
router.get('/conversations/:conversationId/participants', verifyToken, getParticipantsCtrl); // Melihat siapa saja yg ada di grup
router.put('/conversations/:conversationId/participants/:participantId/role', verifyToken, upload.none(), updateParticipantRoleCtrl); // Membuat anggota lain jadi admin (hanya admin)
router.delete('/conversations/:conversationId/participants/:participantId', verifyToken, removeParticipantCtrl); // kick anggota dari grup
router.post('/conversations/:conversationId/leave', verifyToken, leaveConversationCtrl); // keluar dari grup

export default router