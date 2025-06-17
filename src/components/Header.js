import { Link, useLocation } from 'react-router-dom';

const Header = () => {

    return(
        <div className="flex my-5 items-center justify-between w-full">
            {/* Logo (se reduce pero nunca desaparece) */}
            <img
                src="/resources/nombre_aplicacion.jpg"
                alt="Nombre Aplicación"
                className="object-contain w-[100px] sm:w-[130px] md:w-[150px] max-w-[150px] h-auto max-sm:hidden"
            />

            {/* Menú con texto (pantallas grandes) */}
            <div className="w-full flex justify-between items-center gap-3 max-sm:hidden">
                <Link to="/principal" className="flex-1 text-center hover:bg-sky-200 font-semibold p-3">
                Inicio
                </Link>
                <Link to="/buscador" className="flex-1 text-center hover:bg-sky-200 font-semibold p-3">
                <img src="/resources/lupa.png" alt="Buscador" className="w-8 h-8 m-auto object-contain" />
                </Link>
                <Link to="/rutinas" className="flex-1 text-center hover:bg-sky-200 font-semibold p-3">
                Rutina
                </Link>
                <Link to="/addPost" className="flex-1 text-center hover:bg-sky-200 font-semibold p-3">
                Añadir publicación
                </Link>
                <Link to="/perfil" className="flex-1 text-center hover:bg-sky-200 font-semibold p-3">
                Mi perfil
                </Link>
                <Link to="/solicitudes" className="flex-1 text-center hover:bg-sky-200 font-semibold p-3">
                <img src="/resources/dislike.png" alt="Solicitudes" className="w-8 h-8 m-auto object-contain" />
                </Link>
                <Link to="/mensajes" className="flex-1 text-center hover:bg-sky-200 font-semibold p-3">
                <img src="/resources/enviar.png" alt="Mensajes" className="w-8 h-8 m-auto object-contain" />
                </Link>
            </div>

            {/* Menú con solo íconos (pantallas pequeñas) */}
            <div className="w-full flex justify-between items-center gap-2 sm:hidden">
                <Link to="/principal" className="flex-1 flex justify-center">
                <img src="/resources/inicio.png" alt="Inicio" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
                </Link>
                <Link to="/buscador" className="flex-1 flex justify-center">
                <img src="/resources/lupa.png" alt="Buscador" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
                </Link>
                <Link to="/rutinas" className="flex-1 flex justify-center">
                <img src="/resources/rutina.png" alt="Rutinas" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
                </Link>
                <Link to="/addPost" className="flex-1 flex justify-center">
                <img src="/resources/anadirPost.png" alt="Añadir publicación" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
                </Link>
                <Link to="/perfil" className="flex-1 flex justify-center">
                <img src="/resources/perfil.png" alt="Mi perfil" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
                </Link>
                <Link to="/solicitudes" className="flex-1 flex justify-center">
                <img src="/resources/dislike.png" alt="Solicitudes" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
                </Link>
                <Link to="/mensajes" className="flex-1 flex justify-center">
                <img src="/resources/enviar.png" alt="Mensajes" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
                </Link>
            </div>
        </div>
    );
};

export default Header;