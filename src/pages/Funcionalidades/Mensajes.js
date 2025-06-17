import Header from "../../components/Header";
import { useUser } from '../../components/UserContext';
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import api from '../../api';
import IrArriba from '../../components/IrArriba';
import { useUnreadMessages } from '../../components/Chat/UnreadMessagesContext';

const Mensajes = () => {
    const { currentUser } = useUser();
    const [conversationUsers, setConversationUsers] = useState([]);

    const [userList, setUserList] = useState([]);
    const [buscado, setBuscado] = useState(true);
    const [loadingConversations, setLoadingConversations] = useState(true);
    const navigate = useNavigate();

    const { unreadConversations } = useUnreadMessages();

    const buscar = async (word) => {
        setBuscado(true);
        if (word !== "") {
            try {
                const users = await api.get(`/chat/searchFollowee`, {
                    params: {
                        word: word,
                        currentUserId: currentUser.id
                    }
                });
                setUserList(users.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        } else {
            setUserList([]);
            setBuscado(false);
        }
    };   

    useEffect(() => {
        if (!currentUser?.id) return;

        const fetchConversations = async () => {
            setLoadingConversations(true);
            try {
                const response = await api.get(`/chat/conversations/${currentUser?.id}`);
                setConversationUsers(response.data);
            } catch (error) {
                console.error('Error fetching conversations:', error);
            } finally {
                setLoadingConversations(false);
            }
        };

        fetchConversations();
    }, [unreadConversations]);

  return (
    <div className="block min-h-screen">
      <Header />
      {!currentUser ? (
        <p className="text-center text-3xl text-gray-500 mt-20">
          Debe iniciar sesión para acceder a esta página.
        </p>
      ) : (
        <div className="px-6 py-6 max-w-3xl mx-auto relative">
          {/* Barra de búsqueda */}
          <div className="flex justify-center mb-6">
            <form className="w-full max-w-md flex border rounded-lg shadow-sm overflow-hidden" onSubmit={(e) => {e.preventDefault()}}>
              <input
                className="flex-grow p-3 outline-none text-gray-700"
                type="text"
                placeholder="Buscar usuarios que sigues..."
                onChange={(e) => buscar(e.target.value)}
              />
              <button
                type="submit"
                className="bg-sky-400 px-4 flex items-center justify-center hover:bg-sky-500 transition"
              >
                <img src="/resources/lupa.png" alt="Buscar" className="w-6 h-6" />
              </button>
            </form>
          </div>

          {/* Resultados de búsqueda */}
          {userList.length > 0 && (
            <div className="w-full absolute top-[90px] left-0 right-0 max-w-md mx-auto bg-white rounded-lg shadow-lg p-4 overflow-y-auto max-h-96 z-50">
              {userList.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-4 py-4 px-4 mb-2 rounded-xl bg-sky-50 shadow hover:shadow-md cursor-pointer transition"
                  onClick={() => navigate(`/chat/${user.id}`)}
                >
                  <img
                    src={user?.foto_perfil ? `http://localhost:5227/${user.foto_perfil}?t=${new Date().getTime()}` : '/resources/foto_perfil_default.png'}
                    alt={user.userName}
                    className="w-12 h-12 rounded-full object-cover object-top"
                  />
                  <p className="text-sky-700 font-medium text-lg">@{user.userName}</p>
                </div>
              ))}
            </div>
          )}

          {!buscado && (
            <p className="text-center text-gray-500 mb-6">
              Ningún usuario seguido coincide con el nombre de usuario.
            </p>
          )}

          {/* Conversaciones activas */}
          <div className="bg-white rounded-lg shadow-md p-4">
            {loadingConversations ? (
              <p className="text-center text-gray-500">Cargando conversaciones...</p>
            ) : conversationUsers.length > 0 ? (
              conversationUsers.map((conv) => (
                <div
                  key={conv.user.id}
                  className="flex items-center gap-4 py-2 px-3 border-b hover:bg-sky-50 cursor-pointer transition border-l-4 border-sky-500"
                  onClick={() => navigate(`/chat/${conv.user.id}`)}
                >
                  <img
                    src={conv.user?.foto_perfil ? `http://localhost:5227/${conv.user.foto_perfil}?t=${new Date().getTime()}` : '/resources/foto_perfil_default.png'}
                    alt={conv.user.userName}
                    className="w-12 h-12 rounded-full object-cover object-top"
                  />
                  
                  <p className="text-sky-700 font-medium text-lg flex-1">@{conv.user.userName}</p>

                  {conv.unreadMessagesCount > 0 && (
                    <p className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {conv.unreadMessagesCount}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No tienes conversaciones activas.</p>
            )}
          </div>
        </div>
      )}

      <IrArriba />
    </div>
  );
};

export default Mensajes;
