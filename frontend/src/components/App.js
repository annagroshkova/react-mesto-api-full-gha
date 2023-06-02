import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import Register from './Register';
import { CurrentUserContext } from '../contexts/CurrentUserContext';
import { useEffect, useState } from 'react';
import ProtectedRoute from './ProtectedRoute';
import { getToken, removeToken, saveToken } from '../utils/storage';
import { api } from '../utils/api';

export default function App() {
  const navigate = useNavigate();
  const [token, setToken] = useState(/** @type {string | null} */ getToken());
  const [currentUser, setCurrentUser] = useState(
    /** @type {import("../types").UserObject | {}} */ {},
  );

  useEffect(() => {
    getMyInfo();
  }, []);

  /**
   *
   * @param {import("../types").SigninResponse} res
   */
  function handleLogin(res) {
    saveToken(res.token);
    getMyInfo();
  }

  function handleLogout() {
    removeToken();
    setToken(null);
    setCurrentUser(null);
  }

  function getMyInfo() {
    if (!getToken()) return;

    api
      .getUserInfo()
      .then((user) => {
        setCurrentUser(user);
        setToken(getToken());
      })
      .catch((err) => console.error(err));
  }

  return (
    <div className="App body">
      <CurrentUserContext.Provider value={currentUser}>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute
                loggedIn={token}
                element={Home}
                onLogout={handleLogout}
                onSetCurrentUser={setCurrentUser}
              />
            }
          />
          <Route
            path="/sign-in"
            element={token ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />}
          />
          <Route path="/sign-up" element={token ? <Navigate to="/" replace /> : <Register />} />
        </Routes>
      </CurrentUserContext.Provider>
    </div>
  );
}
