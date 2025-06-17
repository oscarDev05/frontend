import { useState, useEffect } from 'react';
import { useUser } from '../../components/UserContext';
import Header from '../../components/Header';
import api from '../../api';
import PostById from '../../components/PostById';
import { Link } from 'react-router-dom';
import IrArriba from '../../components/IrArriba';

const Buscador = () => {
    const { currentUser } = useUser();

    const [userList, setUserList] = useState([])
    const [postList, setPostList] = useState([])

    const [searchTerm, setSearchTerm] = useState("");

    const [buscado, setBuscado] = useState(false)
    const [searchUser, setSearchUser] = useState(false)
    const [searchPost, setSearchPost] = useState(false)

    const [isPopupVisible, setIsPopupVisible] = useState(false)
    const [selectedPost, setSelectedPost] = useState(null)
    
    const buscar = async (word) => {
        setSearchTerm(word);
        setBuscado(true);

        if (word !== "") {
            try {
                const result = await api.get(`/users/searchUser`, {
                    params: {
                        word: word,
                        currentUserId: currentUser.id,
                    },
                });
                const users = result.data;
                // Obtener estados de seguimiento de todos los usuarios
                const ids = users.map((u) => u.id);

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

                const posts = await api.get(`/users/searchPost`, {
                    params: {
                        word: word,
                        currentUserId: currentUser.id,
                    },
                });
                setPostList(posts.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        } else {
            setUserList([]);
            setPostList([]);
            setFollowStates({});
        }
    };
    

    const [followStates, setFollowStates] = useState({});

    const handleFollow = async (userId) => {
        try {
            const response = await api.post("/follows/toggleFollow", {
                UserId: currentUser.id,
                TargetId: userId,
            });

            const nuevoEstado = response.data; // 'siguiendo', 'pendiente', 'no_sigue'

            setUserList(prevList =>
                prevList.map(user =>
                    user.id === userId ? { ...user, estado: nuevoEstado } : user
                )
            );

        } catch (error) {
            console.error("Error al cambiar estado de seguimiento:", error);
        }
    };

    const textoBoton = (estado) => {
        if (estado === 'Seguir') return 'Seguir';
        if (estado === 'Pendiente') return 'Pendiente';
        if (estado === 'Siguiendo') return 'Siguiendo';
        return 'Seguir';
    };

    useEffect(() => {
        const loadState = async () => {
            if (!currentUser || userList.length == 0) return;
        
            const ids = userList.map(u => u.id);

            const estadoResponse = await api.post('/follows/estadosSeguimiento', {
                currentUserId: currentUser.id,
                userIds: ids
            });

            const estados = estadoResponse.data;

            const usersConEstado = userList.map(u => ({
                ...u,
                estado: estados[u.id] // 'siguiendo', 'pendiente', 'no_sigue'
            }));

            setUserList(usersConEstado);
        }

        loadState();

    }, [currentUser]);

    const openPopup = (post) => {
        console.log(post)
        setSelectedPost(post);
        setIsPopupVisible(true);
    };

    const closePopup = () => {
        setIsPopupVisible(false);
        setSelectedPost(null);
    };

    return (
        <div className="block min-h-screen">
            <Header />
            {!currentUser ? (
            <p className="text-center text-3xl text-gray-500 mt-20">
                Debe iniciar sesión para acceder a esta página.
            </p>
            ) : (
                <div className="px-6 py-4 max-w-4xl mx-auto">
                    {/* Barra de búsqueda */}
                    <div className="flex mb-6 justify-center">
                        <form className="w-full max-w-md flex border-2 rounded-lg overflow-hidden shadow-sm" onSubmit={(e) => {e.preventDefault()}}>    {/* Evita la recarga de la página */}
                            <input
                                className="flex-grow p-3 outline-none"
                                type="text"
                                placeholder="Buscar..."
                                onChange={(e) => buscar(e.target.value)}
                            />
                            <button type="submit" className="bg-sky-400 px-4 flex items-center justify-center hover:bg-sky-500 transition">
                                <img src="/resources/lupa.png" alt="Buscar" className="w-6 h-6" />
                            </button>
                        </form>
                    </div>

                    {/* Botones de filtro */}
                    <div className="flex justify-center gap-4 mb-8">
                        <button
                            className={
                            searchUser
                                ? 'px-4 py-2 rounded-full border-2 border-emerald-300 bg-emerald-200 font-semibold transition'
                                : 'px-4 py-2 rounded-full border border-gray-300 font-semibold hover:bg-gray-100 transition'
                            }
                            onClick={() => setSearchUser(!searchUser)}
                        >
                            Personas
                        </button>
                        <button
                            className={
                            searchPost
                                ? 'px-4 py-2 rounded-full border-2 border-emerald-300 bg-emerald-200 font-semibold transition'
                                : 'px-4 py-2 rounded-full border border-gray-300 font-semibold hover:bg-gray-100 transition'
                            }
                            onClick={() => setSearchPost(!searchPost)}
                        >
                            Publicaciones
                        </button>
                    </div>

                    {/* Listado de usuarios y posts */}
                    <div className="flex justify-center">
                        <div className="w-full max-w-lg">
                            {/* Usuarios */}
                            {(searchUser || (searchUser && searchPost) || (!searchUser && !searchPost)) && (
                                userList.length > 0 || !buscado ? (
                                    userList.map((user) => (
                                        <div key={user.id} className="flex items-center gap-4 mb-4 border px-3 py-1.5 rounded-full">
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
                                                    className="text-md font-semibold text-gray-800 hover:text-sky-600 transition"
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
                                ) : (
                                    <p className="text-center text-gray-500 mt-8">Ningún usuario coincide con el nombre de usuario.</p>
                                )
                            )}

                            <div className='my-10'/>

                            {/* Publicaciones separadas */}
                            {(searchPost || (searchUser && searchPost) || (!searchUser && !searchPost)) && (
                                postList.length > 0 || !buscado ? (
                                    <>
                                        {/* Multimedia */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                                            {postList.filter(p => p.file).map(post => (
                                                <div
                                                    key={post.id}
                                                    className="cursor-pointer rounded-lg overflow-hidden shadow-sm bg-white hover:shadow-md transition"
                                                    onClick={() => openPopup(post)}
                                                >
                                                    {post.mediaType === 'image' ? (
                                                        <img
                                                            src={`http://localhost:5227/wwwroot${post.file}`}
                                                            alt="Post"
                                                            className="w-full max-h-72 object-contain"
                                                        />
                                                    ) : (
                                                        <img
                                                            src={`http://localhost:5227/wwwroot${post.thumbnail}?t=${new Date().getTime()}`}
                                                            alt="Miniatura video"
                                                            className="w-full max-h-72 object-cover object-center"
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Separador */}
                                        {postList.filter(p => p.file).length > 0 && postList.filter(p => !p.file).length > 0 && (
                                            <div className="my-10 border-t border-gray-300 w-4/5 mx-auto"></div>
                                        )}

                                        {/* Solo texto */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {postList.filter(p => !p.file).map(post => (
                                                <div
                                                    key={post.id}
                                                    className="cursor-pointer rounded-lg overflow-hidden shadow-sm bg-white hover:shadow-md transition p-4"
                                                    onClick={() => openPopup(post)}
                                                >
                                                    <p className="truncate text-gray-700">{post.content}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-center text-gray-500 mt-8">Ningún post coincide con esa descripción.</p>
                                )
                            )}
                        </div>
                    </div>

                    {isPopupVisible && selectedPost && (
                        <PostById post={selectedPost} closePopup={closePopup} currentUser={currentUser} />
                    )}
                </div>
            )}

            <IrArriba />

        </div>
    );
};
export default Buscador;