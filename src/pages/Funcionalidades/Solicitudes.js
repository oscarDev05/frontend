import { useEffect, useState } from 'react';
import { useUser } from '../../components/UserContext';
import Header from '../../components/Header';
import api from '../../api';
import IrArriba from '../../components/IrArriba';

const Solicitudes = () => {
    const { currentUser } = useUser();
    const [solicitudes, setSolicitudes] = useState([]);

    useEffect(() => {
        const fetchSolicitudes = async () => {
            try {
                const response = await api.get(`/follows/received?userId=${currentUser.id}`);
                setSolicitudes(response.data);
            } catch (error) {
                console.error("Error al obtener las solicitudes:", error);
            }
        };

        if (currentUser) {
            fetchSolicitudes();
        }
    }, [currentUser]);

    const aceptar = async (solId) => {
        try {
            await api.post('/follows/responderSolicitud', {
                solicitudId: solId.toString(),
                accion: "Aceptada"
            });

            setSolicitudes((prev) => prev.filter((s) => s.id !== solId));
        } catch (error) {
            console.error("Error al aceptar la solicitud:", error);
            alert("No se pudo aceptar la solicitud.");
        }
    };

    const rechazar = async (solId) => {
        try {
            await api.post('/follows/responderSolicitud', {
                solicitudId: solId.toString(),
                accion: "Rechazada"
            });

            setSolicitudes((prev) => prev.filter((s) => s.id !== solId));
        } catch (error) {
            console.error("Error al rechazar la solicitud:", error);
            alert("No se pudo rechazar la solicitud.");
        }
    };


    return (
    <div className="overflow-x-hidden">
        <Header />
        <div className="flex justify-center w-full">
            <div className="w-full max-w-4xl px-4 py-12 mx-auto flex flex-col items-center justify-center min-w-0 max-n510:py-4">
                <h1 className="text-2xl font-extrabold text-gray-900 mb-8 text-center">Solicitudes recibidas</h1>

                {solicitudes.length === 0 ? (
                    <p className="text-center text-gray-500 italic">No tienes solicitudes pendientes.</p>
                ) : (
                    <ul className="w-4/5 space-y-4">
                        {solicitudes.map((solicitud) => (
                            <li key={solicitud.id} className="bg-white p-4 rounded-lg shadow-md">

                                <div className='flex justify-around'>
                                    <div>
                                        <p className="text-gray-800 text-lg font-semibold">
                                            {solicitud.sender?.userName || 'Usuario desconocido'} quiere seguirte.
                                        </p>
                                        <p className="text-sm text-gray-500 mt-2">
                                            Enviada el {new Date(solicitud.sentAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-4 items-center">
                                        <button
                                            onClick={() => aceptar(solicitud.id)}
                                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                                        >
                                            Aceptar
                                        </button>
                                        <button
                                            onClick={() => rechazar(solicitud.id)}
                                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                                        >
                                            Rechazar
                                        </button>
                                    </div>
                                </div>
                                
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
        <IrArriba />
    </div>
);

};

export default Solicitudes;
