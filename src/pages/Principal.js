import UserRecommendation from '../components/UserRecommendation';
import Header from '../components/Header';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Comments from './CommentsManagement/Comments';
import { useUser } from '../components/UserContext';
import api from '../api';
import IrArriba from '../components/IrArriba';

import toast from 'react-hot-toast';

const Principal = () => {
   const { currentUser } = useUser();
   const [postsSeguidos, setPostsSeguidos] = useState([]);
   const [visibleComments, setVisibleComments] = useState({});
   const [mostrarRecomendaciones, setMostrarRecomendaciones] = useState(false);

   const cargarPostsSeguidos = async (userId) => {
      try {
         const response = await api.get(`/posts/followedPosts`, {
         params: { userId }
         });

         const posts = response.data;

         const postsConUsuarios = await Promise.all(posts.map(async (post) => {
         try {
            const userResponse = await api.get(`/users/${post.userId}`);
            return {
               ...post,
               user: userResponse.data,
            };
         } catch (err) {
            console.error(`Error cargando el usuario para el post ${post.id}:`, err);
            return post;
         }
         }));

         setPostsSeguidos(postsConUsuarios);
      } catch (error) {
         console.error('Error al cargar posts de seguidos:', error);
      }
  };


   useEffect(() => {
      if (!currentUser) {
         setPostsSeguidos([]);
      } else {
         cargarPostsSeguidos(currentUser.id);
      }
   }, [currentUser]);


   const handleLikeClick = async (postId) => {
      const updatedPosts = await Promise.all(postsSeguidos.map(async (p) => {
        if (p.id === postId) {
          const updatedPost = { ...p };

          try {
            if (!updatedPost.isLiked) {
              await api.post(`/likes/post/${postId}`, null, {
                params: { userId: currentUser.id }
              });
              updatedPost.isLiked = true;
              updatedPost.likes += 1;
            } else {
              await api.delete(`/likes/post/${postId}`, {
                params: { userId: currentUser.id }
              });
              updatedPost.isLiked = false;
              updatedPost.likes -= 1;
            }
          } catch (error) {
            console.error("Error al actualizar el like:", error);
          }

          return updatedPost;
        }

        return p;
      }));

      setPostsSeguidos(updatedPosts);
   };

   const handleAddComment = (postId) => {
      setPostsSeguidos((prevPosts) =>
         prevPosts.map((post) => {
            if (post.id === postId) {
               return { ...post, commentsCount: post.commentsCount + 1 };
            }
            return post;
         })
      );
   };

   const handleDelComment = (postId) => {
      setPostsSeguidos((prevPosts) =>
         prevPosts.map((post) => {
            if (post.id === postId) {
               return { ...post, commentsCount: post.commentsCount - 1 };
            }
            return post;
         })
      );
   };

   return (
      <div className="min-h-screen bg-white font-sans text-gray-900">
         <Header />
         {!currentUser ? (
            <p className="text-center text-3xl text-gray-500 mt-24 font-semibold">
               Debe iniciar sesión para acceder a esta página.
            </p>
         ) : (
            <div className="flex justify-between px-6 py-10 gap-8 max-n950:flex-col max-n950:px-4 max-n950:py-6">
               {/* Recomendaciones */}
               <div className="w-80 shrink-0 max-n950:hidden">
                  <UserRecommendation onFollowChange={() => cargarPostsSeguidos(currentUser.id)} />
               </div>
               {/* Botón para desplegar recomendaciones en móviles */}
               <div className="n950:hidden px-4 mb-4">
                  <button
                     onClick={() => setMostrarRecomendaciones(!mostrarRecomendaciones)}
                     className="w-full bg-sky-500 text-white font-semibold py-2 px-4 rounded-xl shadow-md hover:bg-sky-600 transition"
                  >
                     {mostrarRecomendaciones ? 'Ocultar sugerencias' : 'Ver sugerencias'}
                  </button>
                  {mostrarRecomendaciones && (
                     <div className="mt-4">
                        <UserRecommendation onFollowChange={() => cargarPostsSeguidos(currentUser.id)} />
                     </div>
                  )}
               </div>

               {/* Centro: Publicaciones */}
               <div className="w-full">
               {postsSeguidos.length > 0 ? (
                  postsSeguidos.map((post) => (
                     <div key={post.id} className="bg-white rounded-3xl shadow-lg mb-10 p-6 max-w-3xl mx-auto border border-sky-300">
                     {/* Header del post */}
                     <div className="flex items-center gap-4 mb-5">
                        <img
                           src={post.user.foto_perfil ? `http://localhost:5227/${post.user.foto_perfil}` : '/resources/foto_perfil_default.png'}
                           alt={post.user.userName}
                           className="w-12 h-12 rounded-full object-cover object-top border-2 border-sky-400 shadow-md"
                        />
                        <div className='block'>
                           <Link
                              to={`/user/${post.user.id}`}
                              state={{ currentUser }}
                              className="text-lg font-semibold text-sky-600 hover:text-sky-800 transition cursor-pointer"
                           >
                              @{post.user.userName}
                           </Link>
                           {post.isAnuncio && ( <p className='text-gray-400'>Anuncio sobre {post.deporteRelacionado}</p>)}
                        </div>
                     </div>

                     {/* Imagen o video */}
                     {post.file && post.mediaType === 'image' && (
                        <div className="mb-5 flex justify-center">
                           <img
                           src={`http://localhost:5227/wwwroot${post.file}`}
                           alt="Post media"
                           className="rounded-2xl max-w-full max-h-72 object-cover object-center shadow-lg border-4 border-sky-400"
                           />
                        </div>
                     )}

                     {post.file && post.mediaType === 'video' && (
                        <div className="mb-5 flex justify-center">
                           <video
                           src={`http://localhost:5227/wwwroot${post.file}?t=${new Date().getTime()}`}
                           controls
                           className="rounded-2xl max-w-full max-h-72 object-cover object-center shadow-lg border-4 border-sky-400"
                           />
                        </div>
                     )}

                     {/* Contenido */}
                     <p className={`${post.file ? 'max-h-28' : 'max-h-40'} text-gray-800 text-lg mb-4 overflow-y-auto whitespace-pre-wrap`}>
                        {post.content}
                     </p>

                     {/* Likes y comentarios */}
                     <div className="flex items-center gap-6">
                        <button onClick={() => handleLikeClick(post.id)} className="flex items-center gap-2 focus:outline-none">
                           <img
                           src={post.isLiked ? '/resources/like.png' : '/resources/dislike.png'}
                           alt={post.isLiked ? 'Liked' : 'Not liked'}
                           className="w-6 h-6 cursor-pointer hover:scale-110 transition-transform"
                           />
                           <span className="text-gray-700 font-semibold">{post.likes}</span>
                        </button>

                        <button onClick={() => {
                           setVisibleComments(prev => ({
                           ...prev,
                           [post.id]: !prev[post.id]
                           }));
                        }} className="flex items-center gap-2 focus:outline-none">
                           <img
                           src="/resources/mensajes.png"
                           alt="Comments"
                           className="w-6 h-6 cursor-pointer hover:scale-110 transition-transform"
                           />
                           <span className="text-gray-700 font-semibold">{post.commentsCount}</span>
                        </button>
                     </div>

                     {/* Comentarios */}
                     {visibleComments[post.id] && (
                        <div className="mt-6">
                           <Comments
                           postId={post.id}
                           currentUser={currentUser}
                           postCreatorId={post.userId}
                           updateCommentsCount={(postId, action) => {
                              if (action === 'add') handleAddComment(postId);
                              else if (action === 'delete') handleDelComment(postId);
                           }}
                           />
                        </div>
                     )}
                     </div>
                  ))
               ) : (
                  <p className="text-center font-semibold text-3xl text-gray-400 mt-28 max-w-2xl mx-auto">
                     Aquí se mostrarán las publicaciones de los usuarios a los que sigas.
                  </p>
               )}
               </div>
            </div>
         )}

         <IrArriba />

      </div>
   );
};

export default Principal;
