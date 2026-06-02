import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import LoadingScreen from '../components/common/LoadingScreen';

const Login = lazy(() => import('../pages/Login'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Employees = lazy(() => import('../pages/Employees'));
const Departments = lazy(() => import('../pages/Departments'));
const Positions = lazy(() => import('../pages/Positions'));
const Projects = lazy(() => import('../pages/Projects'));
const MyProjects = lazy(() => import('../pages/MyProjects'));
const Attendance = lazy(() => import('../pages/Attendance'));
const Leave = lazy(() => import('../pages/Leave'));
const Payroll = lazy(() => import('../pages/Payroll'));
const Contracts = lazy(() => import('../pages/Contracts'));
const Insurance = lazy(() => import('../pages/Insurance'));
const Education = lazy(() => import('../pages/Education'));
const Notifications = lazy(() => import('../pages/Notifications'));
const Profile = lazy(() => import('../pages/Profile'));
const SalaryChanges = lazy(() => import('../pages/SalaryChanges'));

const AppRoutes = () => (
  <Suspense fallback={<LoadingScreen />}>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="employees" element={<ProtectedRoute roles={['Admin','HR','Manager','Ketoan','TruongPhong']}><Employees /></ProtectedRoute>} />
        <Route path="departments" element={<ProtectedRoute roles={['Admin']}><Departments /></ProtectedRoute>} />
        <Route path="positions" element={<ProtectedRoute roles={['Admin']}><Positions /></ProtectedRoute>} />
        <Route path="projects" element={<ProtectedRoute roles={['Admin','Manager']}><Projects /></ProtectedRoute>} />
        <Route path="my-projects" element={<ProtectedRoute roles={['Employee']}><MyProjects /></ProtectedRoute>} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="leave" element={<Leave />} />
        <Route path="payroll" element={<Payroll />} />
        <Route path="contracts" element={<ProtectedRoute roles={['Admin','HR']}><Contracts /></ProtectedRoute>} />
        <Route path="insurance" element={<ProtectedRoute roles={['Admin','HR']}><Insurance /></ProtectedRoute>} />
        <Route path="education" element={<ProtectedRoute roles={['Admin','HR']}><Education /></ProtectedRoute>} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
        <Route path="salary-changes" element={<SalaryChanges />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
