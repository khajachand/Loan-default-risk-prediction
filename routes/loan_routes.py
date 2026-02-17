from flask import Blueprint, request, jsonify
from extensions import db
from models.loan import LoanApplication
from ml.predict import predict_risk

loan_bp = Blueprint("loan", __name__, url_prefix="/api/loan")


# ============================
# SUBMIT LOAN APPLICATION
# ============================
@loan_bp.route("/apply", methods=["POST"])
def apply_loan():
    data = request.json

    user_id = data.get("user_id")
    age = data.get("age")
    credit_amount = data.get("credit_amount")
    loan_duration = data.get("loan_duration")
    installment_rate = data.get("installment_rate")
    employment_duration = data.get("employment_duration")
    job = data.get("job")

    if not all([
        user_id, age, credit_amount,
        loan_duration, installment_rate,
        employment_duration, job
    ]):
        return jsonify({"message": "All fields are required"}), 400
    

    if int(age) < 18:
        return jsonify({
            "message": "Applicant not eligible (Age must be 18 or above)"
        }), 400

    # ML Prediction
    risk = predict_risk({
        "Age": age,
        "Credit_Amount": credit_amount,
        "Loan_Duration": loan_duration,
        "Installment_Rate": installment_rate,
        "Employment_Duration": employment_duration,
        "Job": job
    })

    loan = LoanApplication(
        user_id=user_id,
        income=credit_amount,
        credit_score=age,
        loan_amount=credit_amount,
        employment_type=str(job),
        ml_risk=risk,
        status="Pending"
    )

    db.session.add(loan)
    db.session.commit()

    return jsonify({
        "message": "Loan application submitted successfully",
        "application_id": loan.id,
        "ml_risk": risk,
        "status": loan.status
    }), 201


# ============================
# USER: VIEW OWN APPLICATIONS
# ============================
@loan_bp.route("/my-applications/<int:user_id>", methods=["GET"])
def view_user_loans(user_id):
    loans = LoanApplication.query.filter_by(user_id=user_id).all()

    result = []
    for loan in loans:
        result.append({
            "application_id": loan.id,
            "loan_amount": loan.loan_amount,
            "ml_risk": loan.ml_risk,
            "status": loan.status,
            "created_at": loan.created_at
        })

    return jsonify(result), 200


# ============================
# OFFICER: VIEW ALL APPLICATIONS
# ============================
@loan_bp.route("/all", methods=["GET"])
def get_all_applications():
    loans = LoanApplication.query.all()

    result = []
    for loan in loans:
        result.append({
            "application_id": loan.id,
            "user_id": loan.user_id,
            "loan_amount": loan.loan_amount,
            "ml_risk": loan.ml_risk,
            "status": loan.status
        })

    return jsonify(result), 200


# ============================
# OFFICER: APPROVE / REJECT
# ============================
@loan_bp.route("/update-status", methods=["PUT"])
def update_status():
    data = request.json
    application_id = data.get("application_id")
    status = data.get("status")

    loan = LoanApplication.query.get(application_id)

    if not loan:
        return jsonify({"message": "Loan not found"}), 404

    loan.status = status
    db.session.commit()   # 🔥 THIS WAS THE KEY

    return jsonify({
        "message": f"Loan {status} successfully",
        "status": loan.status
    }), 200
