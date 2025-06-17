import { useRef, useEffect, useState } from 'react';
import Header from '../../components/Header';
import { useUser } from '../../components/UserContext';
import api from '../../api';
import jsPDF from 'jspdf';
import IrArriba from '../../components/IrArriba';

const Rutinas = () => {
    const { currentUser } = useUser();
    
    const deportesYEjercicios = [
        { deporte: 'Fútbol', ejercicios: ['Driblar', 'Tiro a puerta', 'Pase corto', 'Regate'] },
        { deporte: 'Gimnasio', ejercicios: ['Sentadilla', 'Flexiones', 'Peso muerto', 'Press de banca'] },
        { deporte: 'Balonmano', ejercicios: ['Tiro a portería', 'Pase', 'Desmarque', 'Defensa individual'] },
        { deporte: 'Natación', ejercicios: ['Estilo libre', 'Mariposa', 'Espalda', 'Braza'] },
        { deporte: 'Tenis', ejercicios: ['Saque', 'Golpe de derecha', 'Golpe de revés', 'Volea'] },
        { deporte: 'Baseball', ejercicios: ['Bateo', 'Lanzamiento', 'Fildeo', 'Robos de base'] },
        { deporte: 'Rugby', ejercicios: ['Pase largo', 'Tackle', 'Ruck', 'Garra'] },
        { deporte: 'Baile', ejercicios: ['Baile de salsa', 'Baile de tango', 'Baile de hip-hop', 'Baile de bachata'] },
        { deporte: 'Calistenia', ejercicios: ['Dominadas', 'Flexiones', 'Fondos', 'Plancha']}
    ];

    const [deporteSeleccionado, setDeporteSeleccionado] = useState('');
    const [ejercicios, setEjercicios] = useState([]);
    const [file, setFile] = useState(null);
    const [fileType, setFileType] = useState(null);
    const inputFileRef = useRef(null);
    const [mostrarRecomendaciones, setMostrarRecomendaciones] = useState(false);

    const recomendacionesRef = useRef();
    const botonRecomendacionesRef = useRef();

    
    useEffect(() => {
        const loadEjercicios = async () => {
            if (currentUser) {
                const response = await api.get("/users/getEjercicios", {
                    params: {userId: currentUser.id}
                });

                if(response.data != null && response.data.length > 0){
                    setEjercicios(response.data)
                    console.log("Ejercicios del usuario cargados.")
                }
            }
        }
        loadEjercicios()
    }, [currentUser, ejercicios.length]);

    const handleDeporteChange = (e) => {
        setDeporteSeleccionado(e.target.value);
    };

    const AddEjercicio = async () => {
        const ejercicioInput = document.getElementsByTagName('input')[0];
        const seriesInput = document.getElementsByTagName('input')[1];
        const repeticionesInput = document.getElementsByTagName('input')[2];

        if (!ejercicioInput.value || !seriesInput.value || !repeticionesInput.value) {
            alert('Debe rellenar todos los campos para añadir el ejercicio a la rutina.');
            return;
        }

        const formData = new FormData();
        formData.append('userId', currentUser.id);
        formData.append('name', ejercicioInput.value);
        formData.append('sets', parseInt(seriesInput.value));
        formData.append('repetitions', repeticionesInput.value);

        if (inputFileRef.current.files[0]) {
            formData.append('file', inputFileRef.current.files[0]);
        }

        try {
            const response = await api.post("/users/addEjercicio", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const ejercicioDevuelto = response.data;
            const ejercicioParaMostrar = {
                name: ejercicioDevuelto.name,
                sets: ejercicioDevuelto.sets,
                repetitions: ejercicioDevuelto.repetitions,
                id: ejercicioDevuelto.id,
                file: ejercicioDevuelto.file // asegúrate que este campo es el correcto
            };

            setEjercicios((prev) => [...prev, ejercicioParaMostrar]);
            console.log("Ejercicio añadido correctamente.");

            // Limpiar inputs
            ejercicioInput.value = '';
            seriesInput.value = '';
            repeticionesInput.value = '';

            // Limpiar archivo
            if (inputFileRef.current) {
                inputFileRef.current.value = '';
            }
            setFile(null);
            setFileType(null);

        } catch (error) {
            console.error("Error al añadir el ejercicio:", error);
        }
    };


    const modEjercicio = async (ejercicio) => {
        try {
            const response = await api.post("/users/modEjercicio", null, {
                params: {
                    id: ejercicio.id,
                    name: ejercicio.name,
                    sets: ejercicio.sets,
                    repetitions: ejercicio.repetitions
                }
            });

            const ejercicioModificado = response.data;

            // Actualizar el estado del frontend con la versión actualizada
            setEjercicios((prevEjercicios) =>
                prevEjercicios.map((e) =>
                    e.id === ejercicioModificado.id ? ejercicioModificado : e
                )
            );

            console.log("Ejercicio modificado correctamente.");
        } catch (error) {
            console.error("Error al modificar el ejercicio:", error);
        }
    };


    const delEjercicio = async (ejId) => {
        try {
            await api.delete("/users/delEjercicio", {
                params: {id: ejId},
            });

            setEjercicios(prev => prev.filter(e => e.id !== ejId));

            console.log("Ejercicio eliminado correctamente.");
        } catch (error) {
            console.error("Error al añadir el ejercicio:", error);
        }
    }

    const ejerciciosFiltrados = deportesYEjercicios.find(
        (deporte) => deporte.deporte === deporteSeleccionado
    )?.ejercicios;

    const descargarPDF = async () => {
        document.body.style.cursor = "wait";

        const doc = new jsPDF();
        doc.setFontSize(30);
        doc.text('Rutina de Ejercicios', 20, 20);
        doc.setFontSize(16);

        if (ejercicios.length === 0) {
            doc.text('No tienes ejercicios en tu rutina.', 20, 40);
        } else {
            let y = 40;
            let count = 1;

            for (const ejercicio of ejercicios) {
                const imagenAltura = 60;
                const espacioNecesario = Math.max(imagenAltura, 30) + 10;

                // Verificar si hay espacio suficiente antes de imprimir este bloque
                if (y + espacioNecesario > 280) {
                    doc.addPage();
                    y = 20;
                }

                doc.setFontSize(14);
                doc.text(`${count}. ${ejercicio.name}`, 20, y);
                y += 8;
                doc.setFontSize(12);
                doc.text(`Series: ${ejercicio.sets}`, 25, y);
                y += 6;
                doc.text(`Repeticiones: ${ejercicio.repetitions}`, 25, y);

                // Mostrar imagen
                const imagenX = 100;
                const imagenY = y - 20;

                if (ejercicio.file && ejercicio.file.match(/jpg|jpeg|png|webp/i)) {
                    const imageUrl = `http://localhost:5227/wwwroot/${ejercicio.file}`;
                    try {
                        const imageData = await getImageDataUrl(imageUrl);
                        doc.addImage(imageData, 'JPEG', imagenX, imagenY, 45, imagenAltura);
                    } catch (error) {
                        console.error(`No se pudo cargar la imagen de ${ejercicio.name}:`, error);
                    }
                }

                y += espacioNecesario;
                count++;
            }
        }

        document.body.style.cursor = "default";
        doc.save('rutina.pdf');
    };

    const getImageDataUrl = (url) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous'; // Asegura acceso a la imagen

            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const dataURL = canvas.toDataURL('image/jpeg');
                resolve(dataURL);
            };

            img.onerror = (err) => {
                reject(err);
            };

            img.src = url;
        });
    };

    const abrirExplorador = () => {
        inputFileRef.current.click();
    };

    const manejarArchivo = (event) => {
        setFileType('')
        const archivoSeleccionado = event.target.files[0];
        if (archivoSeleccionado) {
            const reader = new FileReader();

            // Verifica si el archivo es una imagen o un video.
            if (archivoSeleccionado.type.startsWith('image/')) {
                setFileType('image');
            } else if (archivoSeleccionado.type.startsWith('video/')) {
                setFileType('video');
            } else {
                setFileType(null);
            }

            reader.onloadend = () => {
                setFile(reader.result);
            };
            reader.readAsDataURL(archivoSeleccionado);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                recomendacionesRef.current &&
                !recomendacionesRef.current.contains(event.target) &&
                botonRecomendacionesRef.current &&
                !botonRecomendacionesRef.current.contains(event.target)
            ) {
                setMostrarRecomendaciones(false);
                setDeporteSeleccionado(null);
            }
        };

        if (mostrarRecomendaciones) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [mostrarRecomendaciones]);


    return (
        <div className="min-h-screen pb-10">
            <Header />
            {!currentUser ? (
                <p className="text-center text-3xl text-gray-500 mt-32">Debe iniciar sesión para acceder a esta página.</p>
            ) : (
                <div className="flex w-full gap-5 px-6 max-lg:block max-lg:gap-0">
                    {/* Formulario lateral */}
                    <div className="block w-1/3 max-lg:w-full">
                        <form className="w-full bg-white rounded-2xl shadow-lg p-6 text-base border     max-lg:border-0 max-lg:border-b-4 max-lg:pb-8">
                            <p className="text-xl font-bold mb-4 text-sky-700">Añade un nuevo ejercicio a la rutina</p>
                            <input className="mb-4 w-full p-2 border border-gray-300 rounded" type="text" placeholder="Ejercicio" />
                            <input className="mb-4 w-full p-2 border border-gray-300 rounded" type="number" placeholder="Series" />
                            <input className="mb-4 w-full p-2 border border-gray-300 rounded" type="text" placeholder="Repeticiones" />

                            <div className='flex justify-center'>
                                {file && fileType === 'image' && 
                                    <img src={file} className="w-40 max-h-52 object-contain rounded-lg shadow" />
                                }
                                {file && fileType === 'video' &&
                                    <video controls className="max-h-52 object-contain rounded-lg shadow" src={file} />
                                }
                            </div>

                            <div className='w-full flex justify-center gap-4 my-4'>
                                <button
                                    type="button"
                                    className="bg-sky-400 hover:bg-sky-500 transition-colors text-white font-semibold px-4 py-2 rounded"
                                    onClick={abrirExplorador}
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
                            </div>

                            <button
                                type="button"
                                className="bg-sky-500 hover:bg-sky-600 transition-colors text-white font-semibold p-2 w-full rounded"
                                onClick={AddEjercicio}
                            >
                                Añadir ejercicio
                            </button>
                        </form>

                        <button onClick={descargarPDF} className="bg-sky-500 hover:bg-sky-600 transition-colors text-white font-semibold text-lg mt-6 p-2 w-full rounded shadow">
                            Descargar rutina en PDF
                        </button>

                        {/* Recomendaciones */}
                        <button
                            ref={botonRecomendacionesRef}
                            onClick={() => {
                                setMostrarRecomendaciones(prev => !prev);
                                setDeporteSeleccionado(null);
                            }}
                            className="fixed top-28 right-6 z-50 bg-sky-100 rounded-full w-10 h-10 p-2 hover:bg-sky-300 transition-colors text-white font-semibold shadow-lg"
                        >
                            <img src='/resources/rutina.png' alt='Recomendaciones de ejercicios'/>
                        </button>

                        {mostrarRecomendaciones && (
                            <div ref={recomendacionesRef} className="fixed top-28 right-20 z-40 w-80 bg-white rounded-2xl shadow-lg p-6 border  max-lg:right-20 max-lg:w-1/2    max-n480:w-full max-n480:inset-x-0 max-n480:top-2xl max-n480:mt-6">
                                <p className="text-xl font-bold mb-4 text-sky-700">Ejercicios recomendados por deporte</p>

                                <label htmlFor="deporte" className="block mb-2 text-lg font-semibold">Selecciona un deporte:</label>
                                <select
                                    id="deporte"
                                    className="w-full border border-gray-300 p-2 rounded mb-4"
                                    onChange={handleDeporteChange}
                                    value={deporteSeleccionado}
                                >
                                    <option value="">Seleccione un deporte</option>
                                    {deportesYEjercicios.map((deporte, index) => (
                                        <option key={index} value={deporte.deporte}>{deporte.deporte}</option>
                                    ))}
                                </select>

                                {deporteSeleccionado && ejerciciosFiltrados ? (
                                    <div>
                                        <p className="text-lg font-semibold mb-2">{deporteSeleccionado}</p>
                                        <ul className="list-disc ml-6 text-gray-700">
                                            {ejerciciosFiltrados.map((ejercicio, idx) => (
                                                <li key={idx}>{ejercicio}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic">Selecciona un deporte para ver los ejercicios.</p>
                                )}
                            </div>
                        )}

                    </div>

                    {/* Ejercicios agregados */}
                    <div className="w-full flex justify-center max-lg:mt-6">
                        <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-h-[32rem] flex flex-col">
                            <h2 className="text-xl font-bold text-sky-700 mb-4">Ejercicios añadidos</h2>
                            <div className="grid grid-cols-2 gap-6 h-full overflow-y-auto max-n1200:grid-cols-1">
                                {ejercicios.length > 0 ? ejercicios.map((ejercicio, index) => (
                                    <div key={index} className="border p-4 rounded-lg shadow-sm bg-gray-50">
                                        <div className='flex gap-4'>
                                            <div className='w-2/3 space-y-2'>
                                                <div>
                                                    <p className="font-semibold">Ejercicio:</p>
                                                    <input
                                                        className="w-full border rounded px-2 py-1"
                                                        value={ejercicio.name}
                                                        onChange={(e) => {
                                                            const nuevosEjercicios = [...ejercicios];
                                                            nuevosEjercicios[index].name = e.target.value;
                                                            setEjercicios(nuevosEjercicios);
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="font-semibold">Series:</label>
                                                    <input
                                                        className="w-full border rounded px-2 py-1"
                                                        type="number"
                                                        value={ejercicio.sets}
                                                        onChange={(e) => {
                                                            const nuevosEjercicios = [...ejercicios];
                                                            nuevosEjercicios[index].sets = parseInt(e.target.value);
                                                            setEjercicios(nuevosEjercicios);
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="font-semibold">Repeticiones:</label>
                                                    <input
                                                        className="w-full border rounded px-2 py-1"
                                                        type="text"
                                                        value={ejercicio.repetitions}
                                                        onChange={(e) => {
                                                            const nuevosEjercicios = [...ejercicios];
                                                            nuevosEjercicios[index].repetitions = e.target.value;
                                                            setEjercicios(nuevosEjercicios);
                                                        }}
                                                    />
                                                </div>
                                                <div className='flex gap-2 mt-2'>
                                                    <button onClick={() => modEjercicio(ejercicio)} className='bg-sky-400 hover:bg-sky-500 text-white px-3 py-1 rounded'>Modificar</button>
                                                    <button onClick={() => delEjercicio(ejercicio.id)} className='bg-red-400 hover:bg-red-500 text-white px-3 py-1 rounded'>Eliminar</button>
                                                </div>
                                            </div>
                                            
                                            {ejercicio.file && (
                                                <div className="mt-4">
                                                    <div className="w-full max-h-80 rounded-xl overflow-hidden shadow-lg border border-slate-200">
                                                    {ejercicio.file.match(/\.mp4$/i) ? (
                                                        <video
                                                            src={`http://localhost:5227/wwwroot/${ejercicio.file}`}
                                                            className="w-full h-auto max-h-80 object-contain bg-black"
                                                            controls
                                                            muted
                                                            loop
                                                            />
                                                    ) : ejercicio.file.match(/\.(jpg|png|webp)$/i) ? (
                                                        <img
                                                            src={`http://localhost:5227/wwwroot/${ejercicio.file}`}
                                                            className="w-full max-w-96 h-auto object-contain bg-white"
                                                        />
                                                    ) : null}
                                                    </div>
                                                </div>
                                                )}

                                        </div>
                                    </div>
                                )) : (
                                    <p className='text-center text-xl text-gray-500'>No tienes ningún ejercicio todavía.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <IrArriba />
            
        </div>
    );
};

export default Rutinas;