import { createBrowserRouter, Navigate } from 'react-router-dom'
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

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'hr',
        element: <HRDashboard />,
      },
      {
        path: 'hr/employees',
        element: <EmployeesPage />,
      },
      {
        path: 'hr/leave',
        element: <LeavePage />,
      },
      {
        path: 'hr/attendance',
        element: <AttendancePage />,
      },
      {
        path: 'finance',
        element: <FinanceDashboard />,
      },
      {
        path: 'finance/accounts',
        element: <AccountsPage />,
      },
      {
        path: 'finance/invoices',
        element: <InvoicesPage />,
      },
      {
        path: 'finance/journal',
        element: <JournalPage />,
      },
      {
        path: 'finance/budgets',
        element: <BudgetsPage />,
      },
      {
        path: 'crm/leads',
        element: <LeadsPage />,
      },
      {
        path: 'crm/customers',
        element: <CustomersPage />,
      },
      {
        path: 'operations',
        element: <OperationsDashboard />,
      },
      {
        path: 'operations/products',
        element: <ProductsPage />,
      },
      {
        path: 'operations/orders',
        element: <OrdersPage />,
      },
      {
        path: 'inventory/stock',
        element: <InventoryPage />,
      },
      {
        path: 'operations/projects',
        element: <ProjectsPage />,
      },
      {
        path: 'dms',
        element: <DMSDashboard />,
      },
      {
        path: 'dms/documents',
        element: <DocumentsPage />,
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
