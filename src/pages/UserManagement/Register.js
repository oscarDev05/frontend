import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';

const Register = () => {
    const [showPasswd, setShowPasswd] = useState(false);

    const [showInfo, setShowInfo] = useState(false);
    const info = 'Los usuarios con perfil Pro pueden compartir anuncios con todos los usuarios a los que les interese el deporte del que trata el anuncio, intercambiar mensajes con cualquier usuario sin necesidad de que se sigan mutuamente y tienen prioridad para salir recomendados a otros usuarios.';
    
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        password: '',
        isPro: false
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await api.get('/Users/checkRegister', {
                params: { userName: userData.name, email: userData.email },
            });

            // Si el usuario NO existe, lo redirige con los datos
            if (!response.data) {
                setUserData(userData); // Guardamos los datos en el contexto
                navigate('/sportslist', { state: { user: userData } });
            } else {
                alert('El usuario o el correo ya están en uso.');
            }
        } catch (error) {
            console.error('Error al verificar usuario:', error);
            document.querySelectorAll('input').forEach(input => input.style.borderColor = 'red');
            alert('Hubo un error al verificar el usuario.');
        }
    };

    function Mostrar_Ocultar_Passwd() {
        setShowPasswd(!showPasswd);
    }

    return (
        <div className="flex justify-center items-center h-screen inset-0 max-n480:m-4">
            <div className="block">
                <div className="block border-2 p-5 max-n480:border-0 max-n480:p-0">
                    <img src="/resources/nombre_aplicacion.jpg" alt="Nombre Aplicación" width="400px" className="mr-4" />
                    <form className="w-full mb-4" onSubmit={handleSubmit}>
                        <div className="block">
                            <input
                                type="text"
                                name="name"
                                value={userData.name}
                                onChange={handleChange}
                                placeholder="Nombre de usuario"
                                className="w-full p-4 border-2 mb-4"
                                required
                            />
                        </div>
                        <div className="block">
                            <input
                                type="email"
                                name="email"
                                value={userData.email}
                                onChange={handleChange}
                                placeholder="Correo electrónico"
                                className="w-full p-4 border-2 mb-4"
                                required
                            />
                        </div>
                        <div className="flex justify-between gap-2">
                            <input
                                type={showPasswd ? 'text' : 'password'}
                                name="password"
                                value={userData.password}
                                onChange={handleChange}
                                placeholder="Contraseña"
                                className="w-full p-4 border-2 mb-4"
                                required
                            />
                            <img
                                src={showPasswd ? '/resources/mostrarPasswd.png' : '/resources/ocultarPasswd.png'}
                                alt="mostrar contraseña"
                                onClick={Mostrar_Ocultar_Passwd}
                                className="max-w-6 w-6 h-6 mt-4 cursor-pointer"
                            />
                        </div>
                        <div className='flex justify-start gap-4 mb-4'>
                            <div className='flex justify-start gap-2'>
                                <p className="font-semibold">Cuenta Pro</p>
                                <img
                                    src="/resources/interrogante.png"
                                    className="w-4 h-4 cursor-pointer mt-1"
                                    onClick={() => setShowInfo(!showInfo)}
                                    alt="info"
                                />
                            </div>
                            <input 
                                type='checkbox'
                                checked={userData.isPro} 
                                onChange={(e) =>
                                    setUserData((prevData) => ({
                                        ...prevData,
                                        isPro: e.target.checked
                                    }))
                                }
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full block text-center p-5 bg-sky-400 rounded-lg font-bold text-white"
                        >
                            CONTINUAR
                        </button>
                    </form>
                </div>
                <div className="flex gap-2 border-2 mt-5 p-5 max-n480:border-0 max-n480:p-0">
                    <p className="text-lg">¿Tienes una cuenta?</p>
                    <Link
                        to="/login"
                        className="text-lg text-sky-400 cursor-pointer hover:underline font-bold"
                    >
                        Iniciar sesión
                    </Link>
                </div>
            </div>

            {showInfo && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <p className="font-semibold text-lg">Información sobre el usuario Pro</p>
                            <img
                                src="/resources/cerrar.png"
                                alt="cerrar popup"
                                className="w-4 h-4 cursor-pointer"
                                onClick={() => setShowInfo(!showInfo)}
                            />
                        </div>
                        <p className="text-gray-600">{info}</p>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Register;
