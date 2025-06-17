import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import { useUser } from '../../components/UserContext';
import api from '../../api';
import Confirmacion from '../../components/Confirmacion';
import IrArriba from '../../components/IrArriba';

const ModPerfil = () => {
    const { currentUser, setCurrentUser } = useUser(); // Obtener currentUser desde el contexto
    const [localUser, setLocalUser] = useState(currentUser);

    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    
    const [fotoPerfil, setFotoPerfil] = useState(() => {
        if (!currentUser?.foto_perfil || currentUser.foto_perfil.includes('foto_perfil_default')) {
          return 'http://localhost:5227/wwwroot/users_images/foto_perfil_default.png';
        }
        
        // Si ya es una URL completa, usarla directamente
        if (currentUser.foto_perfil.startsWith('http://')) {
          return currentUser.foto_perfil;
        }
        
        // Si es solo el nombre del archivo (ej: "7.jpg")
        if (!currentUser.foto_perfil.includes('/')) {
          return `http://localhost:5227/wwwroot/users_images/${currentUser.foto_perfil}?t=${new Date().getTime()}`;
        }
        
        // Si contiene parte de la ruta, extraer solo el nombre del archivo
        const filename = currentUser.foto_perfil.split('/').pop();
        return `http://localhost:5227/wwwroot/users_images/${filename}?t=${new Date().getTime()}`;
    });
    const [username, setUsername] = useState(localUser?.userName || '');
    const [email, setEmail] = useState(localUser?.email || '');
    const [password, setPassword] = useState(localUser?.password || '');
    const [description, setDescription] = useState(localUser?.description || '');
    const [isPrivate, setIsPrivate] = useState(localUser?.privacy || false);
    const [isPro, setIsPro] = useState(localUser?.isPro || false);

    const navigate = useNavigate();
    const inputFileRef = useRef(null);
    
    const [showPasswd, setShowPasswd] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [fadeOut, setFadeOut] = useState(false);

    const location = useLocation();

    const [showInfo, setShowInfo] = useState(false);
    const info = 'Si un perfil es público, tanto seguidores como desconocidos podrán ver todo lo que publicas mientras que si el perfil es privado, únicamente podrán ver tus publicaciones tus seguidores.';
    const infoPopupRef = useRef(null);

    const [showInfoPro, setShowInfoPro] = useState(false);
    const infoPro = 'Los usuarios con perfil Pro pueden compartir anuncios con todos los usuarios a los que les interese el deporte del que trata el anuncio, intercambiar mensajes con cualquier usuario sin necesidad de que se sigan mutuamente y tienen prioridad para salir recomendados a otros usuarios.';
    const infoProPopupRef = useRef(null);

    const [emailError, setEmailError] = useState(false);

    const abrirExplorador = () => {
        inputFileRef.current.click();
    };

    const manejarImagen = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFotoPerfil(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    function Mostrar_Ocultar_Passwd() {
        setShowPasswd(!showPasswd);
    }

    const Save = async (newUser) => {
        try {
            const response = await api.put("/users/UpdateUser", newUser, {
                headers: { "Content-Type": "application/json" },
            });
            // Actualizar el contexto y localStorage
            sessionStorage.setItem('currentUser', JSON.stringify(response.data));
            setCurrentUser(response.data);
        
            window.scrollTo({ top: 0, behavior: 'smooth' });
        
            setFadeOut(false);
            setSuccessMessage('Los datos se han guardado correctamente.');
            setTimeout(() => setFadeOut(true), 2500);
            setTimeout(() => setSuccessMessage(''), 3000);
        
            setTimeout(() => navigate('/perfil', {user: response.data}), 3000);
        } catch (error) {
            console.error('Error al guardar:', error);
            alert('Error al guardar los cambios');
        }
    };

    
    const GuardarDatos = async () => {
        if (!username || !email || !password) {
            alert('Debe rellenar todos los campos.');
            return;
        }
    
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('El correo no tiene el formato correcto.');
            return;
        }

        const newUser = {
            ...currentUser,
            userName: username,
            email: email,
            password: password,
            description: description,
            privacy: isPrivate,
            isPro: isPro,
            foto_perfil: fotoPerfil,
            lista_deportes: localUser.lista_deportes
        };
    
        try {
            if((newUser.userName !== currentUser.userName) || (newUser.email !== currentUser.email)){
                const response = await api.get(`/Users/checkUpdate?id=${newUser.id}&userName=${newUser.userName}&email=${newUser.email}`);
                const result = await response.data
    
                if (result.exists) {
                    if (result.userNameExists) {
                      alert("El nombre de usuario ya está en uso.");
                    }
                
                    if (result.emailExists) {
                      alert("El correo electrónico ya está en uso.");
                    }
                } else {
                    Save(newUser)
                }
            } else {
                Save(newUser)
            }                  
        } catch (error) {
            console.error('Error al actualizar el usuario:', error);
        }
    };
    
    const cerrar_sesion = () => {
        setCurrentUser(null)
        sessionStorage.removeItem('currentUser')
        navigate("/")
    }

    const delCuenta = async () => {
        try{
            await api.delete(`/users/${currentUser.id}`);
            console.log('Usuario eliminado con éxito.')
            cerrar_sesion()
        }catch (error) {
            console.error('No se ha podido eliminar al usuario: ', error)
        }
    }

    const open_close_popup = () => {
        setShowInfo(!showInfo);
    };

    const open_mod_sports = () => {
        const newUser = {
          ...currentUser,
          userName: username,
          email: email,
          password: password,
          description: description,
          privacy: isPrivate,
          isPro: isPro,
          foto_perfil: fotoPerfil,
          lista_deportes: currentUser.lista_deportes
        };
        navigate('/modsports', { state: { user: newUser } });
    };
    
    
    useEffect(() => {
        const userFromReturn = location.state?.user;
        if (userFromReturn) {
            setLocalUser(userFromReturn)

            // Procesar la foto correctamente
            let processedFoto;
            if (!userFromReturn.foto_perfil || userFromReturn.foto_perfil.includes('foto_perfil_default')) {
                processedFoto = 'http://localhost:5227/wwwroot/users_images/foto_perfil_default.png';
            } else if (userFromReturn.foto_perfil.startsWith('http://')) {
                processedFoto = userFromReturn.foto_perfil;
            } else if (userFromReturn.foto_perfil.startsWith('data:')) {
                processedFoto = userFromReturn.foto_perfil;
            } else {
                // Extraer solo el nombre del archivo si contiene rutas
                const filename = userFromReturn.foto_perfil.split('/').pop();
                processedFoto = `http://localhost:5227/wwwroot/users_images/${filename}?t=${new Date().getTime()}`;
            }
            setFotoPerfil(processedFoto);
            setUsername(userFromReturn.userName)
            setEmail(userFromReturn.email)
            setPassword(userFromReturn.password)
            setDescription(userFromReturn.description)
            setIsPrivate(userFromReturn.privacy)
            setIsPro(userFromReturn.isPro)
        }
    }, [location.state?.timestamp]);

    const confirmarEliminacion = () => {
        setMostrarConfirmacion(true);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showInfo && infoPopupRef.current && !infoPopupRef.current.contains(event.target)) {
                setShowInfo(false);
            }
            if (showInfoPro && infoProPopupRef.current && !infoProPopupRef.current.contains(event.target)) {
                setShowInfoPro(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showInfo, showInfoPro]);

    
    return (
        <div className="min-h-screen">
            <Header />
            {!currentUser ? (
                <p className="text-center text-3xl text-gray-500 mt-10">Debe iniciar sesión para acceder a esta página.</p>
            ) : (
                <div className="flex justify-center items-start py-10">
                    <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 max-md:w-11/12">

                        {successMessage && (
                            <div className={`mb-4 text-center text-lg font-semibold text-white bg-green-400 rounded-md p-2 transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
                                {successMessage}
                            </div>
                        )}

                        <h2 className="text-center text-3xl font-bold mb-6 border-b pb-4">Datos de la cuenta</h2>

                        {/* Foto de perfil */}
                        <div className="mb-8">
                            <p className="text-lg font-semibold text-center mb-2">Foto de perfil</p>
                            <div className="flex justify-center mb-4">
                                <img
                                    src={fotoPerfil}
                                    alt="Foto de perfil"
                                    className="w-32 h-32 rounded-full object-cover object-top border"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'http://localhost:5227/wwwroot/users_images/foto_perfil_default.png';
                                    }}
                                />
                            </div>
                            <div className="flex justify-center gap-4">
                                <button
                                    className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded"
                                    onClick={() => setFotoPerfil('RESET_TO_DEFAULT')}
                                >
                                    Eliminar foto
                                </button>
                                <div>
                                    <button
                                        className="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-4 py-2 rounded"
                                        onClick={abrirExplorador}
                                    >
                                        Cambiar foto
                                    </button>
                                    <input
                                        ref={inputFileRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={manejarImagen}
                                    />
                                </div>
                            </div>
                        </div>

                        <form className="space-y-6">
                            <div>
                                <label className="block font-semibold mb-1">Nombre de usuario</label>
                                <input
                                    type="text"
                                    className={`w-full p-2 border rounded ${username === '' ? 'border-red-600 bg-red-100' : 'border-gray-300'}`}
                                    value={username}
                                    name="username"
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Correo electrónico</label>
                                <input
                                    type="text"
                                    className={`w-full p-2 border rounded ${email === '' ? 'border-red-600 bg-red-100' : 'border-gray-300'}`}
                                    value={email}
                                    name="email"
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                {emailError && <p className="text-red-600 text-sm mt-1">Correo inválido</p>}
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Contraseña</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type={showPasswd ? 'text' : 'password'}
                                        className={`p-2 w-full border rounded ${password === '' ? 'border-red-600 bg-red-100' : 'border-gray-300'}`}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        name="passwd"
                                    />
                                    <img
                                        src={showPasswd ? '/resources/mostrarPasswd.png' : '/resources/ocultarPasswd.png'}
                                        alt="Mostrar contraseña"
                                        onClick={Mostrar_Ocultar_Passwd}
                                        className="w-6 h-6 cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Descripción sobre ti</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={description}
                                    name="Description"
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <div className='flex justify-start gap-2'>
                                    <p className="font-semibold">¿Cuenta privada?</p>
                                    <img
                                        src="/resources/interrogante.png"
                                        className="w-4 h-4 cursor-pointer"
                                        onClick={open_close_popup}
                                        alt="info"
                                    />
                                </div>
                                <input
                                    type="checkbox"
                                    checked={isPrivate}
                                    onChange={(e) => setIsPrivate(e.target.checked)}
                                />
                            </div>
                            
                            <div className='flex justify-start gap-4 mb-4'>
                                <div className='flex justify-start gap-2'>
                                    <p className="font-semibold">Cuenta Pro</p>
                                    <img
                                        src="/resources/interrogante.png"
                                        className="w-4 h-4 cursor-pointer mt-1"
                                        onClick={() => setShowInfoPro(!showInfoPro)}
                                        alt="info"
                                    />
                                </div>
                                <input 
                                    type='checkbox'
                                    checked={isPro} 
                                    onChange={(e) => setIsPro(e.target.checked)}
                                />
                            </div>
                        </form>

                        <div className="my-6 text-center">
                            <button
                                onClick={open_mod_sports}
                                className="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-6 py-2 rounded"
                            >
                                Cambiar deportes de interés
                            </button>
                        </div>

                        <div className="flex justify-between gap-4 mb-6">
                            <button
                                onClick={cerrar_sesion}
                                className="w-1/2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded"
                            >
                                Cerrar sesión
                            </button>
                            <button
                                onClick={GuardarDatos}
                                className="w-1/2 bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 rounded"
                            >
                                Guardar cambios
                            </button>
                        </div>

                        <button
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded"
                            onClick={confirmarEliminacion}
                        >
                            Eliminar cuenta
                        </button>
                    </div>

                    {showInfo && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                            <div ref={infoPopupRef} className="bg-white rounded-xl p-6 w-full max-w-md">
                                <div className="flex justify-between items-center mb-4">
                                    <p className="font-semibold text-lg">Información sobre privacidad</p>
                                    <img
                                        src="/resources/cerrar.png"
                                        alt="cerrar popup"
                                        className="w-4 h-4 cursor-pointer"
                                        onClick={open_close_popup}
                                    />
                                </div>
                                <p className="text-gray-600">{info}</p>
                            </div>
                        </div>
                    )}

                    {showInfoPro && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                            <div ref={infoProPopupRef} className="bg-white rounded-xl p-6 w-full max-w-md">
                                <div className="flex justify-between items-center mb-4">
                                    <p className="font-semibold text-lg">Información sobre el usuario Pro</p>
                                    <img
                                        src="/resources/cerrar.png"
                                        alt="cerrar popup"
                                        className="w-4 h-4 cursor-pointer"
                                        onClick={() => setShowInfoPro(!showInfoPro)}
                                    />
                                </div>
                                <p className="text-gray-600">{infoPro}</p>
                            </div>
                        </div>
                    )}

                    {mostrarConfirmacion && (
                        <Confirmacion
                            mensaje="¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer pero tus likes y comentarios seguirán existiendo aunque sin dar datos personales de ningún tipo."
                            onConfirm={() => {
                                setMostrarConfirmacion(false);
                                delCuenta();
                            }}
                            onCancel={() => setMostrarConfirmacion(false)}
                        />
                    )}
                </div>
            )}

            <IrArriba />

        </div>
    );
};

export default ModPerfil;