import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { authApi } from '../../api'
import { logout } from '../../app/features/auth/authSlice'

const navGroups = [
  {
    label: 'HR',
    links: [
      { to: '/hr', label: 'Overview' },
      { to: '/hr/employees', label: 'Employees' },
      { to: '/hr/leave', label: 'Leave' },
      { to: '/hr/attendance', label: 'Attendance' },
    ],
  },
  {
    label: 'Finance',
    links: [
      { to: '/finance', label: 'Overview' },
      { to: '/finance/accounts', label: 'Accounts' },
      { to: '/finance/invoices', label: 'Invoices' },
      { to: '/finance/journal', label: 'Journal' },
      { to: '/finance/budgets', label: 'Budgets' },
    ],
  },
  {
    label: 'Operations',
    links: [
      { to: '/operations', label: 'Overview' },
      { to: '/crm/leads', label: 'Leads' },
      { to: '/crm/customers', label: 'Customers' },
      { to: '/operations/products', label: 'Products' },
      { to: '/operations/orders', label: 'Orders' },
      { to: '/inventory/stock', label: 'Inventory' },
      { to: '/operations/projects', label: 'Projects' },
    ],
  },
  {
    label: 'Documents',
    links: [
      { to: '/dms', label: 'Overview' },
      { to: '/dms/documents', label: 'Documents' },
    ],
  },
]

export default function Layout() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  async function handleLogout() {
    try {
      await authApi.logout()
    } finally {
      dispatch(logout())
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/dashboard" className="text-xl font-bold text-gray-900">
                  SmallOrg Central
                </Link>
              </div>
              <div className="hidden xl:ml-6 xl:flex xl:space-x-8">
                <Link to="/dashboard" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Dashboard</Link>
                {navGroups.map(group => (
                  <div key={group.label} className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-900">{group.label}</span>
                    {group.links.slice(0, 2).map(link => (
                      <Link key={link.to} to={link.to} className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">{link.label}</Link>
                    ))}
                  </div>
                ))}
                <Link to="/reports" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Reports</Link>
                <Link to="/settings" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Settings</Link>
              </div>
            </div>
            <div className="flex items-center">
              <button onClick={handleLogout} className="text-gray-500 hover:text-gray-700 text-sm font-medium">Logout</button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="xl:hidden mb-6 grid grid-cols-2 gap-2">
          <Link to="/dashboard" className="rounded-md bg-white px-3 py-2 text-center text-sm font-medium text-gray-700 shadow-sm">Dashboard</Link>
          <Link to="/reports" className="rounded-md bg-white px-3 py-2 text-center text-sm font-medium text-gray-700 shadow-sm">Reports</Link>
          {navGroups.map(group => group.links.slice(0, 2).map(link => (
            <Link key={link.to} to={link.to} className="rounded-md bg-white px-3 py-2 text-center text-sm font-medium text-gray-700 shadow-sm">{link.label}</Link>
          )))}
        </div>
        <div className="px-4 sm:px-0">
          <div className="md:hidden mb-4 flex flex-wrap gap-2">
            {navGroups.flatMap(group => group.links).map(link => (
              <Link key={link.to} to={link.to} className="rounded-full bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow-sm">{link.label}</Link>
            ))}
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
