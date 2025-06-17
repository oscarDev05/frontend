import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useUser } from './UserContext';

const UserRecommendation = ({onFollowChange}) => {
  const { currentUser } = useUser();

  const [loading, setLoading] = useState(true);
  const [userList, setUserList] = useState([]);

  const fetchUsers = async () => {
    if (!currentUser) return;
    
    try {
      const result = await api.post(`/users/sports=${currentUser.id}`);
      const users = result.data;

      const ids = users.map(u => u.id);

      const estadoResponse = await api.post('/follows/estadosSeguimiento', {
        currentUserId: currentUser.id,
        userIds: ids
      });

      const estados = estadoResponse.data;

      const usersConEstado = users.map(u => ({
        ...u,
        estado: estados[u.id] // 'siguiendo', 'pendiente', 'no_sigue'
      }));

      setUserList(usersConEstado);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentUser]);


  const handleFollow = async (userId) => {
    try {
      const response = await api.post('/follows/toggleFollow', {
        UserId: currentUser.id,
        TargetId: userId
      });

      const nuevoEstado = response.data; // 'no_sigue', 'pendiente', 'siguiendo'

      setUserList(prevList =>
        prevList.map(user =>
          user.id === userId ? { ...user, estado: nuevoEstado } : user
        )
      );

      if (onFollowChange) onFollowChange();

      setTimeout(() => fetchUsers(), 1000);

    } catch (error) {
      console.error('Error al cambiar estado de seguimiento:', error);
    }
  };

  const textoBoton = (estado) => {
    if (estado === 'Seguir') return 'Seguir';
    if (estado === 'Pendiente') return 'Pendiente';
    if (estado === 'Siguiendo') return 'Siguiendo';
    return 'Seguir';
  };


  if (loading) {
    return (
      <div className="max-n950:hidden text-gray-500">Cargando recomendaciones...</div>
    );
  }

  return (
    <div
      className={`
        bg-white border border-sky-200 rounded-2xl shadow-lg p-4 
        w-80 fixed overflow-y-auto
        max-n950:relative max-n950:w-full max-n950:static max-n950:max-h-none max-n950:mb-6
      `}
    >
      <h2 className="text-xl font-bold mb-4 text-sky-600">Recomendaciones</h2>

      {userList.length === 0 ? (
        <p className="text-gray-500">No hay usuarios recomendados.</p>
      ) : (
        userList.map((user) => (
          <div key={user.id} className="flex items-center gap-4 mb-4">
            <img
              src={
                user?.foto_perfil
                  ? `http://localhost:5227/${user.foto_perfil}?t=${new Date().getTime()}`
                  : '/resources/foto_perfil_default.png'
              }
              alt={user.userName}
              className="w-12 h-12 rounded-full object-cover object-top border border-sky-300"
            />
            <div className="flex-1">
              <Link
                to={`/user/${user.id}`}
                state={{ currentUser }}
                className="text-lg font-semibold text-gray-800 hover:text-sky-600 transition"
              >
                @{user.userName}
              </Link>
            </div>
            <button
              onClick={() => handleFollow(user.id)}
              className={`
                px-4 py-1 rounded-full font-semibold transition duration-200 border flex items-center justify-center gap-2
                ${
                user.estado === 'Siguiendo'
                    ? 'bg-gray-100 text-gray-500 border-gray-300'
                    : user.estado === 'Pendiente'
                    ? 'bg-white text-sky-600 border-sky-600'
                    : 'bg-gradient-to-r from-sky-400 to-sky-600 hover:from-sky-500 hover:to-sky-700 text-white border-sky-500'
                }
            `}
            >
              {textoBoton(user.estado)}
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default UserRecommendation;
