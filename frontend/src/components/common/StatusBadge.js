import React from 'react';

const labels = {
  pending: 'Pending',
  accepted: 'Accepted',
  in_progress: 'In Progress',
  review: 'In Review',
  revision_requested: 'Revision Requested',
  approved: 'Approved',
  completed: 'Completed',
  cancelled: 'Cancelled',
  pending_review: 'Pending Review',
  superseded: 'Superseded',
};

export default function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{labels[status] || status}</span>;
}
