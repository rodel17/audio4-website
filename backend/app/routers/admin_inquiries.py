from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from ..auth import require_admin
from ..db import get_db
from ..models import Inquiry, InquiryEvent, User
from ..schemas import InquiryUpdate
from ..serializers import inquiry_out

router = APIRouter(prefix="/api/admin/inquiries", tags=["admin"])

STATUS_LABELS = {"new": "New", "contacted": "Contacted", "quoted": "Quoted", "won": "Closed — won", "lost": "Closed — lost"}


@router.get("")
def list_inquiries(
    status_: str = Query("", alias="status", pattern="^(|new|contacted|quoted|closed)$"),
    q: str = Query("", max_length=100),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> dict:
    stmt = select(Inquiry)
    if status_ == "closed":
        stmt = stmt.where(Inquiry.status.in_(("won", "lost")))
    elif status_:
        stmt = stmt.where(Inquiry.status == status_)
    if q.strip():
        like = f"%{q.strip()}%"
        stmt = stmt.where(or_(Inquiry.name.ilike(like), Inquiry.company.ilike(like), Inquiry.subject.ilike(like), Inquiry.email.ilike(like)))
    items = db.scalars(stmt.order_by(Inquiry.created_at.desc()).limit(200))

    counts = dict(db.execute(select(Inquiry.status, func.count()).group_by(Inquiry.status)).all())
    return {
        "items": [inquiry_out(i) for i in items],
        "counts": {
            "all": sum(counts.values()),
            **{s: counts.get(s, 0) for s in ("new", "contacted", "quoted")},
            "closed": counts.get("won", 0) + counts.get("lost", 0),
        },
    }


@router.get("/{inquiry_id}")
def get_inquiry(inquiry_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)) -> dict:
    inquiry = db.get(Inquiry, inquiry_id, options=[selectinload(Inquiry.events)])
    if inquiry is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Inquiry not found")
    return inquiry_out(inquiry, with_events=True)


@router.patch("/{inquiry_id}")
def update_inquiry(
    inquiry_id: int, data: InquiryUpdate, db: Session = Depends(get_db), user: User = Depends(require_admin)
) -> dict:
    inquiry = db.get(Inquiry, inquiry_id, options=[selectinload(Inquiry.events)])
    if inquiry is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Inquiry not found")

    # Record each change in the activity log.
    if data.status is not None and data.status != inquiry.status:
        inquiry.events.append(InquiryEvent(text=f"Status changed to {STATUS_LABELS[data.status]} by {user.name}"))
        inquiry.status = data.status
    if data.assignee is not None and data.assignee != inquiry.assignee:
        inquiry.events.append(InquiryEvent(text=f"Assigned to {data.assignee or 'nobody'} by {user.name}"))
        inquiry.assignee = data.assignee
    if data.notes is not None and data.notes != inquiry.notes:
        inquiry.events.append(InquiryEvent(text=f"Notes updated by {user.name}"))
        inquiry.notes = data.notes
    db.commit()
    return inquiry_out(inquiry, with_events=True)
