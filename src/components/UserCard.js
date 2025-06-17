import { React, useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Header from './Header';
import PostById from './PostById';
import api from '../api';
import IrArriba from './IrArriba';


const UserCard = () => {
  const { id: userId } = useParams();
  const location = useLocation();
  const currentUser = location.state?.currentUser;
  

    const [user, setUser] = useState();

    const [isSportsVisible, setIsSportsVisible] = useState(false);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedPost, setSelectedPost] = useState(null);
    
    var [showDesc, setShowDesc] = useState(false)
    const [descripcion, setDescripcion] = useState('')
    const descRef = useRef(null);
    const [isTruncated, setIsTruncated] = useState(false);

    const [deportes, setDeportes] = useState([]);

    const [seguidores, setSeguidores] = useState(0);
    const [seguidos, setSeguidos] = useState(0);
    const [numPost, setNumPost] = useState(0);

    const [posts, setPosts] = useState([])

    const [filterMode, setFilterMode] = useState("all"); // Por defecto se muestran solo los posts con media

    const [estadoFollow, setEstadoFollow] = useState('Seguir');

    const loadUser = async () => {
        try {
            const response = await api.get(`/users/${userId}`)
            
            if (response.status === 200) {
                setUser(response.data)
            } else {
                console.error('No se encontró el usuario especificado:', response)
                console.log(response.data)
            }
        } catch (error) {
            console.error('Error cargando el usuario:', error)
        }
    }

    const loadPosts = async () => {
        try {
            const response = await api.get(`/posts/user/${userId}`)
            setNumPost(response.data.length)
            
            if (response.status === 200) {
                setPosts(response.data)
            } else {
                console.error('No se encontraron posts:', response)
                console.log(response.data)
            }
        } catch (error) {
            console.error('Error cargando los posts:', error)
        }
    }
    

    function ShowSports() {
        setIsSportsVisible(!isSportsVisible);
    }

    const openPopup = (post) => {
        setSelectedPost(post);
        setIsPopupVisible(true);
    };

    const closePopup = () => {
        setIsPopupVisible(false);
        setSelectedPost(null);
    };

    const VerMas = () => {
        setShowDesc(!showDesc)
    };

    async function loadFollowCounts() {
        try {
            const response = await api.get(`/follows/followcount/${userId}`);
            setSeguidores(response.data.seguidores);
            setSeguidos(response.data.seguidos);
        } catch (error) {
            console.error('Error cargando seguidores/seguidos:', error);
        }
    }

    useEffect(() => {
        loadUser(userId)
        loadFollowCounts(userId)
        loadPosts(userId)        
    }, [userId])

    useEffect(() => {
        if (user) {
            setDescripcion(user.description);
            setDeportes(user.lista_deportes ? user.lista_deportes.split(',') : []);
        }
    }, [user]);

    useEffect(() => {
        const el = descRef.current;
        if (el) {
          // Esperamos al siguiente frame para verificar si se truncó
          requestAnimationFrame(() => {
            const overflowed = el.scrollWidth > el.clientWidth;
            setIsTruncated(overflowed);
          });
        }
    }, [descripcion]);


    //////////////////////////////////////////////////////////////////////////////////////////////////////

    const handleFollow = async (targetUserId) => {
        try {
            const response = await api.post('/follows/toggleFollow', {
                UserId: currentUser.id,
                TargetId: targetUserId
            });

            const nuevoEstado = response.data; // backend debe devolver el nuevo estado: 'no_sigue', 'pendiente', 'siguiendo'
            setEstadoFollow(nuevoEstado);

        } catch (error) {
            console.error('Error al cambiar estado de seguimiento:', error);
        }
    };

    useEffect(() => {
        if (!currentUser?.id || !userId) return;

        const fetchFollowStatus = async () => {
            try {
                const response = await api.get('/follows/getState', {
                    params: {
                        senderId: currentUser.id,
                        receiverId: userId
                    }
                });

                if (response.status === 200) {
                    // Normaliza la respuesta si quieres: "Seguir", "Pendiente", "Siguiendo"
                    const estado = response.data;
                    if (estado === 'Seguir') setEstadoFollow('Seguir');
                    else if (estado === 'Pendiente') setEstadoFollow('Pendiente');
                    else if (estado === 'Siguiendo') setEstadoFollow('Siguiendo');
                    else setEstadoFollow('Seguir');
                }
            } catch (e) {
                console.error('Error al obtener estado de seguimiento:', e);
            }
        };

        fetchFollowStatus();
    }, [userId, currentUser?.id]);


    return (
        <div className="overflow-x-hidden">
            <Header />
            {!user ? (
                <p className="text-center text-3xl text-gray-500 mt-32">
                    Usuario no encontrado.
                </p>
            ) : (
                <div className="flex justify-center w-full">
                    <div className="w-full max-w-4xl px-4 py-12 mx-auto flex flex-col items-center justify-center min-w-0 max-n510:py-4">
                        {/* Header perfil */}
                        <div className="flex flex-col items-center gap-10 mb-16 w-full md:items-start md:flex-row md:gap-20 max-n510:mb-0">
                            <img
                                src={user?.foto_perfil ? `http://localhost:5227/${user?.foto_perfil}?t=${new Date().getTime()}` : 'http://localhost:5227/wwwroot/users_images/foto_perfil_default.png'}
                                alt="Foto de perfil"
                                className="w-40 h-40 rounded-full object-cover object-top border-4 border-sky-400 shadow-md max-n510:w-32 max-n510:h-32"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-4 mb-4 justify-center md:justify-start">
                                    <h1 className="text-4xl font-extrabold text-gray-900">{user?.userName}</h1>
                                </div>

                                <div className="flex justify-center md:justify-start">
                                    <div className="flex gap-8 text-md font-semibold text-gray-700 flex-wrap max-n510:block max-n510:items-center max-n510:gap-0">
                                        <div className="flex justify-center items-center gap-1 max-n510:mb-3">
                                            <p className="font-bold text-sky-600">{numPost}</p>
                                            <p>publicaciones</p>
                                        </div>
                                        <div className='flex justify-center items-center gap-4'>
                                            <div className="flex items-center gap-1">
                                                <p className="font-bold text-sky-600">{seguidores}</p>
                                                <p>seguidores</p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <p className="font-bold text-sky-600">{seguidos}</p>
                                                <p>seguidos</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {currentUser?.isPro && <p className='my-3 text-gray-400 text-lg'>Usuario Pro</p>}

                                <div className="mb-6 max-w-md mx-auto md:mx-0">
                                    <p className="text-gray-700 font-semibold mb-2 text-center md:text-left">Deportes favoritos:</p>
                                    <div className="flex gap-3 items-center justify-center md:justify-start max-sm:flex">
                                        <div className="flex items-center justify-center md:justify-start md:flex-row gap-3 max-sm:flex-col">
                                            {deportes.length > 0 ? (
                                                deportes.slice(0, 2).map((sport, i) => (
                                                    <span
                                                        key={i}
                                                        className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm font-medium shadow-sm"
                                                    >
                                                        {sport}
                                                    </span>
                                                ))
                                            ) : (
                                                <p className="text-gray-400 italic">No hay deportes seleccionados.</p>
                                            )}
                                            {deportes.length > 2 && (
                                                <button
                                                    onClick={ShowSports}
                                                    className="text-sky-600 underline text-sm font-semibold hover:text-sky-800 focus:outline-none"
                                                >
                                                    Ver todos los deportes
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="max-w-lg mx-auto md:mx-0 max-sm:w-1/2">
                                    <p className="text-gray-700 font-semibold mb-2 text-center md:text-left">Descripción:</p>
                                    <p
                                        ref={descRef}
                                        className={`text-gray-700 ${showDesc ? '' : 'truncate overflow-hidden whitespace-nowrap'}`}
                                    >
                                        {descripcion || 'Este usuario no ha agregado una descripción.'}
                                    </p>
                                    {isTruncated && (
                                        <button
                                            onClick={VerMas}
                                            className="mt-1 text-sky-600 hover:underline text-sm font-semibold focus:outline-none"
                                        >
                                            {showDesc ? 'Ver menos' : 'Ver más'}
                                        </button>
                                    )}
                                </div>

                                {currentUser.id != user.id && (
                                    <div className='max-sm:flex max-sm:justify-center'>
                                        <button
                                            onClick={() => handleFollow(user.id)}
                                            // className="bg-sky-400 p-2 w-full rounded-xl mt-4 text-white font-semibold   max-sm:w-1/2"
                                            className={`
                                                p-2 font-semibold transition duration-200 border flex items-center justify-center gap-2 w-full rounded-xl mt-4 font-semibold    max-sm:w-1/2
                                                ${
                                                estadoFollow === 'Siguiendo'
                                                    ? 'bg-gray-100 text-gray-500 border-gray-300'
                                                    : estadoFollow === 'Pendiente'
                                                    ? 'bg-white text-sky-600 border-sky-600'
                                                    : 'bg-gradient-to-r from-sky-400 to-sky-600 hover:from-sky-500 hover:to-sky-700 text-white border-sky-500'
                                                }
                                            `}
                                        >
                                            {estadoFollow}
                                        </button>
                                    </div>
                                )}
                                
                            </div>
                        </div>

                        {/* Publicaciones */}
                        <div className="w-full my-10">
                            {(user.privacy === false || currentUser.id === user.id) ? (
                                <>
                                    <p className="text-2xl font-bold text-gray-800 mb-6 text-center">Publicaciones</p>

                                    {/* Botones de filtro */}
                                    <div className="flex justify-center gap-4 mb-6">
                                        <button
                                            className={`px-4 py-2 rounded-lg font-medium border ${filterMode === 'all' ? 'bg-sky-300 text-white' : 'bg-white text-sky-300 border-sky-300'}`}
                                            onClick={() => setFilterMode('all')}
                                        >
                                            Todo
                                        </button>
                                        <button
                                            className={`px-4 py-2 rounded-lg font-medium border ${filterMode === 'media' ? 'bg-sky-300 text-white' : 'bg-white text-sky-300 border-sky-300'}`}
                                            onClick={() => setFilterMode('media')}
                                        >
                                            Con Imagen o Video
                                        </button>
                                        <button
                                            className={`px-4 py-2 rounded-lg font-medium border ${filterMode === 'text' ? 'bg-sky-300 text-white' : 'bg-white text-sky-300 border-sky-300'}`}
                                            onClick={() => setFilterMode('text')}
                                        >
                                            Solo Texto
                                        </button>
                                    </div>

                                    {/* Contenido */}
                                    {posts.length === 0 ? (
                                        <p className="text-center text-gray-500 italic">Este usuario no tiene publicaciones aún.</p>
                                    ) : (
                                        <>
                                            {/* Solo con media o "todos" */}
                                            {(filterMode === 'media' || filterMode === 'all') && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-center">
                                                    {posts.filter(p => p.file).map((post) => (
                                                        <div
                                                            key={post.id}
                                                            className="relative cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-white"
                                                            onClick={() => openPopup(post)}
                                                        >
                                                            {post.file.endsWith('.mp4') ? (
                                                                <video
                                                                    src={`http://localhost:5227/${post.file}`}
                                                                    className="w-full h-60 object-cover"
                                                                    muted
                                                                    loop
                                                                    playsInline
                                                                />
                                                            ) : (
                                                                <img
                                                                    src={`http://localhost:5227/${post.file}`}
                                                                    alt="Post"
                                                                    className="w-full h-60 object-cover"
                                                                />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Separador si es modo "todos" */}
                                            {filterMode === 'all' && (
                                                <div className="my-10 border-t border-gray-300 w-4/5 mx-auto"></div>
                                            )}

                                            {/* Solo texto o "todos" */}
                                            {(filterMode === 'text' || filterMode === 'all') && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-center">
                                                    {posts.filter(p => !p.file).map((post) => (
                                                        <div
                                                            key={post.id}
                                                            className="relative cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-white p-4"
                                                            onClick={() => openPopup(post)}
                                                        >
                                                            <div className="text-gray-700 font-medium truncate max-h-60 overflow-hidden">
                                                                {post.content}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                        </>
                                    )}
                                </>
                            ) : (
                                <p className="w-full text-center font-semibold text-4xl my-14 max-sm:my-10">Este perfil es privado.</p>
                            )}
                        </div>

                        {/* Popup publicaciones */}
                        {isPopupVisible && selectedPost && (
                            <PostById
                                post={selectedPost}
                                closePopup={closePopup}
                                currentUser={currentUser}
                            />
                        )}

                        {/* Lista de deportes completa en pop-up */}
                        {isSportsVisible && (
                            <div id="deportes" className="fixed inset-0 flex items-center justify-center bg-gray-200 bg-opacity-80 p-4 z-50">
                                <div className="block bg-white rounded-2xl p-6 w-full max-w-sm h-fit">
                                    <div className="flex justify-end">
                                        <img src="/resources/cerrar.png" alt="cerrar popup" className="w-4 cursor-pointer" onClick={ShowSports} />
                                    </div>
                                    <div className="text-center">
                                        {deportes.map((sport, index) => (
                                            <p key={index} className="mb-4">{sport}</p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <IrArriba />

        </div>
    );
};

export default UserCard;