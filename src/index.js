import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom/client';
import { Link } from 'react-router-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Router, Route, Routes } from 'react-router-dom';
import { UserProvider } from './components/UserContext';
import { Toaster } from 'react-hot-toast';

import UserLogin from './pages/UserManagement/UserLogin';
import SportsList from './pages/UserManagement/SportsList';
import Register from './pages/UserManagement/Register';
import Principal from './pages/Principal';
import Rutinas from './pages/Funcionalidades/Rutinas';
import Perfil from './pages/UserManagement/Perfil';
import ModPerfil from './pages/UserManagement/ModPerfil';
import ModSports from './pages/UserManagement/ModSports';
import Mensajes from './pages/Funcionalidades/Mensajes';
import Buscador from './pages/Funcionalidades/Buscador';
import Solicitudes from './pages/Funcionalidades/Solicitudes';
import AddPost from './pages/PostManagement/AddPost';
import Comments from './pages/CommentsManagement/Comments';
import UserCard from './components/UserCard';
import ChatPage from './components/Chat/ChatPage';
import { MessageNotificationsProvider } from './components/MessageNotificationsContext';
import { UnreadMessagesProvider } from "./components/Chat/UnreadMessagesContext.js";

const App = () => {
  const [toastPosition, setToastPosition] = useState('bottom-right');
  useEffect(() => {
    const updatePosition = () => {
      if (window.innerWidth < 425) {
        setToastPosition('top-center');
      } else {
        setToastPosition('bottom-right');
      }
    };

    updatePosition(); // inicial
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
    };
  }, []);

  return (
    <UserProvider>
      {/* <Router> */}
        <Toaster
          position={toastPosition}
          toastOptions={{
            duration: 4000,  // duración de cada toast en ms
            style: {
              background: '#fff',
              color: '#000',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              borderRadius: '8px',
            },
          }}
        />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<UserLogin />} />
          <Route path="/sportslist" element={<SportsList />} />
          <Route path="/principal" element={<Principal />} />
          <Route path="/rutinas" element={<Rutinas />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/modperfil" element={<ModPerfil />} />
          <Route path="/modsports" element={<ModSports />} />
          <Route path="/mensajes" element={<Mensajes />} />
          <Route path="/addPost" element={<AddPost />} />
          <Route path="/buscador"  element={<Buscador/>}/>
          <Route path="/solicitudes"  element={<Solicitudes/>}/>
          <Route path="/comments"  element={<Comments/>}/>
          <Route path="/user/:id" element={<UserCard />} />
          <Route path="/chat/:id" element={<ChatPage />} />
        </Routes>
      {/* </Router> */}
    </UserProvider>
  );
};

const ImageCarousel = () => {
  const images = [
    '/resources/portada1.jpg',
    '/resources/portada2.jpg',
  ];
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="carousel-container">
      {images.map((image, index) => (
        <img
          key={index}
          src={image}
          alt={`Slide ${index + 1}`}
          className={`carousel-image ${index === currentImageIndex ? 'active' : ''}`}
        />
      ))}
    </div>
  );
};

const Home = () => {
  return (
    <div className="block max-sm480:m-4">
      <div className="w-full flex justify-center h-screen items-center gap-16    max-lg:gap-9  max-n480:h-fit max-n480:inset-0">

        <ImageCarousel />
        
        <div className="block border-2 px-10 py-4    lg:px-5    max-md:border-0    max-n480:p-0 max-n480:text-center">
          <img src='/resources/nombre_aplicacion.jpg' alt="Nombre Aplicación" className="mr-6    max-n400:m-0"/>
          <p className="text-3xl mb-5">¡Bienvenido/a a Fit Life!</p>
          <p className="text-xl">La red social para compartir y aprender</p>
          <p className="text-xl mb-32    max-sm480:mb-20 max-sm400:mb-16">sobre tu deporte favorito.</p>

          <div className='flex justify-center mb-2'>
            <Link
              to="/login"
              className="w-full block text-center p-5 bg-sky-400 rounded-lg font-bold text-white    max-n480:w-4/5"
            >INICIAR SESIÓN</Link>
          </div>

            <Link
              to="/register"
              className="hover:cursor-pointer text-lg text-sky-400 hover:underline font-bold"
            >
              Crea una cuenta
            </Link>
        </div>
      </div>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <UnreadMessagesProvider>
          <MessageNotificationsProvider>
            <App />
          </MessageNotificationsProvider>
        </UnreadMessagesProvider>
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);