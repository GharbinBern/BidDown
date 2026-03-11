import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  AlertTriangle,
  Circle,
  CircleCheckBig,
  ClipboardCheck,
  Clock3,
  FileSignature,
  Hammer,
  ShieldCheck,
} from 'lucide-react'
import { api } from '../api'
import { useAuthStore, useJobsStore } from '../store'

const FLOW = ['contract', 'escrow', 'in_progress', 'review', 'completed']

const FLOW_META = {
  contract: { label: 'Contract', Icon: FileSignature },
  escrow: { label: 'Escrow', Icon: ShieldCheck },
  in_progress: { label: 'In Progress', Icon: Hammer },
  review: { label: 'Review', Icon: ClipboardCheck },
  completed: { label: 'Complete', Icon: CircleCheckBig },
}

function toDateText(value) {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleString()
}

function stageToRailIndex(stage) {
  const safe = stage === 'dispute' ? 'review' : stage
  const idx = FLOW.indexOf(safe)
  return idx < 0 ? 0 : idx
}

function timeLeftHours(value) {
  if (!value) return null
  const ms = new Date(value).getTime() - Date.now()
  if (Number.isNaN(ms)) return null
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60)))
}

function StageRail({ stage, isDispute }) {
  const currentIndex = stageToRailIndex(stage)

  return (
    <div className="wf-rail" aria-label="Workflow stages">
      {FLOW.map((id, index) => {
        const done = index < currentIndex || stage === 'completed'
        const active = index === currentIndex && stage !== 'completed'
        const Icon = FLOW_META[id].Icon

        return (
          <div key={id} className="wf-rail-segment">
            <div className="wf-rail-node-wrap">
              <div className={`wf-rail-node ${done ? 'done' : ''} ${active ? 'active' : ''} ${isDispute && active ? 'dispute' : ''}`}>
                {done ? <CircleCheckBig size={15} /> : <Icon size={15} />}
              </div>
              <div className={`wf-rail-label ${done ? 'done' : ''} ${active ? 'active' : ''}`}>{FLOW_META[id].label}</div>
            </div>
            {index < FLOW.length - 1 && <div className={`wf-rail-line ${done ? 'done' : ''}`} />}
          </div>
        )
      })}
    </div>
  )
}

