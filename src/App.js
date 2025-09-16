// App.jsx - Main Application Component
import { Fragment } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { publicRoutes, privateRoutes } from './routes';
import DefaultLayout from './layouts';
import { useAuth } from './hooks';

function App() {
    const { isLoggedIn } = useAuth();
    
    // Combine routes based on auth status
    const availableRoutes = isLoggedIn 
        ? [...publicRoutes, ...privateRoutes] 
        : publicRoutes;
    return (
        <Router>
            <div className="App">
                <Routes>
                    {availableRoutes.map((route, index) => {
                        const Page = route.component;
                        let Layout = DefaultLayout;
                        
                        if (route.layout) {
                            Layout = route.layout;
                            console.log(Layout)
                        } else if (route.layout === null) {
                            Layout = Fragment;
                        }
                        
                        return (
                            <Route
                                key={index}
                                path={route.path}
                                element={
                                    <Layout>
                                        <Page />
                                    </Layout>
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