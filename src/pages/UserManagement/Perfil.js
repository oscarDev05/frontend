import { React, useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../../components/Header';
import PostById from '../../components/PostById';
import { useUser } from '../../components/UserContext';
import api from '../../api';
import IrArriba from '../../components/IrArriba';

const Perfil = () => {
    const location = useLocation();
    const { currentUser, setCurrentUser } = useUser();

    const userId = (location.state && location.state.user && location.state.user.id) || currentUser?.id;

    const [isSportsVisible, setIsSportsVisible] = useState(false);
    const deportesRef = useRef(null);

    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);

    var [showDesc, setShowDesc] = useState(false);
    const [descripcion, setDescripcion] = useState('');
    const descRef = useRef(null);
    const [isTruncated, setIsTruncated] = useState(false);

    const [deportes, setDeportes] = useState([]);

    const [seguidores, setSeguidores] = useState(0);
    const [seguidos, setSeguidos] = useState(0);
    const [numPost, setNumPost] = useState(0);

    const [posts, setPosts] = useState([]);

    const [filterMode, setFilterMode] = useState("all"); // Por defecto se muestran solo los posts con media

    // Esta función la reemplazamos con el hook de `useUser`
    useEffect(() => {
        if (currentUser) {
            setDescripcion(currentUser.description);
            setDeportes(currentUser.lista_deportes ? currentUser.lista_deportes.split(',') : []);
        }
    }, [currentUser]);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const response = await api.get(`/users/${userId}`);
                if (response.status === 200) {
                    setCurrentUser(response.data); // Aquí actualizamos el usuario en el contexto
                } else {
                    console.error('No se encontró el usuario:', response);
                }
            } catch (error) {
                console.error('Error cargando el usuario:', error);
            }
        };

        if (userId) {
            loadUser();
        }
    }, [userId, setCurrentUser]);

    useEffect(() => {
        const loadPosts = async () => {
            try {
                const response = await api.get(`/posts/user/${userId}`);
                if (response.status === 200) {
                    setPosts(response.data);
                    setNumPost(response.data.length);
                } else {
                    console.error('No se encontraron posts:', response);
                }
            } catch (error) {
                console.error('Error cargando posts:', error);
            }
        };

        if (userId) {
            loadPosts();
        }
    }, [userId]);

    const loadFollowCounts = async () => {
        try {
            const response = await api.get(`/follows/followcount/${userId}`);
            setSeguidores(response.data.seguidores);
            setSeguidos(response.data.seguidos);
        } catch (error) {
            console.error('Error cargando seguidores/seguidos:', error);
        }
    };

    useEffect(() => {
        if (userId) {
            loadFollowCounts();
        }
    }, [userId]);

    const ShowSports = () => {
        setIsSportsVisible(!isSportsVisible);
    };

    const openPopup = (post) => {
        console.log(post)
        setSelectedPost(post);
        setIsPopupVisible(true);
    };

    const closePopup = () => {
        setIsPopupVisible(false);
        setSelectedPost(null);
    };

    const VerMas = () => {
        setShowDesc(!showDesc);
    };

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

    // Reemplaza tu función getImageUrl con esta versión mejorada
    const getImageUrl = (path) => {
        if (!path || path.includes('foto_perfil_default')) {
            return 'http://localhost:5227/wwwroot/users_images/foto_perfil_default.png';
        }
        
        // Si ya es una URL completa (como cuando viene de ModPerfil)
        if (path.startsWith('http://')) {
            return path;
        }
        
        // Si es una ruta relativa del backend
        if (path.startsWith('../wwwroot')) {
            return `http://localhost:5227/${path.replace('../', '')}`;
        }
        
        // Para cualquier otro caso (ruta relativa sin ../)
        return `http://localhost:5227/${path}`;
    };  

    useEffect(() => {
        const handleClickOutsideDeportes = (e) => {
            if (deportesRef.current && !deportesRef.current.contains(e.target)) {
                setIsSportsVisible(false);
            }
        };

        if (isSportsVisible) {
            document.addEventListener("mousedown", handleClickOutsideDeportes);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutsideDeportes);
        };
    }, [isSportsVisible]);



    return (
        <div className="overflow-x-hidden">
            <Header />
            {!currentUser ? (
                <p className="text-center text-3xl text-gray-500 mt-32">
                    Debe iniciar sesión para acceder a esta página.
                </p>
            ) : (
                <div className='flex justify-center w-full'>
                    <div className="w-full max-w-4xl px-4 py-12 mx-auto flex flex-col items-center justify-center   min-w-0     max-n510:py-4">
                        {/* Header perfil */}
                        <div className="flex flex-col items-center gap-10 mb-16 w-full      md:items-start md:flex-row md:gap-20 max-n510:mb-0">
                            <img
                                src={getImageUrl(currentUser?.foto_perfil) + `?t=${new Date().getTime()}`}
                                alt="Foto de perfil"
                                className="w-40 h-40 rounded-full object-cover object-top border-4 border-sky-400 shadow-md     max-n510:w-32 max-n510:h-32"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-4 mb-4 justify-center     md:justify-start">
                                    <h1 className="text-4xl font-extrabold text-gray-900">{currentUser?.userName}</h1>
                                    <Link to="/modperfil" state={{ user: currentUser }} aria-label="Modificar perfil">
                                        <img
                                            src="/resources/modPerfil.png"
                                            alt="Modificar perfil"
                                            className="w-7 h-7 hover:opacity-80 transition-opacity"
                                        />
                                    </Link>
                                </div>

                                <div className="flex justify-center md:justify-start">
                                    <div className="flex gap-8 text-md font-semibold text-gray-700 flex-wrap    max-n510:block max-n510:items-center max-n510:gap-0">
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
                                                    <p
                                                        key={i}
                                                        className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm font-medium shadow-sm"
                                                    >
                                                        {sport}
                                                    </p>
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
                            </div>
                        </div>

                        {/* Publicaciones */}
                        <div className="w-full my-10">
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
                                    Multimedia
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
                        </div>

                        {/* Pop-up de post */}
                        {isPopupVisible && selectedPost && (
                            <PostById 
                                post={selectedPost} 
                                closePopup={closePopup} 
                                currentUser={currentUser}
                                onPostDeleted={(deletedPostId) => {
                                    setPosts(prev => prev.filter(p => p.id !== deletedPostId));
                                    setNumPost(prev => prev - 1);
                                }}
                            />
                        )}

                        {/* Lista de deportes completa en pop-up */}
                        {isSportsVisible && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4">
                                <div
                                    ref={deportesRef}
                                    className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm animate-fade-in"
                                >
                                    {/* Botón de cerrar */}
                                    <div className="flex justify-end">
                                        <button onClick={ShowSports} aria-label="Cerrar popup" className="text-gray-500 hover:text-gray-700">
                                            ✕
                                        </button>
                                    </div>

                                    <h2 className="text-lg font-semibold text-center text-gray-800 mb-4">Deportes favoritos</h2>

                                    {deportes.length > 0 ? (
                                        <div className="flex flex-wrap gap-3 justify-center">
                                            {deportes.map((sport, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm font-medium shadow-sm"
                                                >
                                                    {sport}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-center text-gray-400 italic">No hay deportes seleccionados.</p>
                                    )}
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

export default Perfil;