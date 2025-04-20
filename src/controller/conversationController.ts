import express from 'express'

import { 
    findExistingPersonalConversation,
    createPersonalConversation,
    getUserConversations,
    getConversationById
} from '../model/conversationModel'

import { userById } from '../model/userModel'

export const createPersonalConversationCtrl = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const { receiverId } = req.body
        const currentUserId = req.user?.id;

        if (!receiverId) {
            res.status(400).json({
                error: true,
                message: "Please input receiver ID !"
            })
            return
        }

        const receiver = await userById(receiverId)
        if (!receiver) {
            res.status(404).json({
                error: true,
                message: "Receiver ID didn't exist !"
            })
            return
        }

        if (currentUserId === receiverId) {
            res.status(400).json({
                error: true,
                message: "Can't start new chat with same person !"
            })
            return
        }

        const existingConversation = await findExistingPersonalConversation(
            currentUserId as string,
            receiverId
        )

        if (existingConversation) {
            res.status(200).json({
                error: false,
                message: "Conversation exist !",
                conversation: existingConversation
            });
            return
        }

        const newConversation = await createPersonalConversation(
            currentUserId as string,
            receiverId
        )

        res.status(201).json({
            error: false,
            message: "New conversation added !",
            conversation: newConversation
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

export const getUserConversationsCtrl = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const userId = req.user?.id;

        const conversations = await getUserConversations(userId as string)

        const processedConversations = conversations.map(conv => {
            if (!conv.isGroup) {
                const otherParticipant = conv.participants.find(
                    p => p.userId !== userId
                );
                
                return {
                    ...conv,
                    name: otherParticipant?.user.name || "Unknown",
                    otherUser: otherParticipant?.user || null,
                    lastMessage: conv.messages[0] || null
                };
            }
            
            return {
                ...conv,
                lastMessage: conv.messages[0] || null
            };
        });
        res.status(200).json({
            error: false,
            message: "Success getting all conversation with !",
            conversations: processedConversations
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

export const getConversationByIdCtrl = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const { id } = req.params
        const userId = req.user?.id;

        const conversation = await getConversationById(id, userId as string)

        if (!conversation) {
            res.status(404).json({
                error: true,
                message: "Conversation not found or you do not have access !"
            });
            return
        }

        if (!conversation.isGroup) {
            const otherParticipant = conversation.participants.find(
                p => p.userId !== userId
            );
            
            res.status(200).json({
                error: false,
                message: "Conversation founded !",
                conversation: {
                    ...conversation,
                    otherUser: otherParticipant?.user || null
                }
            });
            return
        }
        res.status(200).json({
            error: false,
            message: "Conversation founded !",
            conversation: conversation
        })
    } catch (e: any) {
        res.status(500).json({
            error: true,
            message: e.message || "Server error"
        });
        return 
    }
}