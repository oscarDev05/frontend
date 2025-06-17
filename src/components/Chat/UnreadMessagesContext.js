import { createContext, useContext, useState } from "react";

const UnreadMessagesContext = createContext();

export const UnreadMessagesProvider = ({ children }) => {
  // Ahora guardamos un array de objetos: { conversationId, count }
  const [unreadConversations, setUnreadConversations] = useState([]);

  // Sumar 1 al contador o agregar nuevo con count = 1
  const addUnread = (conversationId) => {
    setUnreadConversations((prev) => {
      const exists = prev.find(c => c.conversationId === conversationId);
      if (exists) {
        return prev.map(c =>
          c.conversationId === conversationId
            ? { ...c, count: c.count + 1 }
            : c
        );
      } else {
        return [...prev, { conversationId, count: 1 }];
      }
    });
  };

  // Eliminar conversación del estado
  const removeUnread = (conversationId) => {
    setUnreadConversations((prev) =>
      prev.filter(({ conversationId: id }) => id !== conversationId)
    );
  };

  // Vaciar todos
  const clearAllUnread = () => setUnreadConversations([]);

  // Actualizar el contador exacto
  const setUnreadCount = (conversationId, count) => {
    setUnreadConversations(prev => {
      const exists = prev.find(c => c.conversationId === conversationId);
      if (exists) {
        return prev.map(c =>
          c.conversationId === conversationId
            ? { ...c, count }
            : c
        );
      } else {
        return [...prev, { conversationId, count }];
      }
    });
  };

  return (
    <UnreadMessagesContext.Provider
      value={{
        unreadConversations,
        addUnread,
        removeUnread,
        clearAllUnread,
        setUnreadCount, // <-- añado esta función para sincronizar contador exacto
      }}
    >
      {children}
    </UnreadMessagesContext.Provider>
  );
};

export const useUnreadMessages = () => useContext(UnreadMessagesContext);
