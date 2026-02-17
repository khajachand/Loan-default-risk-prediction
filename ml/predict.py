import joblib
import os
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")

# Load trained model once
model = joblib.load(MODEL_PATH)

# IMPORTANT: features must match training
FEATURES = [
    "Age",
    "Credit_Amount",
    "Loan_Duration",
    "Installment_Rate",
    "Employment_Duration",
    "Job"
]

def predict_risk(data_dict):
    """
    data_dict = {
        "Age": int,
        "Credit_Amount": float,
        "Loan_Duration": int,
        "Installment_Rate": int,
        "Employment_Duration": int,
        "Job": int
    }
    """

    df = pd.DataFrame([data_dict], columns=FEATURES)
    prediction = model.predict(df)[0]

    return "High Risk" if prediction == 1 else "Low Risk"
