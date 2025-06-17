import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../api';
import IrArriba from '../../components/IrArriba';

const SportsList = () => {
    const location = useLocation();
    const user = location.state?.user; // Obtener los datos del usuario

    const [sports, setSports] = useState({
        Fútbol: false,
        Gimnasio: false,
        Balonmano: false,
        Ciclismo: false,
        Natación: false,
        Tenis: false,
        Baseball: false,
        Rugby: false,
        Baile: false,
        Calistenia: false
    });

    function CambiarCheckBox(sport) {
        setSports(prevSports => ({
            ...prevSports,
            [sport]: !prevSports[sport]
        }));
    }

    const handleContinue = async () => {
        const selectedSports = Object.keys(sports).filter(sport => sports[sport]);

        const newUser = {
            userName: user.name,
            email: user.email,
            password: user.password,
            isPro: user.isPro,
            Lista_deportes: selectedSports.join(',')
        };

        try {
            await api.post('/users', newUser);
            console.log("Usuario creado correctamente");
        } catch (error) {
            console.error("Error al crear el usuario", error);
            console.log("Detalles del error:", error.response?.data?.errors);
        }
    };

    return (
        <div className="flex justify-center mt-10 mb-10 px-4">
            <div className="w-full max-w-3xl bg-white border-2 border-sky-300 rounded-xl shadow-lg p-8 relative">
                <div className="flex justify-center mb-6">
                    <img
                        src="/resources/nombre_aplicacion.jpg"
                        alt="Nombre Aplicación"
                        width="320px"
                    />
                </div>

                <h2 className="text-3xl text-center text-sky-700 font-bold mb-4">Lista de deportes</h2>
                <p className="text-lg text-center text-gray-700 mb-2">
                    Tenemos una gran variedad de deportes que puedes elegir para que tus amigos sepan cuáles te gustan.
                </p>
                <p className="text-lg text-center text-gray-700 mb-6">
                    Elige los deportes que más te gusten o quieras aprender:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-lg font-semibold">
                    {Object.keys(sports).map(sport => (
                        <button
                            key={sport}
                            type="button"
                            onClick={() => CambiarCheckBox(sport)}
                            className={`w-full text-left px-5 py-3 rounded-lg border-2 transition duration-200
                                ${sports[sport]
                                    ? 'bg-sky-500 border-sky-500 text-white hover:bg-sky-600'
                                    : 'bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100 hover:text-sky-800'}`}
                        >
                            {sport}
                        </button>
                    ))}
                </div>

                <div className="flex justify-between mt-10 gap-6">
                    <Link
                        to="/register"
                        className="w-1/2 text-center py-4 rounded-lg font-bold bg-white text-sky-600 border-2 border-sky-400 hover:bg-sky-50 transition"
                    >
                        VOLVER
                    </Link>
                    <Link
                        to="/login"
                        className="w-1/2 py-4 bg-sky-500 text-white text-center font-bold rounded-lg hover:bg-sky-600 transition shadow"
                        onClick={handleContinue}
                    >
                        REGÍSTRATE
                    </Link>
                </div>
                {/* <IrArriba /> */}
            </div>
        </div>
    );
};

export default SportsList;
