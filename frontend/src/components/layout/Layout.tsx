import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useState } from 'react'
import { authApi } from '../../api'
import { logout } from '../../app/features/auth/authSlice'
import { Breadcrumbs } from '../Breadcrumbs'

const fullNavGroups = [
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

const topLevelLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/reports', label: 'Reports' },
  { to: '/settings', label: 'Settings' },
]

function NavLink({ to, label }: { to: string; label: string }) {
  const location = useLocation()
  const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`)
  return (
    <Link
      to={to}
      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
        isActive
          ? 'border-indigo-500 text-gray-900'
          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
      }`}
    >
      {label}
    </Link>
  )
}

export default function Layout() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  async function handleLogout() {
    try {
      await authApi.logout()
    } finally {
      dispatch(logout())
      navigate('/login', { replace: true })
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

              <div className="hidden lg:ml-8 lg:flex lg:space-x-6">
                {topLevelLinks.map(link => (
                  <NavLink key={link.to} {...link} />
                ))}
              </div>

              <div className="hidden xl:ml-6 xl:flex xl:space-x-6">
                {fullNavGroups.map(group => (
                  <div key={group.label} className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-900">{group.label}</span>
                    {group.links.map(link => (
                      <NavLink key={link.to} {...link} />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                aria-expanded={mobileMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                {!mobileMenuOpen ? (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>

            <div className="hidden lg:flex lg:items-center">
              <button onClick={handleLogout} className="text-sm font-medium text-gray-500 hover:text-gray-700">Logout</button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200">
            <div className="pt-2 pb-4 space-y-1">
              {topLevelLinks.map(link => (
                <NavLink key={link.to} {...link} />
              ))}
              {fullNavGroups.map(group => (
                <div key={group.label} className="pt-2">
                  <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{group.label}</p>
                  <div className="mt-1 space-y-1">
                    {group.links.map(link => (
                      <NavLink key={link.to} {...link} />
                    ))}
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t border-gray-200 mt-2">
                <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50">Logout</button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Breadcrumbs />
        <div className="px-4 sm:px-0">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
