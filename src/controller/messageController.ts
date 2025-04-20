import express from 'express';

import { 
    createMessage,
    getMessages,
    isUserInConversation 
} from '../model/messageModel';

export const sendMessageCtrl = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const { conversationId } = req.params
        const { content } = req.body
        const userId = req.user?.id;

        if (!content || content.trim() === '') {
            res.status(400).json({
                error: true,
                message: "Message cannot be empty !"
            });
            return
        }

        const isParticipant = await isUserInConversation(userId as string, conversationId)
        if (!isParticipant) {
            res.status(403).json({
                error: true,
                message: "You don't have access to this conversation !"
            });
            return
        }

        const message = await createMessage(conversationId, userId as string, content)
        res.status(201).json({
            error: false,
            message: "Message sent successfully !",
            data: message
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

export const getMessageCtrl = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const { conversationId } = req.params
        const userId = req.user?.id;

        const isParticipant = await isUserInConversation(userId as string, conversationId)
        if (!isParticipant) {
            res.status(403).json({
                error: true,
                message: "You don't have access to this conversation !"
            });
            return
        }

        const messages = await getMessages(conversationId);

        res.status(200).json({
            error: false,
            message: "All message retrieved !",
            allMsg: messages
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