
import { Route, Routes, useNavigate } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store"
import Admin from './pages/Admin';
import Login from './pages/Login';
import Home from './pages/Home';
import Me from './pages/Me';
import NotFound from "./pages/NotFound";
import ThemeUtil from './utils/ThemeUtil';
import Mail from './pages/Mail';
import Club from './pages/Club';
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'


function App() {
  ThemeUtil.init();
  return (
    <>
      <Provider store={store}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/club" element={<Club />} />
          <Route path="/mail" element={<Mail />} />
          <Route path="/me" element={<Me />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Provider>
    </>
  )
}

export default App
