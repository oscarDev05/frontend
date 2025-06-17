import React, { useState, useEffect } from 'react';
import api from '../../api';

const Comments = ({ postId, currentUser, postCreatorId, updateCommentsCount }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        const loadComments = async () => {
            try {
                const response = await api.get(`/posts/${postId}/comments`);
                setComments(response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
                console.log('Comentarios cargados.');
            } catch (error) {
                console.error('Error al cargar los comentarios:', error);
            }
        };

        loadComments();
    }, [postId]);

    const handleAddComment = async () => {
        if (!currentUser) {
            console.error('Usuario no autenticado.');
            return;
        }

        if (newComment.trim() !== '') {
            try {
                const response = await api.post(`/posts/${postId}/comments`, {
                    content: newComment,
                    postId,
                    userId: currentUser.id
                });
                setComments([response.data, ...comments]);
                setNewComment('');
                updateCommentsCount(postId, 'add');
                console.log('Comentario añadido con éxito.');
            } catch (error) {
                console.error('Error al agregar el comentario:', error);
            }
        }
    };

    const handleDelComment = async (postId, commentId) => {
        try {
            await api.delete(`/posts/${postId}/comments/${commentId}`);
            setComments((prev) => prev.filter((c) => c.id !== commentId));
            updateCommentsCount(postId, 'delete');
            console.log("Comentario eliminado con éxito.");
        } catch (error) {
            console.error('Error al eliminar el comentario:', error);
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                {comments?.length > 0 ? comments.map(comment => (
                    <div key={comment.id} className="flex items-start justify-between gap-2 bg-sky-50 p-3 rounded-xl shadow-sm border border-sky-100">
                        <div className="flex gap-3">
                            <img
                                src={comment.user?.foto_perfil ? `http://localhost:5227/${comment.user?.foto_perfil}?t=${new Date().getTime()}` : '/resources/foto_perfil_default.png'}
                                className="w-10 h-10 rounded-full object-cover object-top border border-sky-300"
                                alt="Foto de perfil"
                            />
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-semibold text-gray-800">@{comment.user?.userName ?? 'Usuario de FitLife'}</p>
                                    <span className="text-xs text-gray-400">
                                        {new Date(comment.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                            </div>
                        </div>

                        {(comment.userId === currentUser.id || currentUser.id === postCreatorId) && (
                            <img
                                src="/resources/papelera1.png"
                                className="w-5 h-5 mt-1 cursor-pointer hover:scale-110 transition-transform"
                                alt="Eliminar comentario"
                                onClick={() => handleDelComment(comment.postId, comment.id)}
                            />
                        )}
                    </div>
                )) : (
                    <p className="text-center text-gray-400 italic">Este post todavía no tiene comentarios.</p>
                )}
            </div>

            <div className="flex items-start gap-3">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                        // Si es Shift + Enter, no hace nada y deja que inserte salto de línea
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault(); // Evita salto de línea si solo presiona Enter
                            handleAddComment();
                        }
                    }}
                    placeholder="Escribe un comentario..."
                    rows={2}
                    className="flex-1 resize-none border border-gray-300 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
                <button onClick={handleAddComment}>
                    <img
                        src="/resources/enviar.png"
                        alt="Enviar"
                        className="w-6 h-6 mt-4 hover:scale-110 transition-transform"
                    />
                </button>
            </div>

        </div>
    );
};

export default Comments;
