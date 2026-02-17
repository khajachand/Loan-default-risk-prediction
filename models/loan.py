from extensions import db
from datetime import datetime

class LoanApplication(db.Model):
    __tablename__ = "loan_applications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)

    income = db.Column(db.Float, nullable=False)
    credit_score = db.Column(db.Integer, nullable=False)
    loan_amount = db.Column(db.Float, nullable=False)
    employment_type = db.Column(db.String(50), nullable=False)

    ml_risk = db.Column(db.String(20))
    status = db.Column(db.String(20), default="Pending")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
