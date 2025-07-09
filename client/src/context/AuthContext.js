import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedId = localStorage.getItem('userId');
    const storedEmail = localStorage.getItem('userEmail');
    const token = localStorage.getItem('token');
    const storedProfilePic = localStorage.getItem('profilePic');
    return storedId && storedEmail && token
      ? { id: storedId, email: storedEmail, token, profilePic: storedProfilePic }
      : { id: null, email: null, token: null, profilePic: null };
  });

  const login = (id, email, token, profilePic) => {
    localStorage.setItem('userId', id);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('token', token);
    localStorage.setItem('profilePic', profilePic);
    setUser({ id, email, token, profilePic });
  };


  const logout = () => {
    localStorage.clear();
    setUser({ id: null, email: null, token: null });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
