import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { userById } from '../model/userModel';
import { isUserInConversation, createMessage, getMessages } from '../model/messageModel';
import { getUserConversations, updatedConversation } from '../model/conversationModel';
import { isGroup, isGroupAdmin } from '../model/groupConversationModel';
import { getParticipant, getGroupParticipants, addParticipantToGroup, getParticipantById, removeParticipant, leaveGroup, updateParticipantRole } from '../model/participantModel';
import type { DecodedToken, ConnectedUser } from '../interface/type';

const connectedUsers: ConnectedUser[] = [];

export const initializeSocket = (httpServer: HttpServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*', 
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'default_jwt_secret'
      ) as DecodedToken;

      socket.data.user = {
        id: decoded.id,
        email: decoded.email
      };
      
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  // connect
  io.on('connection', async (socket) => {
    console.log('User connected:', socket.id);
    // Event untuk mendapatkan semua percakapan pengguna
    socket.on('get_conversations', async () => {
      try {
        const userId = socket.data.user?.id;

        if (!userId) {
          socket.emit('error', { message: 'User not authenticated' });
          return;
        }

        const conversations = await getUserConversations(userId);

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

        socket.emit('conversations_received', {
          conversations: processedConversations
        });
      } catch (error: any) {
        console.error('Error getting conversations:', error);
        socket.emit('error', { message: error.message || 'Failed to get conversations' });
      }
    });

    // Event untuk mendapatkan pesan dalam percakapan
    socket.on('get_messages', async (data) => {
      try {
        const { conversationId } = data;
        const userId = socket.data.user?.id;

        if (!userId) {
          socket.emit('error', { message: 'User not authenticated' });
          return;
        }

        const isParticipant = await isUserInConversation(userId, conversationId);
        if (!isParticipant) {
          socket.emit('error', { message: "You don't have access to this conversation!" });
          return;
        }

        const messages = await getMessages(conversationId);

        socket.emit('messages_received', { 
          conversationId,
          messages 
        });
      } catch (error: any) {
        console.error('Error getting messages:', error);
        socket.emit('error', { message: error.message || 'Failed to get messages' });
      }
    });

    socket.on('get_participants', async (data) => {
      try {
        const { conversationId } = data;
        const userId = socket.data.user?.id;
    
        if (!userId) {
          socket.emit('error', { message: 'User not authenticated' });
          return;
        }
    
        const groupCheck = await isGroup(conversationId);
        if (!groupCheck) {
          socket.emit('error', { message: "Conversation isn't a group!" });
          return;
        }
    
        const userParticipant = await getParticipant(userId, conversationId);
        if (!userParticipant) {
          socket.emit('error', { message: "You are not a member of this group!" });
          return;
        }
    
        const participants = await getGroupParticipants(conversationId);
    
        socket.emit('participants_received', {
          conversationId,
          participants
        });
      } catch (error: any) {
        console.error('Error getting participants:', error);
        socket.emit('error', { message: error.message || 'Failed to get participants' });
      }
    });

    // mau liat apa aja yg jalan handlernya
    socket.onAny((event, ...args) => {
      console.log(`Received event: ${event}`, args);
    });
    
    // Catat pengguna yang terhubung
    if (socket.data.user) {
      connectedUsers.push({
        userId: socket.data.user.id,
        socketId: socket.id
      });
      
      // Broadcast status online (upcoming features)
      // io.emit('user_status_changed', {
      //   userId: socket.data.user.id,
      //   status: 'online'
      // });
    }

    // Ketika pengguna terhubung, daftarkan mereka ke semua percakapan mereka
    if (socket.data.user?.id) {
      const userId = socket.data.user.id;
      
      try {
        // Dapatkan semua percakapan pengguna untuk mendapatkan ID mereka
        const userConversations = await getUserConversations(userId);
        
        // Gabungkan pengguna ke semua ruangan percakapan mereka
        userConversations.forEach(conversation => {
          socket.join(conversation.id);
        });
        
        // Beri tahu pengguna lain bahwa pengguna ini online
        userConversations.forEach(conversation => {
          socket.to(conversation.id).emit('user_status_changed', {
            userId,
            status: 'online',
            conversationId: conversation.id
          });
        });
      } catch (error) {
        console.error(`Failed to join user ${userId} to conversation rooms:`, error);
      }
    }

    // Handle event pengiriman pesan
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content } = data;
        const userId = socket.data.user?.id;

        if (!userId) {
          socket.emit('error', { message: 'User not authenticated' });
          return;
        }

        if (!content || content.trim() === '') {
          socket.emit('error', { message: 'Message cannot be empty!' });
          return;
        }

        const isParticipant = await isUserInConversation(userId, conversationId);
        if (!isParticipant) {
          socket.emit('error', { message: "You don't have access to this conversation!" });
          return;
        }

        const message = await createMessage(conversationId, userId, content);
        socket.join(conversationId);
        
        io.to(conversationId).emit('message_received', message);

        const updateConversation = await updatedConversation(conversationId)
        if (updateConversation) {
          console.log('Sending conversation_updated with conversation:', updateConversation);
          io.to(conversationId).emit('conversation_updated', {
            conversation: updateConversation
          });
        }

        socket.emit('message_sent', { success: true, data: message });
      } catch (error: any) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: error.message || 'Failed to send message' });
      }
    });

    // Event untuk bergabung dengan ruangan percakapan
    socket.on('join_conversation', async (data) => {
      try {
        const { conversationId } = data;
        const userId = socket.data.user?.id;

        if (!userId) {
          socket.emit('error', { message: 'User not authenticated' });
          return;
        }

        
        const isParticipant = await isUserInConversation(userId, conversationId);
        if (!isParticipant) {
          socket.emit('error', { message: "You don't have access to this conversation!" });
          return;
        }

        socket.join(conversationId);
        socket.emit('joined_conversation', { conversationId });
        
        // masih ngebug (upcoming features)
        // socket.to(conversationId).emit('user_viewing', {
        //   userId,
        //   conversationId
        // });
      } catch (error: any) {
        console.error('Error joining conversation:', error);
        socket.emit('error', { message: error.message || 'Failed to join conversation' });
      }
    });
    
    // Event untuk mulai mengetik
    socket.on('typing_start', (data) => {
      const { conversationId } = data;
      const userId = socket.data.user?.id;
      
      if (userId && conversationId) {
        socket.to(conversationId).emit('user_typing', {
          userId,
          conversationId
        });
      }
    });
    
    // Event untuk berhenti mengetik
    socket.on('typing_end', (data) => {
      const { conversationId } = data;
      const userId = socket.data.user?.id;
      
      if (userId && conversationId) {
        socket.to(conversationId).emit('user_stopped_typing', {
          userId,
          conversationId
        });
      }
    });

    // Tambahkan juga event update untuk percakapan (upcoming features)
    // socket.on('update_conversation_status', async (data) => {
    //   try {
    //     const { conversationId, status } = data;
    //     const userId = socket.data.user?.id;

    //     if (!userId) {
    //       socket.emit('error', { message: 'User not authenticated' });
    //       return;
    //     }

        
    //     const isParticipant = await isUserInConversation(userId, conversationId);
    //     if (!isParticipant) {
    //       socket.emit('error', { message: "You don't have access to this conversation!" });
    //       return;
    //     }

    //     // Logika untuk memperbarui status percakapan bisa ditambahkan di sini
    //     // Misalnya menandai sebagai 'dibaca', 'diarsipkan', dll.
        
    //     // Memberitahu pengguna lain dalam percakapan tentang perubahan status
    //     socket.to(conversationId).emit('conversation_status_updated', {
    //       conversationId,
    //       status,
    //       updatedBy: userId
    //     });

    //     socket.emit('status_update_success', { conversationId, status });
    //   } catch (error: any) {
    //     console.error('Error updating conversation status:', error);
    //     socket.emit('error', { message: error.message || 'Failed to update conversation status' });
    //   }
    // });

    // Event untuk menambahkan peserta ke grup
    socket.on('add_participant', async (data) => {
      try {
        const { conversationId, userId } = data;
        const currentUserId = socket.data.user?.id;

        if (!currentUserId) {
          socket.emit('error', { message: 'User not authenticated' });
          return;
        }

        const groupCheck = await isGroup(conversationId);
        if (!groupCheck) {
          socket.emit('error', { message: "Conversation isn't a group!" });
          return;
        }

        const isAdmin = await isGroupAdmin(currentUserId, conversationId);
        if (!isAdmin) {
          socket.emit('error', { message: "Only admin can add members!" });
          return;
        }

        const userToAdd = await userById(userId);
        if (!userToAdd) {
          socket.emit('error', { message: "User not found!" });
          return;
        }

        const participant = await addParticipantToGroup(conversationId, userId);

        socket.emit('participant_added', {
          success: true,
          message: "Member successfully added to group!",
          participant
        });

        socket.to(conversationId).emit('new_participant', {
          conversationId,
          participant
        });

        // Tambahkan pengguna baru ke ruangan Socket.IO untuk percakapan ini
        // Cari semua socket ID yang terkait dengan pengguna baru
        const userSocketIds = connectedUsers
          .filter(user => user.userId === userId)
          .map(user => user.socketId);

        // Tambahkan semua socket pengguna baru ke room percakapan
        userSocketIds.forEach(socketId => {
          const userSocket = io.sockets.sockets.get(socketId);
          if (userSocket) {
            userSocket.join(conversationId);
            
            // Kirim notifikasi ke pengguna baru
            userSocket.emit('added_to_group', {
              conversationId,
              groupName: groupCheck.name || 'Group Chat', // Anda mungkin perlu mendapatkan nama grup dari database
              addedBy: currentUserId
            });
          }
        });

        // Perbarui daftar peserta untuk semua anggota
        await notifyParticipantsChange(conversationId);
      } catch (error: any) {
        let errorMessage = error.message || 'Failed to add participant';
        let statusCode = 500;

        if (error.message === 'User is already a participant of this group !') {
          errorMessage = error.message;
          statusCode = 400;
        }

        console.error('Error adding participant:', error);
        socket.emit('error', { 
          message: errorMessage,
          statusCode 
        });
      }
    });

    // Event untuk mengeluarkan peserta dari grup
    socket.on('remove_participant', async (data) => {
      try {
        const { conversationId, participantId } = data;
        const userId = socket.data.user?.id;

        if (!userId) {
          socket.emit('error', { message: 'User not authenticated' });
          return;
        }

        const groupCheck = await isGroup(conversationId);
        if (!groupCheck) {
          socket.emit('error', { message: "Conversation isn't a group!" });
          return;
        }

        const isAdmin = await isGroupAdmin(userId, conversationId);
        if (!isAdmin) {
          socket.emit('error', { message: "Only admin can remove members!" });
          return;
        }

        const participant = await getParticipantById(participantId, conversationId);
        if (!participant || participant.conversationId !== conversationId) {
          socket.emit('error', { message: "Participant not found in this group!" });
          return;
        }

        if (participant.role === 'ADMIN') {
          const admins = await getGroupParticipants(conversationId);
          const adminCount = admins.filter(p => p.role === 'ADMIN').length;
          
          if (adminCount <= 1) {
            socket.emit('error', { 
              message: "Cannot remove the last admin, assign admin role to another member first!" 
            });
            return;
          }
        }

        const removedUserName = participant.user.name;

        await removeParticipant(participantId, conversationId);

        socket.emit('participant_removed', {
          success: true,
          message: "Member successfully removed from group!",
          removedUserId: participantId
        });

        io.to(conversationId).emit('group_notification', {
          type: 'member_removed',
          conversationId,
          message: `${removedUserName} has been removed from the group`,
          timestamp: new Date(),
          metadata: {
            removedUserId: participantId,
            removedByUserId: userId
          }
        });

        const removedUserSocketIds = connectedUsers
          .filter(user => user.userId === participantId)
          .map(user => user.socketId);

        removedUserSocketIds.forEach(socketId => {
          const userSocket = io.sockets.sockets.get(socketId);
          if (userSocket) {
            userSocket.leave(conversationId);
            
            userSocket.emit('removed_from_group', {
              conversationId,
              removedBy: userId
            });
          }
        });

        await notifyParticipantsChange(conversationId);
      } catch (error: any) {
        console.error('Error removing participant:', error);
        socket.emit('error', { message: error.message || 'Failed to remove participant' });
      }
    });

    // Event untuk keluar dari grup
    socket.on('leave_group', async (data) => {
      try {
        const { conversationId } = data;
        const userId = socket.data.user?.id;

        if (!userId) {
          socket.emit('error', { message: 'User not authenticated' });
          return;
        }

       
        const groupCheck = await isGroup(conversationId);
        if (!groupCheck) {
          socket.emit('error', { message: "Conversation isn't a group!" });
          return;
        }

        const userInfo = await userById(userId);
        
        const isAdmin = await isGroupAdmin(userId, conversationId);
        if (isAdmin) {
          const admins = await getGroupParticipants(conversationId);
          const adminCount = admins.filter(p => p.role === 'ADMIN').length;
          
          if (adminCount <= 1) {
            const participants = await getGroupParticipants(conversationId);
            
            if (participants.length <= 1) {
              await leaveGroup(userId, conversationId);
              
              socket.emit('left_group', {
                success: true,
                message: "You have left the group and the group has been deleted because there are no more members!"
              });
              
              socket.leave(conversationId);
              
              return;
            }
            
            socket.emit('error', {
              message: "You are the last admin, assign admin roles to other members first!"
            });
            return;
          }
        }

        await leaveGroup(userId, conversationId);
        
        socket.emit('left_group', {
          success: true,
          message: "You successfully left the group!",
          conversationId
        });
        
        socket.to(conversationId).emit('group_notification', {
          type: 'member_left',
          conversationId,
          message: `${userInfo?.name || 'A member'} has left the group`,
          timestamp: new Date(),
          metadata: {
            leftUserId: userId
          }
        });
        
        socket.leave(conversationId);
        
        await notifyParticipantsChange(conversationId);
      } catch (error: any) {
        let errorMessage = error.message || 'Failed to leave group';
        let statusCode = 500;
        
        if (error.message === 'User is not a participant of this group !') {
          errorMessage = error.message;
          statusCode = 400;
        }
        
        console.error('Error leaving group:', error);
        socket.emit('error', { 
          message: errorMessage,
          statusCode
        });
      }
    });

    // Event untuk memperbarui peran peserta (fix bug)
    socket.on('update_participant_role', async (data) => {
      try {
        const { conversationId, participantId, role } = data;
        const userId = socket.data.user?.id;

        if (!userId) {
          socket.emit('error', { message: 'User not authenticated' });
          return;
        }

        if (!role || (role !== 'ADMIN' && role !== 'MEMBER')) {
          socket.emit('error', { message: "Role must be ADMIN or MEMBER!" });
          return;
        }

       
        const groupCheck = await isGroup(conversationId);
        if (!groupCheck) {
          socket.emit('error', { message: "Conversation isn't a group!" });
          return;
        }

        const isAdmin = await isGroupAdmin(userId, conversationId);
        if (!isAdmin) {
          socket.emit('error', { message: "Only admins can change member roles!" });
          return;
        }

        const participant = await getParticipantById(participantId, conversationId);
        if (!participant || participant.conversationId !== conversationId) {
          socket.emit('error', { message: "Participant not found in this group!" });
          return;
        }

        const updatedParticipant = await updateParticipantRole(participantId, conversationId, role as 'ADMIN' | 'MEMBER');

        socket.emit('role_updated', {
          success: true,
          message: "Member role successfully updated!",
          participant: updatedParticipant
        });

        const targetUserSocketIds = connectedUsers
          .filter(user => user.userId === participantId)
          .map(user => user.socketId);

        targetUserSocketIds.forEach(socketId => {
          const userSocket = io.sockets.sockets.get(socketId);
          if (userSocket) {
            userSocket.emit('role_changed', {
              conversationId,
              role,
              changedBy: userId
            });
          }
        });

        socket.to(conversationId).emit('group_notification', {
          type: 'role_changed',
          conversationId,
          message: `${participant.user.name} is now ${role === 'ADMIN' ? 'an admin' : 'a member'}`,
          timestamp: new Date(),
          metadata: {
            participantId,
            newRole: role,
            updatedBy: userId
          }
        });

        await notifyParticipantsChange(conversationId);
      } catch (error: any) {
        console.error('Error updating participant role:', error);
        socket.emit('error', { message: error.message || 'Failed to update participant role' });
      }
    });

    // Fungsi untuk memberi tahu semua anggota tentang perubahan keanggotaan
    const notifyParticipantsChange = async (conversationId: string) => {
      try {
        const updatedParticipants = await getGroupParticipants(conversationId);
        
        io.to(conversationId).emit('participants_updated', {
          conversationId,
          participants: updatedParticipants
        });
      } catch (error) {
        console.error('Error notifying participant changes:', error);
      }
    };

    // Tambahkan juga kemampuan untuk menerima pembaruan percakapan secara real-time
    // Ini sangat penting untuk implementasi yang lengkap
    // Kode berikut sebaiknya ditambahkan di dekat event 'connection' untuk menjaga status koneksi

    // Ketika pengguna terputus
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      // Hapus pengguna dari daftar yang terhubung
      const index = connectedUsers.findIndex(user => user.socketId === socket.id);
      if (index !== -1) {
        const userId = connectedUsers[index].userId;
        connectedUsers.splice(index, 1);
        
        // Broadcast status offline (opsional)
        io.emit('user_status_changed', {
          userId,
          status: 'offline'
        });
      }
    });
  });

  return io;
};

// Fungsi utility untuk mendapatkan socket id berdasarkan user id
export const getUserSocketId = (userId: string): string | undefined => {
  const user = connectedUsers.find(user => user.userId === userId);
  return user?.socketId;
};

// Fungsi utility untuk mendapatkan user id berdasarkan socket id
export const getUserIdFromSocketId = (socketId: string): string | undefined => {
  const user = connectedUsers.find(user => user.socketId === socketId);
  return user?.userId;
};