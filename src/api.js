import axios from 'axios';

const API_URL = 'https://backend-dayk.onrender.com/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true // <-- Esto es imprescindible para que se envíen cookies o credenciales entre dominios
});

export default api;
