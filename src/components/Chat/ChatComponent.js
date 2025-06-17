import { useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { useUser } from '../UserContext';
import { useUnreadMessages } from './UnreadMessagesContext';
import api from '../../api';

function ChatComponent({ selectedUserId }) {
    const { currentUser } = useUser();
    const { removeUnread, addUnread } = useUnreadMessages();

    const [selectedUserData, setSelectedUserData] = useState(null);
    const [conversationId, setConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [typingUser, setTypingUser] = useState(null);
    const typingTimeoutRef = useRef(null);
    const connectionRef = useRef(null);
    const bottomRef = useRef(null);

    useEffect(() => {
        let isMounted = true;

        const createConversationAndConnect = async () => {
            if (!currentUser?.id || !selectedUserId || isNaN(selectedUserId)) {
                console.warn("ID de usuario no válido");
                return;
            }

            try {
                // Obtener datos del usuario con el que estás chateando
                const userRes = await api.get(`/users/${selectedUserId}`);
                if (isMounted) setSelectedUserData(userRes.data);

                // Crear/conectar conversación
                const orderedIds = [currentUser.id, selectedUserId].sort((a, b) => a - b);
                const res = await api.post(`/chat/create-conversation`, null, {
                    params: {
                        userId1: orderedIds[0],
                        userId2: orderedIds[1],
                    }
                });

                if (!isMounted) return;

                const convId = res.data.id;
                setConversationId(convId);

                removeUnread(convId);

                await fetchMessages(convId);

                await api.post('/chat/mark-messages-read', null, {
                    params: {
                        conversationId: convId,
                        userId: currentUser.id
                    }
                });

                await setupSignalRConnection(convId);
            } catch (error) {
                console.error("Error al crear/conectar la conversación:", error);
            }
        };

        createConversationAndConnect();

        return () => {
            isMounted = false;
            connectionRef.current?.stop();
        };
    }, [selectedUserId]);

    

    const setupSignalRConnection = async (conversationId) => {
        if (connectionRef.current?.state === "Connected") {
            await connectionRef.current.stop();
        }

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`https://backend-dayk.onrender.com/chatHub?userId=${currentUser.id}&conversationId=${conversationId}`, {
                withCredentials: true
            })
            .withAutomaticReconnect()
            .build();

        connection.on("ReceiveMessage", async (msg) => {
            const isCurrentChat = msg.senderId === selectedUserId || msg.receiverId === selectedUserId;

            setMessages((prev) => {
                const alreadyExists = prev.some(
                    (m) =>
                        m.content === msg.content &&
                        m.senderId === msg.senderId &&
                        m.receiverId === msg.receiverId &&
                        Math.abs(new Date(m.sentAt).getTime() - new Date(msg.sentAt).getTime()) < 1000
                );
                return alreadyExists ? prev : [...prev, msg];
            });

            if (msg.senderId !== currentUser.id && isCurrentChat) {
                // Usuario está en el chat actual → marcar como leído
                try {
                    await api.post('/chat/mark-messages-read', null, {
                        params: {
                            conversationId: msg.conversationId,
                            userId: currentUser.id
                        }
                    });

                    removeUnread(msg.conversationId); // limpia si por error estaba contado
                } catch (error) {
                    console.error("Error al marcar mensaje como leído en tiempo real:", error);
                }
            } else if (msg.senderId !== currentUser.id) {
                // Usuario no está en el chat actual → cuenta como no leído
                addUnread(msg.conversationId);
            }
        });

            
        connection.on("UserTyping", (senderId) => {
            if (senderId !== currentUser.id.toString()) {
                setTypingUser(senderId);
        
                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                }
        
                typingTimeoutRef.current = setTimeout(() => {
                    setTypingUser(null);
                    typingTimeoutRef.current = null;
                }, 1000);
            }
        });           

        try {
            try {
                await connection.start();
                console.log("Conectado a SignalR");
            } catch (err) {
                console.error("Fallo al conectar SignalR. Reintentando en 2s");
                setTimeout(() => setupSignalRConnection(conversationId), 2000);
            }

            console.log("Conectado a SignalR");
        } catch (err) {
            console.error("Error al conectar a SignalR:", err);
        }

        connectionRef.current = connection;
    };

    const fetchMessages = async (conversationId) => {
        try {
            const res = await api.get(`/chat/get-messages/${conversationId}`);
            setMessages(res.data);
        } catch (err) {
            console.error("Error al cargar mensajes:", err);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;
        
        const msgObj = {
            content: newMessage.trim(),
            senderId: currentUser.id,
            receiverId: selectedUserId,
            conversationId: conversationId
        };
    
        try {
            if (!conversationId) return;

            // Guarda el mensaje en la base de datos
            await api.post("/chat/send-message", msgObj);
        
            // Notifica a través de SignalR
            await connectionRef.current?.invoke(
                "SendMessage",
                currentUser.id.toString(),
                selectedUserId.toString(),
                newMessage,
                conversationId
            );
    
            setNewMessage("");
            console.log('-------------> enviado')
        } catch (err) {
            console.error("Error al enviar mensaje:", err);
        }
    };  

    // Función para formatear la fecha
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes().toString().length === 1 ? '0'+date.getMinutes().toString() : date.getMinutes()}`;
    };

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleTyping = () => {
        if (connectionRef.current && conversationId) {
            connectionRef.current.invoke(
                "Typing",
                currentUser.id.toString(),
                conversationId.toString()
            ).catch(err => console.error("Error al enviar typing:", err));
        }
    };


    return (
        <div className="flex flex-col h-[80vh] max-w-xl mx-auto border rounded-lg shadow-md">
            <div className="flex justify-start p-2 gap-2">
                <img
                    src={selectedUserData?.foto_perfil ? `http://localhost:5227/${selectedUserData?.foto_perfil}?t=${new Date().getTime()}` : 'http://localhost:5227/wwwroot/users_images/foto_perfil_default.png'}
                    className="w-12 h-12 rounded-full object-cover object-top"
                />
                <p className="text-xl font-semibold mt-2">{selectedUserData?.userName}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {messages.map((m) => (
                    <div key={m.id}>
                        <p className={`${m.senderId === currentUser.id ? 'w-fit text-xs text-gray-500 self-end ml-auto' : 'text-xs text-gray-500'}`}>{formatDate(m.sentAt)}</p>
                        <p
                            className={`mb-2 p-2 rounded-lg max-w-[70%] ${m.senderId === currentUser.id ? 'bg-blue-500 text-white self-end ml-auto' : 'bg-gray-300 text-black self-start mr-auto'}`}
                        >
                            {m.content}
                        </p>
                    </div>
                ))}
                {typingUser && typingUser !== currentUser.id.toString() && (
                    <div className="text-sm italic text-gray-500 mb-2">
                        Escribiendo...
                    </div>
                )}
                <div ref={bottomRef} />
            </div>
            <div className="flex p-2 border-t bg-white">
                <input
                    value={newMessage}
                    onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                }}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Escribe tu mensaje..."
                    className="flex-1 border rounded-lg px-4 py-2 mr-2"
                />
                <button
                    onClick={sendMessage}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    Enviar
                </button>
            </div>
        </div>
    );
}

export default ChatComponent;
