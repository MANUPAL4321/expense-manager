import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AddTransaction from "./pages/AddTransaction";

import History from "./pages/History";
import Analyze from "./pages/Analyze";
import Navbar from "./components/Navbar";
import SidePanel from "./components/SidePanel";
import Auth from "./pages/Auth";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { FeedbackProvider } from "./context/FeedbackContext";
import Toast from "./components/Toast";

import Landing from "./pages/Landing";

// Private Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Route wrapper for Navbar, SidePanel, and Main content
const Layout = ({ children }) => {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      {user && <SidePanel />}
      <main style={user ? styles.mainContainer : styles.landingContainer}>
        {children}
      </main>
    </>
  );
};

function App() {
  return (
    <FeedbackProvider>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Landing page is always at / */}
              <Route path="/" element={<HomeSelector />} />
              
              {/* Main App Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/login" element={<Auth />} />
              <Route path="/add" element={<ProtectedRoute><AddTransaction /></ProtectedRoute>} />

              <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
              <Route path="/analyze" element={<ProtectedRoute><Analyze /></ProtectedRoute>} />
            </Routes>
            <Toast />
          </Layout>
        </Router>
      </AuthProvider>
    </FeedbackProvider>
  );
}

// Helper to handle Landing page vs Dashboard redirection
const HomeSelector = () => {
  const { user } = useAuth();
  // If user is logged in, visiting / will redirect them to /dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Landing />;
};

const styles = {
  mainContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "1.5rem 2rem",
    paddingRight: "6rem", /* space for side panel */
  },
  landingContainer: {
    margin: 0,
    padding: 0,
    maxWidth: "100%",
  }
};

export default App;
