import { useMatches, Link } from 'react-router-dom'

export function Breadcrumbs() {
  const matches = useMatches()

  const crumbs = matches
    .filter((match) => Boolean(match.handle as string))
    .map((match) => ({
      label: (match.handle as string),
      path: match.pathname,
    }))

  if (crumbs.length <= 1) return null

  return (
    <nav className="flex mb-4" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">Home</Link>
        </li>
        {crumbs.slice(1).map((crumb, i) => (
          <li key={crumb.path} className="flex items-center space-x-2">
            <span className="text-gray-400">/</span>
            {i === crumbs.length - 2 ? (
              <span className="text-sm font-medium text-gray-900">{crumb.label}</span>
            ) : (
              <Link to={crumb.path} className="text-sm text-gray-500 hover:text-gray-700">{crumb.label}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
