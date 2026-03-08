import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useJobsStore } from '../store'

export default function JobDetailPage() {
  const { id } = useParams()
  const { selectedJob, fetchJob, loading } = useJobsStore()
  const [submittingBid, setSubmittingBid] = useState(false)
  const [bidAmount, setBidAmount] = useState('')

  useEffect(() => {
    fetchJob(id)
  }, [id])

  if (loading) {
    return <div className="text-center py-20">Loading...</div>
  }

  if (!selectedJob) {
    return <div className="text-center py-20">Job not found</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="card">
        <h1 className="text-3xl font-bold mb-4">{selectedJob.title}</h1>
        <p className="text-slate-600 mb-6">{selectedJob.description}</p>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-slate-500 text-sm uppercase mb-2">Budget</h3>
            <p className="text-3xl font-bold text-accent">${selectedJob.budget}</p>
          </div>
          <div>
            <h3 className="text-slate-500 text-sm uppercase mb-2">Category</h3>
            <p className="text-lg font-semibold">{selectedJob.category}</p>
          </div>
        </div>

        {selectedJob.bids && selectedJob.bids.length > 0 && (
          <div>
            <h3 className="text-xl font-bold mb-4">Bids ({selectedJob.bids.length})</h3>
            <div className="space-y-3">
              {selectedJob.bids.map((bid) => (
                <div key={bid._id} className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{bid.seller_id?.name}</p>
                    <p className="text-sm text-slate-500">{bid.note}</p>
                  </div>
                  <p className="text-2xl font-bold text-accent">${bid.amount}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
