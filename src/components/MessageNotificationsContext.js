import React, { createContext, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as signalR from "@microsoft/signalr";
import { useUser } from './UserContext';
import { useUnreadMessages } from './Chat/UnreadMessagesContext';
import api from '../api';

const MessageNotificationsContext = createContext();

export const useMessageNotifications = () => useContext(MessageNotificationsContext);

export const MessageNotificationsProvider = ({ children }) => {
  const { currentUser } = useUser();
  const location = useLocation();
  const { addUnread } = useUnreadMessages();

  useEffect(() => {
    if (!currentUser?.id) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`https://backend-dayk.onrender.com/chatHub?userId=${currentUser.id}`, { withCredentials: true })
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => console.log("SignalR conexión iniciada"))
      .catch(e => console.error("Error SignalR", e));

    const onMessageReceived = async (msg) => {
      const inCurrentConversation = location.pathname.includes(`/chat/${msg.conversationId}`);
      const inChatGeneral = location.pathname.startsWith("/chat");

      if (!inCurrentConversation) {
        addUnread(msg.conversationId);
      }

      if (!inChatGeneral) {
        try {
          const response = await api.get(`/users/${msg.senderId}`);
          const user = response.data;

          toast.custom(t => (
            <div className="flex items-center px-4 py-2 bg-white text-black shadow-md rounded-lg w-full max-w-md min-w-[280px]">
              <img
                src={user?.foto_perfil ? `http://localhost:5227/${user.foto_perfil}?t=${new Date().getTime()}` : 'http://localhost:5227/wwwroot/users_images/foto_perfil_default.png'}
                className='object-cover object-top'
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  marginRight: 12,
                  border: '1px solid #ccc'
                }}
              />
              <div style={{ flex: 1 }}>
                <strong>{user?.userName || 'Usuario'}</strong>
                <div style={{ fontSize: 14, marginTop: 4 }}>
                  {msg.content || 'Nuevo mensaje'}
                </div>
              </div>
            </div>
          ));
        } catch (err) {
          console.error("Error cargando usuario:", err);
        }
      }
    };

    connection.on("ReceiveMessage", onMessageReceived);

    return () => {
      connection.off("ReceiveMessage", onMessageReceived);
      connection.stop();
    };
  }, [currentUser?.id, location.pathname]);

  return <>{children}</>;
};
