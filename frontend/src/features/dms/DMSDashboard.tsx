import { useState, useEffect } from 'react'
import { dmsApi } from '../../api'

export default function DMSDashboard() {
  const [documents, setDocuments] = useState<any[]>([])
  const [folders, setFolders] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [documentsData, foldersData] = await Promise.all([
        dmsApi.documents.list(),
        dmsApi.folders.list(),
      ])
      setDocuments(documentsData)
      setFolders(foldersData)
    } catch (error) {
      console.error('Failed to load DMS data:', error)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Document Management</h1>
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Folders ({folders.length})</h2>
            <div className="space-y-2">
              {folders.map((folder) => (
                <div key={folder.id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                  <span className="text-gray-500">📁</span>
                  <span className="ml-2 text-sm text-gray-900">{folder.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Documents ({documents.length})</h2>
            <div className="space-y-2">
              {documents.slice(0, 10).map((doc) => (
                <div key={doc.id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                  <span className="text-gray-500">📄</span>
                  <span className="ml-2 text-sm text-gray-900">{doc.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
