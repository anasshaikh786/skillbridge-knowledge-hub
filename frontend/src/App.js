import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import "App.css";

import Navbar from "components/Navbar";
import Footer from "components/Footer";
import Landing from "pages/Landing";
import Login from "pages/Login";
import Signup from "pages/Signup";
import VerifyOtp from "pages/VerifyOtp";
import ForgotPassword from "pages/ForgotPassword";
import ResetPassword from "pages/ResetPassword";
import Catalog from "pages/Catalog";
import CourseDetail from "pages/CourseDetail";
import Cart from "pages/Cart";
import Wishlist from "pages/Wishlist";
import StudentDashboard from "pages/StudentDashboard";
import InstructorDashboard from "pages/InstructorDashboard";
import CoursePlayer from "pages/CoursePlayer";
import CreateCourse from "pages/CreateCourse";
import EditCourse from "pages/EditCourse";
import Profile from "pages/Profile";
import { useAuth } from "store/auth";
import { api } from "lib/api";

const Protected = ({ children, role }) => {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) return <Navigate to="/" replace />;
  return children;
};

function App() {
  const { token, setUser, logout } = useAuth();

useEffect(() => {
  if (token) {
    api
      .get("/profile/me")
      .then((r) => setUser(r.data.user))
      .catch(() => logout());
  }

  api.post("/seed/categories").catch(() => {});
}, [token, setUser, logout]);

  return (
    <div className="App grain">
      <BrowserRouter>
        <Toaster theme="dark" position="top-right" richColors />
        <Navbar />
        <div className="relative z-10">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/catalog/:categoryId" element={<Catalog />} />
            <Route path="/course/:id" element={<CourseDetail />} />

            <Route path="/cart" element={<Protected><Cart /></Protected>} />
            <Route path="/wishlist" element={<Protected><Wishlist /></Protected>} />
            <Route path="/dashboard" element={<Protected><StudentDashboard /></Protected>} />
            <Route path="/dashboard/instructor" element={<Protected role="Instructor"><InstructorDashboard /></Protected>} />
            <Route path="/dashboard/create-course" element={<Protected role="Instructor"><CreateCourse /></Protected>} />
            <Route path="/dashboard/edit-course/:id" element={<Protected role="Instructor"><EditCourse /></Protected>} />
            <Route path="/profile" element={<Protected><Profile /></Protected>} />
            <Route path="/learn/:courseId" element={<Protected><CoursePlayer /></Protected>} />
          </Routes>
        </div>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
