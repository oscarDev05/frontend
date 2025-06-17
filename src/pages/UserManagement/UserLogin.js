import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';
import { useUser } from '../../components/UserContext';

const UserLogin = () => {
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [showPasswd, setShowPasswd] = useState(false);
    const navigate = useNavigate();

    const { setCurrentUser } = useUser();

    const handleLogin = async (event) => {
        event.preventDefault();
    
        try {
            const userResponse = await api.get('Users/check', {
                params: { userName: username, passwd: password },
            });
    
            if (userResponse.status === 200) {
                setCurrentUser(userResponse.data);
                localStorage.setItem('currentUser', JSON.stringify(userResponse.data));
                navigate('/principal');
            }
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            document.getElementsByTagName('input')[0].style.borderColor = 'red';
            document.getElementsByTagName('input')[1].style.borderColor = 'red';
            alert('Usuario o contraseña incorrectos.');
        }
    };

    function Mostrar_Ocultar_Passwd() {
        setShowPasswd(!showPasswd);
    }
    

    return (
        <div className="flex justify-center items-center h-screen inset-0 max-n480:m-4">
            <div className="block">
                <div className="block border-2 p-5 max-n480:border-0 max-n480:p-0">
                    <img
                        src="/resources/nombre_aplicacion.jpg"
                        alt="Nombre Aplicación"
                        width="400px"
                        className="mr-4"
                    />
                    <form className="w-full mb-4" onSubmit={handleLogin}>
                        <div className="block mb-2">
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Nombre de usuario"
                                className="w-full p-4 border-2"
                            />
                        </div>
                        <div className="flex justify-between mb-6 gap-2">
                            <input
                                type={showPasswd ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Contraseña"
                                className="w-full p-4 border-2"
                            />
                            <img
                                src={showPasswd ? '/resources/mostrarPasswd.png' : '/resources/ocultarPasswd.png'}
                                alt="mostrar contraseña"
                                onClick={Mostrar_Ocultar_Passwd}
                                className="max-w-6 w-6 h-6 mt-4 cursor-pointer"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full block text-center p-5 bg-sky-400 rounded-lg font-bold text-white"
                        >
                            INICIAR SESIÓN
                        </button>
                    </form>
                </div>
                <div className="flex gap-2 border-2 mt-5 p-5 max-n480:border-0 max-n480:m-0 max-n480:p-0">
                    <p className="text-lg">¿No tienes una cuenta?</p>
                    <Link
                        to="/register"
                        className="text-lg text-sky-400 cursor-pointer hover:underline font-bold"
                    >
                        Regístrate
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default UserLogin;
