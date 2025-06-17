import { useState, useEffect, useRef } from 'react';
import Comments from '../pages/CommentsManagement/Comments';
import api from '../api';
import Confirmacion from './Confirmacion';
import { Link } from 'react-router-dom';

const PostById = ({ post, closePopup, currentUser, onPostDeleted }) => {
  const [user, setUser] = useState(null);
  const [isCreator, setIsCreator] = useState(false);
  const [currentPost, setCurrentPost] = useState(post);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0); // Asegurar que no sea undefined
  const [isTruncated, setIsTruncated] = useState(false);
  const [showDesc, setShowDesc] = useState(false);
  const descRef = useRef(null);
  const [content, setContent] = useState('');
  const [visibleComments, setVisibleComments] = useState({});

  const popupRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        closePopup(); // Cierra el popup si haces clic fuera
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const confirmarEliminacion = () => {
    setMostrarConfirmacion(true);
  };

  const handleLikeClick = async () => {
    try {
      if (!currentPost) return;

      const updatedIsLiked = !currentPost.isLiked;

      if (updatedIsLiked) {
        await api.post(`/likes/post/${currentPost.id}`, null, { params: { userId: currentUser.id } });
      } else {
        await api.delete(`/likes/post/${currentPost.id}`, { params: { userId: currentUser.id } });
      }

      // Actualizar el estado local sin necesidad de volver a pedir el post
      setCurrentPost(prev => ({
        ...prev,
        isLiked: updatedIsLiked,
        likes: updatedIsLiked ? [...prev.likes, { userId: currentUser.id }] : prev.likes.filter(l => l.userId !== currentUser.id)
      }));
    } catch (error) {
      console.error("Error al dar/retirar like:", error);
    }
  };

  const VerMas = () => {
    setShowDesc(!showDesc);
  };

  async function Eliminar() {
    try {
      await api.delete(`/posts/${currentPost.id}`);
      console.log("Post eliminado con éxito.");
      if (onPostDeleted) onPostDeleted(currentPost.id); // Notificar al padre
      closePopup(); // Cierra el modal
    } catch (error) {
      console.error('Error al eliminar el post:', error);
    }
  }

  useEffect(() => {
    async function loadPostAndUser() {
      try {
        if (!post?.id) return;
        const postResponse = await api.get(`/posts/${post.id}`);
        const updatedPost = postResponse.data;
  
        const userResponse = await api.get(`/users/${updatedPost.userId}`);
        setUser(userResponse.data);
  
        setIsCreator(updatedPost.userId === currentUser.id);
  
        const userLike = updatedPost.likes?.find(like => like.userId === currentUser.id);
  
        setCurrentPost({
          ...updatedPost,
          isLiked: !!userLike,
          likes: Array.isArray(updatedPost.likes) ? updatedPost.likes : []
        });
  
        const commentsResponse = await api.get(`/posts/${updatedPost.id}/comments`);
        const commentsCount = commentsResponse.data.length;
        setCommentsCount(commentsCount);
  
        setContent(updatedPost.content);
  
      } catch (error) {
        console.error('Error al cargar post y usuario:', error);
      }
    }
  
    loadPostAndUser();
  }, [post.id, currentUser.id]);
  

  useEffect(() => {
    const el = descRef.current;
    if (el) {
      requestAnimationFrame(() => {
        const overflowed = el.scrollWidth > el.clientWidth;
        setIsTruncated(overflowed);
      });
    }
  }, [content]);

  const handleAddComment = (postId) => {
    if (currentPost.id === postId) {
      setCommentsCount(prev => prev + 1);  // Incrementar el contador de comentarios
      return { ...currentPost, commentsCount: currentPost.commentsCount + 1 };
    }
    return currentPost;
  };
  
  const handleDelComment = (postId) => {
    if (currentPost.id === postId) {
      setCommentsCount(prev => prev - 1);  // Decrementar el contador de comentarios
      return { ...currentPost, commentsCount: currentPost.commentsCount - 1 };
    }
    return currentPost;
  };
  


  return (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-200 bg-opacity-80 p-4 z-50 overflow-auto">
    <div
      key={currentPost.id}
      ref={popupRef}
      className="bg-white rounded-3xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-lg
                 md:w-3/4 sm:w-5/6"
    >
      <div className={`w-full flex ${isCreator ? 'justify-between' : 'justify-end'} mb-6`}>
        {isCreator && (
          <img
            src={'/resources/papelera1.png'}
            alt="Eliminar publicación"
            className="w-6 h-6 cursor-pointer hover:opacity-70 transition"
            onClick={confirmarEliminacion}
          />
        )}
        <img
          src="/resources/cerrar.png"
          alt="Cerrar popup"
          className="w-6 h-6 cursor-pointer hover:opacity-70 transition"
          onClick={closePopup}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className={`${visibleComments[post.id] ? 'md:w-1/2' : 'w-full'} flex flex-col`}>
          <div className="flex items-center gap-4 mb-6">
            <img
              src={
                user?.foto_perfil
                  ? `http://localhost:5227/${user?.foto_perfil}?t=${new Date().getTime()}`
                  : '/resources/foto_perfil_default.png'
              }
              alt="Foto perfil"
              className="w-16 h-16 rounded-full object-cover object-top shadow-md"
            />
            
            <div className='block'>
              <Link
                to={`/user/${user?.id}`}
                state={{ currentUser }}
                className="text-lg font-semibold text-sky-600 hover:text-sky-800 transition cursor-pointer"
              >
                @{user?.userName}
              </Link>
              {post.isAnuncio && ( <p className='text-gray-400'>Anuncio sobre {post.deporteRelacionado}</p>)}
            </div>
          </div>

          {currentPost.file && currentPost.mediaType === 'image' && !showDesc && (
            <div className="w-full flex justify-center mb-6">
              <img
                src={`http://localhost:5227/wwwroot${currentPost.file}?t=${new Date().getTime()}`}
                alt="Post imagen"
                className="rounded-xl max-w-full max-h-[360px] object-contain shadow-sm"
              />
            </div>
          )}

          {currentPost.file && currentPost.mediaType === 'video' && !showDesc && (
            <div className="w-full flex justify-center mb-6">
              <video
                src={`http://localhost:5227/wwwroot${currentPost.file}?t=${new Date().getTime()}`}
                controls
                autoPlay
                className="rounded-xl max-w-full max-h-[360px] object-cover shadow-sm"
              />
            </div>
          )}

          <div className="flex flex-col">
            <p
              ref={descRef}
              className={`text-lg text-gray-700 mb-2 ${
                currentPost.file
                  ? showDesc
                    ? 'max-h-[360px] overflow-y-auto'
                    : 'truncate whitespace-nowrap overflow-hidden'
                  : 'max-h-[360px] overflow-y-auto'
              }`}
              style={{ transition: 'all 0.3s ease' }}
            >
              {content}
            </p>

            {isTruncated && currentPost.file && (
              <button
                onClick={VerMas}
                className="text-sky-600 hover:text-sky-700 font-semibold transition self-start"
              >
                {showDesc ? 'Ver menos' : 'Ver más'}
              </button>
            )}

            <div className="flex items-center gap-6 mt-4 text-gray-600">
              <button onClick={handleLikeClick} className="flex items-center gap-2 hover:text-emerald-600 transition">
                <img
                  src={currentPost.isLiked ? '/resources/like.png' : '/resources/dislike.png'}
                  alt="Like"
                  className="w-6 h-6"
                />
                <span>{currentPost.likes?.length || 0}</span>
              </button>

              <button
                onClick={() =>
                  setVisibleComments((prev) => ({
                    ...prev,
                    [post.id]: !prev[post.id],
                  }))
                }
                className="flex items-center gap-2 hover:text-sky-600 transition"
              >
                <img src="/resources/mensajes.png" alt="Comentarios" className="w-6 h-6" />
                <span>{commentsCount}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sección comentarios */}
        <div className={`${visibleComments[post.id] ? 'md:w-1/2' : 'hidden'}`}>
          {visibleComments[currentPost.id] && (
            <Comments
              postId={currentPost.id}
              currentUser={currentUser}
              postCreatorId={post.userId}
              updateCommentsCount={(postId, action) => {
                if (action === 'add') {
                  handleAddComment(postId);
                } else if (action === 'delete') {
                  handleDelComment(postId);
                }
              }}
            />
          )}
        </div>
      </div>

      {/* Confirmación eliminación */}
      {mostrarConfirmacion && (
        <Confirmacion
          mensaje="¿Estás seguro de que deseas eliminar la publicación? Esta acción no se puede deshacer."
          onConfirm={() => {
            setMostrarConfirmacion(false);
            Eliminar();
          }}
          onCancel={() => setMostrarConfirmacion(false)}
        />
      )}
    </div>
  </div>
);

};

export default PostById;
