// App.js - Main Application Component
import { Fragment } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { publicRoutes, privateRoutes } from './routes';
import DefaultLayout from './layouts';
import { useAuth } from './hooks';

function App() {
    const { isLoggedIn } = useAuth();
    
    return (
        <Router>
            <div className="App">
                <Routes>
                    {/* Public routes - không cần layout */}
                    {publicRoutes.map((route, index) => {
                        const Page = route.component;
                        
                        return (
                            <Route
                                key={index}
                                path={route.path}
                                element={<Page />}
                            />
                        );
                    })}
                    
                    {/* Private routes - cần đăng nhập và có DefaultLayout */}
                    {isLoggedIn && privateRoutes.map((route, index) => {
                        const Page = route.component;
                        
                        return (
                            <Route
                                key={`private-${index}`}
                                path={route.path}
                                element={
                                    <DefaultLayout>
                                        <Page />
                                    </DefaultLayout>
                                }
                            />
                        );
                    })}
                </Routes>
            </div>
        </Router>
    );
}

export default App;