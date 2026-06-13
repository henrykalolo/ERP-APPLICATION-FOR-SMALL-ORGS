import { FormEvent, useEffect, useState } from 'react'
import { dmsApi, Document, Folder } from '../../api'
import { Card, EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/ui'

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [search, setSearch] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [documentsData, foldersData] = await Promise.all([
        dmsApi.documents.list(),
        dmsApi.folders.list(),
      ])
      setDocuments(documentsData)
      setFolders(foldersData)
    } catch (err) {
      setError('Unable to load documents')
    } finally {
      setLoading(false)
    }
  }

  async function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      setError('')
      const data = await dmsApi.documents.search(search)
      setDocuments(data)
    } catch (err) {
      setError('Unable to search documents')
    }
  }

  async function submitUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!file) return

    try {
      setError('')
      setMessage('')
      const formData = new FormData()
      formData.append('file', file)
      formData.append('name', name || file.name)
      formData.append('description', description)
      await dmsApi.documents.create(formData)
      setMessage('Document uploaded successfully')
      setFile(null)
      setName('')
      setDescription('')
      await loadData()
    } catch (err) {
      setError('Unable to upload document')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Documents" description="Document library, folders, search, and uploads" />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card title="Folders"><div className="text-3xl font-semibold text-gray-900">{folders.length}</div></Card>
        <Card title="Documents"><div className="text-3xl font-semibold text-gray-900">{documents.length}</div></Card>
        <Card title="OCR Processed"><div className="text-3xl font-semibold text-gray-900">{documents.filter(document => document.ocr_processed).length}</div></Card>
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card title="Search Documents">
          <form onSubmit={submitSearch} className="flex gap-3">
            <input className="min-w-0 flex-1 rounded-md border-gray-300 text-sm" placeholder="Search by name" value={search} onChange={(event) => setSearch(event.target.value)} />
            <button className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700" type="submit">Search</button>
          </form>
        </Card>
        <Card title="Upload Document">
          <form onSubmit={submitUpload} className="space-y-3">
            <input className="w-full rounded-md border-gray-300 text-sm" type="file" onChange={(event) => setFile(event.target.files?.[0] || null)} />
            <input className="w-full rounded-md border-gray-300 text-sm" placeholder="Document name" value={name} onChange={(event) => setName(event.target.value)} />
            <textarea className="w-full rounded-md border-gray-300 text-sm" placeholder="Description" value={description} onChange={(event) => setDescription(event.target.value)} />
            <button className="rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700" type="submit">Upload</button>
          </form>
        </Card>
      </div>
      {message && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm">{message}</div>}
      {error && <ErrorState message={error} />}
      <Card title="Document Library">
        {loading && <LoadingState />}
        {!loading && documents.length === 0 && <EmptyState title="No documents found" />}
        {!loading && documents.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Folder</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Version</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OCR</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map(document => (
                  <tr key={document.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{document.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{document.folder_name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{document.file_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{document.file_size}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">v{document.version}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{document.ocr_processed ? 'Processed' : 'Pending'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
