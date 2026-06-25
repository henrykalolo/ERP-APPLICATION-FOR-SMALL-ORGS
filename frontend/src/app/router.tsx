import { useEffect, useState } from 'react'
import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import Dashboard from '../pages/Dashboard'
import Login from '../pages/Login'
import NotFound from '../pages/NotFound'
import Reports from '../pages/Reports'
import Settings from '../pages/Settings'
import HRDashboard from '../features/hr/HRDashboard'
import EmployeesPage from '../features/hr/EmployeesPage'
import LeavePage from '../features/hr/LeavePage'
import AttendancePage from '../features/hr/AttendancePage'
import FinanceDashboard from '../features/finance/FinanceDashboard'
import AccountsPage from '../features/finance/AccountsPage'
import InvoicesPage from '../features/finance/InvoicesPage'
import JournalPage from '../features/finance/JournalPage'
import BudgetsPage from '../features/finance/BudgetsPage'
import OperationsDashboard from '../features/operations/OperationsDashboard'
import LeadsPage from '../features/operations/LeadsPage'
import CustomersPage from '../features/operations/CustomersPage'
import ProductsPage from '../features/operations/ProductsPage'
import OrdersPage from '../features/operations/OrdersPage'
import InventoryPage from '../features/operations/InventoryPage'
import ProjectsPage from '../features/operations/ProjectsPage'
import DMSDashboard from '../features/dms/DMSDashboard'
import DocumentsPage from '../features/dms/DocumentsPage'
import ProtectedRoute from './ProtectedRoute'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
        handle: 'Dashboard',
      },
{
        path: 'hr',
        element: <HRDashboard />,
        handle: 'HR',
      },
      {
        path: 'hr/employees',
        element: <EmployeesPage />,
        handle: 'Employees',
      },
      {
        path: 'hr/leave',
        element: <LeavePage />,
        handle: 'Leave',
      },
      {
        path: 'hr/attendance',
        element: <AttendancePage />,
        handle: 'Attendance',
      },
      {
        path: 'finance',
        element: <FinanceDashboard />,
        handle: 'Finance',
      },
      {
        path: 'finance/accounts',
        element: <AccountsPage />,
        handle: 'Accounts',
      },
      {
        path: 'finance/invoices',
        element: <InvoicesPage />,
        handle: 'Invoices',
      },
      {
        path: 'finance/journal',
        element: <JournalPage />,
        handle: 'Journal',
      },
      {
        path: 'finance/budgets',
        element: <BudgetsPage />,
        handle: 'Budgets',
      },
      {
        path: 'crm/leads',
        element: <LeadsPage />,
        handle: 'Leads',
      },
      {
        path: 'crm/customers',
        element: <CustomersPage />,
        handle: 'Customers',
      },
      {
        path: 'operations',
        element: <OperationsDashboard />,
        handle: 'Operations',
      },
      {
        path: 'operations/products',
        element: <ProductsPage />,
        handle: 'Products',
      },
      {
        path: 'operations/orders',
        element: <OrdersPage />,
        handle: 'Orders',
      },
      {
        path: 'inventory/stock',
        element: <InventoryPage />,
        handle: 'Inventory',
      },
      {
        path: 'operations/projects',
        element: <ProjectsPage />,
        handle: 'Projects',
      },
      {
        path: 'dms',
        element: <DMSDashboard />,
        handle: 'Documents',
      },
      {
        path: 'dms/documents',
        element: <DocumentsPage />,
        handle: 'Documents List',
      },
      {
        path: 'reports',
        element: <Reports />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
])
