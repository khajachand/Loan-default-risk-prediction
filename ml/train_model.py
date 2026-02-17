import pandas as pd
import pickle
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

# ============================
# LOAD DATASET
# ============================
df = pd.read_csv("data/german_credit_data.csv")

print("Dataset columns:\n", df.columns)

# ============================
# BASIC CLEANING
# ============================

# Remove invalid ages (business rule)
df = df[df["Age"] >= 18]

# ============================
# TARGET VARIABLE
# ============================
# df["Credit_Risk"] = df["Credit_Risk"].map({
#     "good": 0,   # Low Risk
#     "bad": 1     # High Risk
# })

# ============================
# FEATURE SELECTION
# ============================
features = [
    "Age",
    "Credit_Amount",
    "Loan_Duration",
    "Installment_Rate",
    "Employment_Duration",
    "Job"
    # "Savings_Account",
    # "Checking_Account",
    # "Credit_History"
]

X = df[features]
y = df["Credit_Risk"]

# ============================
# ENCODE CATEGORICAL FEATURES
# ============================
label_encoders = {}

for col in X.columns:
    if X[col].dtype == "object":
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col].astype(str))
        label_encoders[col] = le

# ============================
# TRAIN / TEST SPLIT
# ============================
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# ============================
# RANDOM FOREST MODEL
# ============================
model = RandomForestClassifier(
    n_estimators=300,
    max_depth=10,
    min_samples_split=8,
    class_weight="balanced",
    random_state=42
)

model.fit(X_train, y_train)

# ============================
# EVALUATION
# ============================
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print("✅ Model trained successfully")
print(f"📊 Accuracy: {accuracy:.2f}")

# ============================
# SAVE MODEL & ENCODERS
# ============================
with open("ml/model.pkl", "wb") as f:
    pickle.dump(model, f)

with open("ml/encoders.pkl", "wb") as f:
    pickle.dump(label_encoders, f)

print("💾 model.pkl and encoders.pkl saved")
print("🚀 Training complete")