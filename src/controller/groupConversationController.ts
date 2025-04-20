import express from 'express'

import { 
    createGroupConversation,
    isGroup,
    isGroupAdmin,
    updateGroupConversation,
    deleteGroupConversation 
} from '../model/groupConversationModel';

export const createGroupConversationCtrl = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const { name } = req.body;
        const userId = req.user?.id;
        
        if (!name || name.trim() === '') {
            res.status(400).json({
                error: true,
                message: "Group name required !"
            });
            return
        }

        const conversation = await createGroupConversation(name, userId as string)

        res.status(201).json({
            error: false,
            message: "Group created successfully !",
            conversation: conversation
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

export const updateConversationCtrl = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const { id } = req.params;
        const { name, image } = req.body;
        const userId = req.user?.id;
        
        const groupCheck = await isGroup(id);
        if (!groupCheck) {
            res.status(400).json({
                error: true,
                message: "This conversation is not a group !"
            });
            return
        }

        const isAdmin = await isGroupAdmin(userId as string, id);
        if (!isAdmin) {
            res.status(403).json({
                error: true,
                message: "Only admin can change the group info !"
            });
            return
        }

        if (!name || name.trim() === '') {
            res.status(400).json({
                error: true,
                message: "Group name required !"
            });
            return
        }

        const conversation = await updateGroupConversation(id, name, image);

        res.status(200).json({
            error: false,
            message: "Group successfully updated !",
            conversation
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

export const deleteConversationCtrl = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        
        const groupCheck = await isGroup(id);
        if (!groupCheck) {
            res.status(400).json({
                error: true,
                message: "This conversation is not a group !"
            });
            return
        }

        const isAdmin = await isGroupAdmin(userId as string, id);
        if (!isAdmin) {
            res.status(403).json({
                error: true,
                message: "Only admin can delete the group !"
            });
            return
        }

        await deleteGroupConversation(id);

        res.status(200).json({
            error: false,
            message: "Group successfully deleted !"
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