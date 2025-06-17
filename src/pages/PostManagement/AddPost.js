import React, { useRef, useState } from 'react';
import { useUser } from '../../components/UserContext';
import IrArriba from '../../components/IrArriba';
import api from '../../api';
import Header from '../../components/Header';

const AddPost = () => {
    const { currentUser } = useUser();

    const [content, setContent] = useState('');
    const [archivo, setArchivo] = useState(null);
    const [fileType, setFileType] = useState(null);
    const deportesInteres = currentUser?.lista_deportes
        ? currentUser.lista_deportes.split(',')
        : [];

    const [isAnuncio, setIsAnuncio] = useState(false);
    const [selectedSport, setSelectedSport] = useState('');

    const [successMessage, setSuccessMessage] = useState('');
    const [fadeOut, setFadeOut] = useState(false);

    const inputFileRef = useRef(null);

    const handleAddPost = async (event) => {
        event.preventDefault();
        if (!content) {
            console.log("Error al añadir la publicación.");
            alert('Debe rellenar el campo descripción obligatoriamente.')
            return;
        }
    
        const newPost = {
            content: content,
            userId: currentUser.id,
            isAnuncio: isAnuncio,
        };

        if (isAnuncio && currentUser.isPro && selectedSport) {
            newPost.deporteRelacionado = selectedSport;
        }else if(isAnuncio && currentUser.isPro && !selectedSport){
            alert('Debe seleccionar un deporte relacionado para su anuncio.');
            return;
        }
    
        // Solo añadir la propiedad "image" si existe un archivo
        if (archivo) {
            newPost.file = archivo;
        }
    
        try {
            console.log(newPost.deporteRelacionado)
            await api.post('http://localhost:5227/api/posts', newPost);

            // Confirmación
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setFadeOut(false);
            setSuccessMessage('La publicación se ha añadido correctamente.');
            setTimeout(() => setFadeOut(true), 2500);
            setTimeout(() => setSuccessMessage(''), 3000);
            
            setContent('');
            setArchivo(null);
            setFileType('')
            setIsAnuncio(false)

        } catch (error) {
            console.error('Error adding post:', error);
            alert('No se ha podido añadir correctamente.')
        }
    }

    const abrirExplorador = () => {
        inputFileRef.current.click();
    };

    const manejarArchivo = (event) => {
        const archivoSeleccionado = event.target.files[0];
        if (!archivoSeleccionado) {
            // Si canceló la selección, limpiamos estado para que se muestre el cuadro
            setArchivo(null);
            setFileType(null);
            return;
        }
        
        setFileType('');
        
        if (archivoSeleccionado.type.startsWith('image/')) {
            setFileType('image');
        } else if (archivoSeleccionado.type.startsWith('video/')) {
            setFileType('video');
        } else {
            setFileType(null);
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setArchivo(reader.result);
        };
        reader.readAsDataURL(archivoSeleccionado);
    };


    return (
        <div
            className="min-h-screen bg-white font-sans text-gray-900 relative overflow-hidden"
            style={{
                backgroundImage:
                    "linear-gradient(135deg, transparent 60%, rgba(14,165,233,0.25) 100%)",
            }}
        >
            <Header />
            {!currentUser ? (
                <p className="text-center text-4xl font-extrabold mt-24 text-sky-700 drop-shadow-lg">
                    Debe iniciar sesión para acceder a esta página.
                </p>
            ) : (
                <div>
                    {successMessage && (
                        <div className={`mb-4 text-center text-lg font-semibold text-white bg-green-400 rounded-md p-2 transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
                            {successMessage}
                        </div>
                    )}
                    <div className="max-w-5xl max-h-[600px] mx-auto bg-white bg-opacity-90 rounded-3xl shadow-2xl p-10 flex flex-col md:flex-row md:gap-10 items-stretch max-sm:p-6 max-sm:items-center max-sm:justify-center relative z-10">
                        {/* Cuadro de imagen/video */}
                        <div className="flex justify-center items-center md:w-1/2 max-sm:w-full self-stretch">
                            {archivo && fileType === "image" && (
                                <img
                                    src={archivo}
                                    alt="Previsualización"
                                    className="rounded-2xl w-full h-full object-cover shadow-[0_8px_30px_rgba(14,165,233,0.6)] border-8 border-sky-400 transition-transform hover:scale-105"
                                />
                            )}
                            {archivo && fileType === "video" && (
                                <video
                                    controls
                                    src={archivo}
                                    className="rounded-2xl w-full h-full object-cover shadow-[0_8px_30px_rgba(14,165,233,0.6)] border-8 border-sky-400 transition-transform hover:scale-105"
                                />
                            )}
                            {!archivo && (
                                <div className="flex items-center justify-center w-full h-full border-4 border-dashed border-sky-400 rounded-2xl text-sky-500 text-2xl font-semibold select-none p-4 text-center">
                                    No ha seleccionado ningún archivo.
                                </div>
                            )}
                        </div>

                        {/* Formulario */}
                        <div className="md:w-1/2 max-sm:w-full flex flex-col">
                            <form onSubmit={handleAddPost} className="flex flex-col gap-6 h-full">
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Descripción"
                                    rows="5"
                                    className="resize-none rounded-2xl p-5 border-4 border-sky-300 bg-white text-gray-900 placeholder-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-500 focus:border-sky-600 shadow-lg transition"
                                />

                                {currentUser.isPro && (
                                    <div className='w-fit flex items-center gap-3'>
                                        <label className="text-sky-700 font-semibold text-lg">
                                            ¿Es un anuncio?
                                        </label>
                                        <input
                                            type="checkbox"
                                            checked={isAnuncio}
                                            onChange={(e) => setIsAnuncio(e.target.checked)}
                                            className="accent-sky-500 w-5 h-5"
                                        />
                                    </div>
                                )}

                                {currentUser.isPro && isAnuncio && (
                                    <div>
                                        <label className="block text-sky-700 font-semibold text-lg mb-2">
                                            Selecciona un deporte
                                        </label>
                                        <select
                                            value={selectedSport}
                                            onChange={(e) => setSelectedSport(e.target.value)}
                                            className="w-full p-3 border-4 border-sky-300 rounded-2xl text-gray-800 bg-white shadow-md focus:outline-none focus:ring-4 focus:ring-sky-500 focus:border-sky-600 transition"
                                        >
                                            <option value="">-- Selecciona un deporte --</option>
                                            {deportesInteres.map((deporte, index) => (
                                                <option key={index} value={deporte}>
                                                    {deporte}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="flex gap-6 max-sm:flex-col max-sm:gap-4 mt-auto">
                                    <button
                                        type="button"
                                        onClick={abrirExplorador}
                                        className="flex-1 bg-gradient-to-r from-sky-400 to-sky-600 hover:from-sky-500 hover:to-sky-700 transition text-white font-extrabold py-4 rounded-3xl shadow-xl hover:shadow-[0_8px_20px_rgba(14,165,233,0.8)] focus:outline-none focus:ring-6 focus:ring-sky-400"
                                    >
                                        Cambiar foto/video
                                    </button>

                                    <input
                                        ref={inputFileRef}
                                        type="file"
                                        accept="image/*,video/*"
                                        className="hidden"
                                        onChange={manejarArchivo}
                                    />

                                    <button
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-sky-400 to-sky-600 hover:from-sky-500 hover:to-sky-700 transition text-white font-extrabold py-4 rounded-3xl shadow-xl hover:shadow-[0_8px_20px_rgba(14,165,233,0.8)] focus:outline-none focus:ring-6 focus:ring-sky-400"
                                    >
                                        Añadir publicación
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <IrArriba />

        </div>
    );
};

export default AddPost;