export default function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { selectedJob, fetchJob, loading } = useJobsStore()

  const [busyAction, setBusyAction] = useState('')
  const [progressMessage, setProgressMessage] = useState('')
  const [submitNote, setSubmitNote] = useState('')
  const [deliverableUrl, setDeliverableUrl] = useState('')
  const [revisionReason, setRevisionReason] = useState('')
  const [disputeReason, setDisputeReason] = useState('')
  const [contractDraft, setContractDraft] = useState({
    scope: '',
    deadline: '',
    agreed_price: '',
  })

  useEffect(() => {
    fetchJob(id)
  }, [id, fetchJob])

  const userId = user?._id || user?.id
  const ownerId = selectedJob?.owner_id?._id || selectedJob?.owner_id
  const winningSellerId = selectedJob?.winning_bid_id?.seller_id?._id || selectedJob?.winning_bid_id?.seller_id

  const isBuyer = !!userId && String(userId) === String(ownerId)
  const isSeller = !!userId && !!winningSellerId && String(userId) === String(winningSellerId)
  const canSeeWorkflow = isBuyer || isSeller

  const stage = useMemo(() => {
    const explicit = selectedJob?.workflow_stage
    if (explicit && explicit !== 'bidding') return explicit

    if (!selectedJob?.winning_bid_id) return explicit || 'bidding'
    if (selectedJob?.status === 'completed' || selectedJob?.escrow_released) return 'completed'
    if (selectedJob?.dispute_raised) return 'dispute'
    if (selectedJob?.work_submitted_at || selectedJob?.review_deadline) return 'review'
    if (selectedJob?.escrow_deposited_at || selectedJob?.work_started_at || (selectedJob?.progress_updates || []).length > 0) return 'in_progress'
    return 'contract'
  }, [selectedJob])
  const reviewHoursLeft = useMemo(() => timeLeftHours(selectedJob?.review_deadline), [selectedJob?.review_deadline])

  useEffect(() => {
    if (!selectedJob || selectedJob.workflow_stage !== 'contract') return
    setContractDraft({
      scope: selectedJob.contract_terms?.scope || selectedJob.description || '',
      deadline: selectedJob.contract_terms?.deadline ? new Date(selectedJob.contract_terms.deadline).toISOString().slice(0, 10) : '',
      agreed_price: selectedJob.contract_terms?.agreed_price || selectedJob.escrow_amount || '',
    })
  }, [selectedJob])

  const runAction = async (key, action, successMessage) => {
    setBusyAction(key)
    try {
      await action()
      await fetchJob(id, { silent: true })
      toast.success(successMessage)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Action failed')
    } finally {
      setBusyAction('')
    }
  }

  if (loading && !selectedJob) {
    return <div className="main" />
  }

  if (!selectedJob) {
    return <div className="main">Job not found</div>
  }

  return (
    <div className="main">
      <div className="workspace-head">
        <div>
          <div className="section-title" style={{ marginBottom: 8 }}>Job <span>Workflow</span></div>
          <p className="workspace-subtitle">Structured post-acceptance execution from contract to release.</p>
        </div>
        <div className="workspace-badge">
          <Clock3 size={15} />
          <span>{stage === 'review' && reviewHoursLeft !== null ? `${reviewHoursLeft}h review left` : `Stage: ${stage.replace('_', ' ')}`}</span>
        </div>
      </div>

      <section className="shell-panel">
        <div className="wf-top-grid">
          <div className="wf-job-title">{selectedJob.title}</div>
          <div className="wf-role-pill">{isBuyer ? 'Buyer View' : isSeller ? 'Seller View' : 'Observer'}</div>
        </div>
        {canSeeWorkflow && <StageRail stage={stage} isDispute={stage === 'dispute'} />}
      </section>

      <div className="wf-layout">
        <section className="shell-panel">
          <div className="wf-card-title-row">
            <div className="wf-card-title">Current Stage Actions</div>
            {stage === 'dispute' && <span className="status-pill status-pending">Dispute Open</span>}
            {stage === 'completed' && <span className="status-pill status-closed">Complete</span>}
          </div>

          {!selectedJob.winning_bid_id && (
            <div className="wf-note-block">This job has no accepted bid yet, so the post-acceptance workflow has not started.</div>
          )}

          {selectedJob.winning_bid_id && !canSeeWorkflow && (
            <div className="wf-note-block">Only the buyer and winning seller can view workflow controls.</div>
          )}

          {selectedJob.winning_bid_id && canSeeWorkflow && stage === 'bidding' && (
            <div className="wf-note-block">
              Workflow is initializing for this job. Start by confirming contract terms below.
            </div>
          )}

          {selectedJob.winning_bid_id && canSeeWorkflow && (stage === 'contract' || stage === 'bidding') && (
            <>
              <div className="wf-data-grid two">
                <div className="wf-cell"><div className="wf-cell-label">Agreed Price</div><div className="wf-cell-value">${Number(selectedJob.contract_terms?.agreed_price || selectedJob.escrow_amount || 0).toLocaleString()}</div></div>
                <div className="wf-cell"><div className="wf-cell-label">Deadline</div><div className="wf-cell-value">{toDateText(selectedJob.contract_terms?.deadline)}</div></div>
              </div>

              {isBuyer ? (
                <>
                  <div className="form-group" style={{ marginBottom: 10 }}>
                    <label className="form-label">Contract Scope</label>
                    <textarea
                      className="form-textarea"
                      value={contractDraft.scope}
                      onChange={(e) => setContractDraft((prev) => ({ ...prev, scope: e.target.value }))}
                      placeholder="Define exact deliverables"
                    />
                  </div>
                  <div className="wf-data-grid two">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Contract Deadline</label>
                      <input
                        className="form-input"
                        type="date"
                        value={contractDraft.deadline}
                        onChange={(e) => setContractDraft((prev) => ({ ...prev, deadline: e.target.value }))}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Agreed Price</label>
                      <input
                        className="form-input"
                        type="number"
                        min="50"
                        value={contractDraft.agreed_price}
                        onChange={(e) => setContractDraft((prev) => ({ ...prev, agreed_price: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="wf-action-row">
                    <button
                      className="btn btn-ghost"
                      disabled={busyAction === 'saveContract'}
                      onClick={() => runAction('saveContract', () => api.updateContractDraft(id, {
                        scope: contractDraft.scope,
                        deadline: contractDraft.deadline,
                        agreed_price: Number(contractDraft.agreed_price),
                      }), 'Contract updated. Both parties need to sign')}
                    >
                      {busyAction === 'saveContract' ? 'Saving...' : 'Save Contract Terms'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="wf-note-block">{selectedJob.contract_terms?.scope || selectedJob.description}</div>
              )}

              <div className="wf-sign-grid">
                <div className={`wf-sign-card ${selectedJob.contract_terms?.buyer_confirmed ? 'signed' : ''}`}>
                  <div className="wf-sign-label">Buyer</div>
                  <div>{selectedJob.owner_id?.name || 'Buyer'}</div>
                  <div className="wf-sign-status">{selectedJob.contract_terms?.buyer_confirmed ? 'Signed' : 'Pending'}</div>
                </div>
                <div className={`wf-sign-card ${selectedJob.contract_terms?.seller_confirmed ? 'signed' : ''}`}>
                  <div className="wf-sign-label">Seller</div>
                  <div>{selectedJob.winning_bid_id?.seller_id?.name || 'Seller'}</div>
                  <div className="wf-sign-status">{selectedJob.contract_terms?.seller_confirmed ? 'Signed' : 'Pending'}</div>
                </div>
              </div>
              <div className="wf-action-row">
                <button className="btn btn-primary" disabled={busyAction === 'confirmContract'} onClick={() => runAction('confirmContract', () => api.confirmContract(id), 'Contract confirmation saved')}>
                  <FileSignature size={14} />
                  {busyAction === 'confirmContract' ? 'Saving...' : 'Sign Contract'}
                </button>
              </div>
            </>
          )}

          {selectedJob.winning_bid_id && canSeeWorkflow && stage === 'escrow' && (
            <>
              <div className="wf-note-block">Buyer funds escrow. Seller starts only after funds are secured.</div>
              <div className="wf-data-grid three">
                <div className="wf-cell"><div className="wf-cell-label">Buyer</div><div className="wf-cell-value">{selectedJob.owner_id?.name || 'Buyer'}</div></div>
                <div className="wf-cell"><div className="wf-cell-label">Escrow Amount</div><div className="wf-cell-value">${Number(selectedJob.escrow_amount || 0).toLocaleString()}</div></div>
                <div className="wf-cell"><div className="wf-cell-label">Seller</div><div className="wf-cell-value">{selectedJob.winning_bid_id?.seller_id?.name || 'Seller'}</div></div>
              </div>
              {isBuyer ? (
                <button className="btn btn-primary" disabled={busyAction === 'escrow'} onClick={() => runAction('escrow', () => api.depositEscrow(id), 'Escrow funded')}>
                  <ShieldCheck size={14} />
                  {busyAction === 'escrow' ? 'Processing...' : 'Deposit to Escrow'}
                </button>
              ) : (
                <div className="wf-note-block">Waiting for buyer to fund escrow.</div>
              )}
            </>
          )}

          {selectedJob.winning_bid_id && canSeeWorkflow && stage === 'in_progress' && (
            <>
              <div className="wf-data-grid two">
                <div className="wf-cell"><div className="wf-cell-label">Escrow Status</div><div className="wf-cell-value">{selectedJob.escrow_deposited_at ? 'Secured' : 'Pending'}</div></div>
                <div className="wf-cell"><div className="wf-cell-label">Work Started</div><div className="wf-cell-value">{selectedJob.work_started_at ? toDateText(selectedJob.work_started_at) : 'Not yet'}</div></div>
              </div>

              {selectedJob.progress_updates?.length > 0 && (
                <div className="wf-stream">
                  {selectedJob.progress_updates.map((entry, index) => (
                    <div key={`${entry.createdAt}-${index}`} className="wf-stream-item">
                      <Circle size={10} />
                      <span>{entry.message}</span>
                    </div>
                  ))}
                </div>
              )}

              {isSeller ? (
                <>
                  <div className="wf-action-row">
                    <button className="btn btn-ghost" disabled={busyAction === 'startWork'} onClick={() => runAction('startWork', () => api.startWork(id), 'Work started')}>
                      <Hammer size={14} />
                      {busyAction === 'startWork' ? 'Updating...' : 'Mark Work Started'}
                    </button>
                  </div>

                  <div className="form-group" style={{ marginBottom: 10 }}>
                    <label className="form-label">Progress Update</label>
                    <textarea className="form-textarea" value={progressMessage} onChange={(e) => setProgressMessage(e.target.value)} placeholder="Share current status with buyer" />
                  </div>
                  <div className="wf-action-row">
                    <button className="btn btn-ghost" disabled={!progressMessage.trim() || busyAction === 'progress'} onClick={() => runAction('progress', () => api.addProgressUpdate(id, { message: progressMessage.trim() }).then(() => setProgressMessage('')), 'Progress posted')}>
                      {busyAction === 'progress' ? 'Posting...' : 'Post Update'}
                    </button>
                  </div>

                  <div className="form-group" style={{ marginTop: 10 }}>
                    <label className="form-label">Submission Note</label>
                    <textarea className="form-textarea" value={submitNote} onChange={(e) => setSubmitNote(e.target.value)} placeholder="Describe exactly what was delivered" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 10 }}>
                    <label className="form-label">Deliverable URL</label>
                    <input className="form-input" value={deliverableUrl} onChange={(e) => setDeliverableUrl(e.target.value)} placeholder="https://..." />
                  </div>
                  <button className="btn btn-primary" disabled={busyAction === 'submitWork'} onClick={() => runAction('submitWork', () => api.submitWork(id, { note: submitNote.trim(), deliverable_url: deliverableUrl.trim() }).then(() => { setSubmitNote(''); setDeliverableUrl('') }), 'Work submitted for review')}>
                    <ClipboardCheck size={14} />
                    {busyAction === 'submitWork' ? 'Submitting...' : 'Submit Work'}
                  </button>
                </>
              ) : (
                <div className="wf-note-block">Seller is currently preparing delivery.</div>
              )}
            </>
          )}

          {selectedJob.winning_bid_id && canSeeWorkflow && stage === 'review' && (
            <>
              <div className="wf-data-grid three">
                <div className="wf-cell"><div className="wf-cell-label">Review Window</div><div className="wf-cell-value">{reviewHoursLeft === null ? 'N/A' : `${reviewHoursLeft}h left`}</div></div>
                <div className="wf-cell"><div className="wf-cell-label">Revisions Used</div><div className="wf-cell-value">{selectedJob.revision_rounds_used || 0} / 1</div></div>
                <div className="wf-cell"><div className="wf-cell-label">Submitted At</div><div className="wf-cell-value">{toDateText(selectedJob.work_submitted_at)}</div></div>
              </div>

              <div className="wf-note-block">{selectedJob.deliverable_note || 'No deliverable note provided.'}</div>
              <div className="wf-link-row">Deliverable URL: {selectedJob.deliverable_url || 'N/A'}</div>

              {isBuyer ? (
                <>
                  <div className="wf-action-row">
                    <button className="btn btn-success" disabled={busyAction === 'approve'} onClick={() => runAction('approve', () => api.approveWork(id), 'Approved and payment released')}>
                      <CircleCheckBig size={14} />
                      {busyAction === 'approve' ? 'Approving...' : 'Approve and Release'}
                    </button>
                  </div>

                  {Number(selectedJob.revision_rounds_used || 0) < 1 && (
                    <>
                      <div className="form-group" style={{ marginTop: 12 }}>
                        <label className="form-label">Revision Request</label>
                        <textarea className="form-textarea" value={revisionReason} onChange={(e) => setRevisionReason(e.target.value)} placeholder="Describe required fixes clearly" />
                      </div>
                      <div className="wf-action-row">
                        <button className="btn btn-ghost" disabled={busyAction === 'revision'} onClick={() => runAction('revision', () => api.requestRevision(id, { reason: revisionReason.trim() }).then(() => setRevisionReason('')), 'Revision requested')}>
                          {busyAction === 'revision' ? 'Sending...' : 'Request Revision'}
                        </button>
                      </div>
                    </>
                  )}

                  <div className="form-group" style={{ marginTop: 12 }}>
                    <label className="form-label">Dispute Reason</label>
                    <textarea className="form-textarea" value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} placeholder="Provide reason if escalating to dispute" />
                  </div>
                  <div className="wf-action-row">
                    <button className="btn btn-ghost" disabled={busyAction === 'dispute'} onClick={() => runAction('dispute', () => api.raiseDispute(id, { reason: disputeReason.trim() }).then(() => setDisputeReason('')), 'Dispute raised')}>
                      <AlertTriangle size={14} />
                      {busyAction === 'dispute' ? 'Submitting...' : 'Raise Dispute'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="wf-note-block">Waiting for buyer decision within the review window.</div>
              )}
            </>
          )}

          {selectedJob.winning_bid_id && canSeeWorkflow && stage === 'dispute' && (
            <div className="wf-note-block wf-note-danger">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <AlertTriangle size={15} />
                <strong>Dispute Under Manual Review</strong>
              </div>
              <div>Reason: {selectedJob.dispute_reason || 'No reason provided'}</div>
              <div style={{ marginTop: 6 }}>Raised at: {toDateText(selectedJob.dispute_raised_at)}</div>
            </div>
          )}

          {selectedJob.winning_bid_id && canSeeWorkflow && stage === 'completed' && (
            <div className="wf-note-block wf-note-success">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <CircleCheckBig size={15} />
                <strong>Job Completed</strong>
              </div>
              <div>Payment released at: {toDateText(selectedJob.payment_released_at || selectedJob.completion_date)}</div>
              <div className="wf-action-row" style={{ marginTop: 10, marginBottom: 0 }}>
                <button className="btn btn-primary" onClick={() => navigate(`/rating?jobId=${id}`)}>
                  Leave Rating
                </button>
              </div>
            </div>
          )}
        </section>

        <aside className="shell-panel">
          <div className="wf-card-title" style={{ marginBottom: 12 }}>Job Summary</div>
          <div className="info-row"><span className="info-label">Category</span><span>{selectedJob.category}</span></div>
          <div className="info-row"><span className="info-label">Budget Cap</span><span>${Number(selectedJob.budget || 0).toLocaleString()}</span></div>
          <div className="info-row"><span className="info-label">Agreed Price</span><span>${Number(selectedJob.escrow_amount || selectedJob.winning_bid_id?.amount || 0).toLocaleString()}</span></div>
          <div className="info-row"><span className="info-label">Buyer</span><span>{selectedJob.owner_id?.name || 'N/A'}</span></div>
          <div className="info-row"><span className="info-label">Seller</span><span>{selectedJob.winning_bid_id?.seller_id?.name || 'N/A'}</span></div>
          <div className="info-row"><span className="info-label">Status</span><span>{selectedJob.status}</span></div>
          <div className="info-row"><span className="info-label">Created</span><span>{toDateText(selectedJob.createdAt)}</span></div>
        </aside>
      </div>
    </div>
  )
}
