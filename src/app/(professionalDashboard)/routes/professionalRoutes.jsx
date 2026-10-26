// src/app/(professionalDashboard)/routes/professionalRoutes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProfessionalLayout from "../layouts/ProfessionalLayout";
import Profile from "../pages/professional/Profile";
import EditProfile from "../pages/professional/EditProfile";
import Certificates from "../pages/professional/Documents";
import DashboardHome from "../pages/professional/DashboardHome";
import Documents from "../pages/professional/Documents";
import Appointments from "../pages/professional/Appointments";


export default function ProfessionalRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ProfessionalLayout />}>
        {/* /professional -> /professional/profile */}
        <Route index element={<Navigate to="profile" replace />} />

        {/* /professional/profile (current user's profile) */}
        <Route path="profile" element={<Profile />} />

        {/* /professional/:id (view any professional by id) */}
        <Route path=":id" element={<Profile />} />

        {/* /professional/dashboard */}
        <Route path="dashboard" element={<DashboardHome />} />

        {/* /professional/edit-profile */}
        <Route path="edit-profile" element={<EditProfile />} />

        {/* /professional/certificates */}
        <Route path="documents" element={<Documents />} />
        <Route path="appointments" element={<Appointments/>} />
      </Route>
    </Routes>
  );
}
