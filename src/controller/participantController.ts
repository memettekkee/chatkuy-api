import express from 'express';

import { 
    addParticipantToGroup,
    getParticipant,
    getGroupParticipants,
    getParticipantById,
    updateParticipantRole,
    removeParticipant,
    leaveGroup
} from '../model/participantModel';
import { isGroupAdmin, isGroup } from '../model/groupConversationModel';
import { userById } from '../model/userModel';

export const addParticipantCtrl = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const { conversationId } = req.params;
        const { userId } = req.body;
        const currentUserId = req.user?.id;

        const groupCheck = await isGroup(conversationId);
        if (!groupCheck) {
            res.status(400).json({
                error: true,
                message: "Conversation isn't a group !"
            });
            return
        }

        const isAdmin = await isGroupAdmin(currentUserId as string, conversationId);
        if (!isAdmin) {
            res.status(403).json({
                error: true,
                message: "Only admin can add members !"
            });
            return
        }

        const userToAdd = await userById(userId);
        if (!userToAdd) {
            res.status(404).json({
                error: true,
                message: "User not found !"
            });
            return
        }

        const participant = await addParticipantToGroup(conversationId, userId);

        res.status(201).json({
            error: false,
            message: "Member successfully added to group !",
            participant: participant
        });
        return
    } catch (e: any) {
        if (e.message === 'User is already a participant of this group !') {
            res.status(400).json({
                error: true,
                message: e.message
            });
            return
        }
        
        res.status(500).json({
            error: true,
            message: e.message || "Server error"
        });
        return
    }
}

export const getParticipantsCtrl = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user?.id;

        const groupCheck = await isGroup(conversationId);
        if (!groupCheck) {
            res.status(400).json({
                error: true,
                message: "Conversation isn't a group !"
            });
            return
        }

        const userParticipant = await getParticipant(userId as string, conversationId);
        if (!userParticipant) {
            res.status(403).json({
                error: true,
                message: "You are not a member of this group !"
            });
            return
        }

        const participants = await getGroupParticipants(conversationId);

        res.status(200).json({
            error: false,
            message: "All Member in the group",
            participants
        });
        return
    } catch (e: any) {
        res.status(500).json({
            error: true,
            message: e.message || "Server error"
        });
        return
    }
}

export const updateParticipantRoleCtrl = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const { conversationId, participantId } = req.params;
        const { role } = req.body;
        const userId = req.user?.id;

        if (!role || (role !== 'ADMIN' && role !== 'MEMBER')) {
            res.status(400).json({
                error: true,
                message: "Role must be ADMIN or MEMBER !"
            });
            return
        }

        const groupCheck = await isGroup(conversationId);
        if (!groupCheck) {
            res.status(400).json({
                error: true,
                message: "Conversation isn't a group !"
            });
            return
        }

        const isAdmin = await isGroupAdmin(userId as string, conversationId);
        if (!isAdmin) {
            res.status(403).json({
                error: true,
                message: "Only admins can change member roles !"
            });
            return
        }

        const participant = await getParticipantById(participantId, conversationId);
        if (!participant || participant.conversationId !== conversationId) {
            res.status(404).json({
                error: true,
                message: "Participant not found in this group !"
            });
            return
        }

        const updatedParticipant = await updateParticipantRole(participantId, conversationId, role as 'ADMIN' | 'MEMBER');

        res.status(200).json({
            error: false,
            message: "Member role successfully updated !",
            participant: updatedParticipant
        });
        return
    } catch (e: any) {
        console.log(e.message)
        res.status(500).json({
            error: true,
            message: e.message || "Server error"
        });
        return
    }
}

export const removeParticipantCtrl = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const { conversationId, participantId } = req.params;
        const userId = req.user?.id;

        const groupCheck = await isGroup(conversationId);
        if (!groupCheck) {
            res.status(400).json({
                error: true,
                message: "Conversation isn't a group !"
            });
            return
        }

        const isAdmin = await isGroupAdmin(userId as string, conversationId);
        if (!isAdmin) {
            res.status(403).json({
                error: true,
                message: "Only admin can delete members !"
            });
            return
        }

        const participant = await getParticipantById(participantId, conversationId);
        if (!participant || participant.conversationId !== conversationId) {
            res.status(404).json({
                error: true,
                message: "Participant not found in this group !"
            });
            return
        }

        if (participant.role === 'ADMIN') {
            const admins = await getGroupParticipants(conversationId);
            const adminCount = admins.filter(p => p.role === 'ADMIN').length;
            
            if (adminCount <= 1) {
                res.status(400).json({
                    error: true,
                    message: "Cannot delete the last admin, assign admin role to another member first !"
                });
                return
            }
        }

        await removeParticipant(participantId, conversationId);

        res.status(200).json({
            error: false,
            message: "Member successfully removed from group !"
        });
        return
    } catch (e: any) {
        res.status(500).json({
            error: true,
            message: e.message || "Server error"
        });
        return
    }
};

export const leaveConversationCtrl = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user?.id;

        const groupCheck = await isGroup(conversationId);
        if (!groupCheck) {
            res.status(400).json({
                error: true,
                message: "Conversation isn't a group !"
            });
            return
        }

        const isAdmin = await isGroupAdmin(userId as string, conversationId);
        if (isAdmin) {
            const admins = await getGroupParticipants(conversationId);
            const adminCount = admins.filter(p => p.role === 'ADMIN').length;
            
            if (adminCount <= 1) {
                const participants = await getGroupParticipants(conversationId);
                
                // klo user satu satunya yg ada di grup, maka dihapus grupnya
                if (participants.length <= 1) {
                    await leaveGroup(userId as string, conversationId);
                    res.status(200).json({
                        error: false,
                        message: "You have left the group and the group has been deleted because there are no more members !"
                    });
                    return
                }
                
                res.status(400).json({
                    error: true,
                    message: "You are the last admin, assign admin roles to other members first !"
                });
                return
            }
        }

        await leaveGroup(userId as string, conversationId);

        res.status(200).json({
            error: false,
            message: "You successfully left the group !"
        });
        return
    } catch (e: any) {
        if (e.message === 'User is not a participant of this group !') {
            res.status(400).json({
                error: true,
                message: e.message
            });
            return
        }
        
        res.status(500).json({
            error: true,
            message: e.message || "Server error"
        });
        return
    }
};



