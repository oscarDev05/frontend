import React, { createContext, useState, useEffect, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(() => {
        // Intentamos recuperar el usuario desde sessionStorage al cargar la app
        const storedUser = sessionStorage.getItem('currentUser');
        if (storedUser) {
            try {
                return JSON.parse(storedUser);
            } catch (error) {
                console.error('Error parsing user from sessionStorage:', error);
                sessionStorage.removeItem('currentUser'); // Limpiamos si hay error
            }
        }
        return null;
    });

    const [tempUserEdit, setTempUserEdit] = useState(null);

    // Actualizamos sessionStorage cada vez que `currentUser` cambia
    useEffect(() => {
        if (currentUser) {
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        } else {
            sessionStorage.removeItem('currentUser'); // Eliminamos si el usuario se desloguea
        }
    }, [currentUser]);

    return (
        <UserContext.Provider value={{
            currentUser,
            setCurrentUser,
            tempUserEdit,
            setTempUserEdit
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
