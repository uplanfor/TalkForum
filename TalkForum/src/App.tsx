import './assets/normalize.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { lazy, useEffect } from 'react';

import './i18n';

import Login from './pages/Login';
import Home from './pages/Home';
import Me from './pages/Me';
import NotFound from './pages/NotFound';
import ThemeUtil from './utils/ThemeUtil';
import Mail from './pages/Mail';
import Club from './pages/Club';
import EnvironmentCheck from './components/EnvironmentCheck';
import RefreshLoginInfo from './components/RefreshLoginInfo';

import { AliveScope as KeepAliveProvider } from 'react-activation'
import KeepAliveHelper from './components/KeepAliveHelper';

const Admin = lazy(() => import('./pages/Admin'));
const PostView = lazy(() => import('./pages/PostView'));
const SpaceView = lazy(() => import('./pages/SpaceView'));
const Search = lazy(() => import('./pages/Search'));

import store from './store';

import { LanguageUtil } from './utils/LanguageUtil';

// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'


const App = () => {
    useEffect(() => {
        ThemeUtil.init();
        LanguageUtil.init();
    }, []);

    return (

        <BrowserRouter>
            <Provider store={store}>
                <KeepAliveProvider>
                    <Routes>
                        <Route path='/' element={
                            <KeepAliveHelper name='home'>
                                <Home />
                            </KeepAliveHelper>
                        } />
                        <Route path='/club' element={
                            <Club />
                        } />
                        <Route path='/mail' element={
                            <Mail />
                        } />
                        <Route path='/me' element={
                            <Me />
                        } />
                        <Route path='/login' element={<Login />} />
                        <Route path='/admin' element={<Admin />} />
                        <Route path='/search' element={
                            <Search />
                        } />
                        <Route path='/post/:postId' element={<PostView />} />
                        <Route path='/:type/:id' element={<SpaceView />} />
                        <Route path='*' element={<NotFound />} />
                    </Routes>
                </KeepAliveProvider>
                <RefreshLoginInfo />
                <EnvironmentCheck />

            </Provider>

        </BrowserRouter>
    );
};

export default App;
