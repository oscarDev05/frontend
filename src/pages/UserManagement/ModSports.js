import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import IrArriba from '../../components/IrArriba';

const ModSports = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const user = location.state?.user; // Obtener los datos del usuario con los datos ya modificados.

    const deportesDisponibles = [
        'Fútbol',
        'Gimnasio',
        'Balonmano',
        'Ciclismo',
        'Natación',
        'Tenis',
        'Baseball',
        'Rugby',
        'Baile',
        'Calistenia'
    ];

    // Convertir la lista_deportes de string a array
    const listaDeportesArray = user?.lista_deportes ? user.lista_deportes.split(',') : [];

    // Inicializar el estado de los deportes según los que ya tiene el usuario
    const [sports, setSports] = useState(() => {
        const initialState = {};
        deportesDisponibles.forEach(deporte => {
            initialState[deporte] = listaDeportesArray.includes(deporte);
        });
        return initialState;
    })

    function CambiarCheckBox(sport) {
        setSports(prevSports => ({
            ...prevSports,  // los ... son un operador de propagación, copia todas las claves y valores del estado anterior prevSports en el nuevo objeto.
            [sport]: !prevSports[sport]
        }));
    }

    const handleContinue = async () => {
        const selectedSports = Object.keys(sports).filter(sport => sports[sport]);
        const newUser = {
            ...user,
            lista_deportes: selectedSports.join(','),
            foto_perfil: user.foto_perfil
        }
        navigate('/modperfil', { 
          state: { 
            user: newUser,
            timestamp: Date.now()
          }
        });
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

                <p className="text-3xl text-center text-sky-700 font-bold mb-4">Lista de deportes</p>
                <p className="text-lg text-center text-gray-700 mb-2">
                    Tenemos una gran variedad de deportes que puedes elegir para que tus amigos sepan cuáles te gustan.
                </p>
                <p className="text-lg text-center text-gray-700 mb-6">
                    Elige los deportes que más te gusten o quieras aprender:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-lg font-semibold">
                    {deportesDisponibles.map((sport) => (
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
                        to="/modperfil"
                        state={{ user }}
                        className="w-1/2 text-center py-4 rounded-lg font-bold bg-white text-sky-600 border-2 border-sky-400 hover:bg-sky-50 transition"
                    >
                        VOLVER
                    </Link>
                    <button
                        onClick={handleContinue}
                        className="w-1/2 py-4 bg-sky-500 text-white font-bold rounded-lg hover:bg-sky-600 transition shadow"
                    >
                        ACEPTAR
                    </button>
                </div>
                {/* <IrArriba /> */}
            </div>
        </div>
    );
};

export default ModSports;