from pathlib import Path
import pandas as pd
import joblib

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report


# ============================================================
# PATHS
# ============================================================

ROOT = Path(__file__).resolve().parent

DATA_PATH = ROOT / "dataset" / "student_dropout.csv"
MODEL_DIR = ROOT / "model"
MODEL_PATH = MODEL_DIR / "dropout_model.pkl"

MODEL_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# CHECK DATASET
# ============================================================

if not DATA_PATH.exists():
    raise FileNotFoundError(
        f"\nDataset not found!\n"
        f"Expected location:\n{DATA_PATH}\n"
    )

print("Loading dataset...")
df = pd.read_csv(DATA_PATH)

print(f"Dataset loaded successfully!")
print(f"Total rows: {len(df)}")
print(f"Columns: {list(df.columns)}")


# ============================================================
# CHECK TARGET COLUMN
# ============================================================

if "dropout" not in df.columns:
    raise ValueError(
        "\nThe dataset must contain a 'dropout' column.\n"
        f"Available columns: {list(df.columns)}"
    )


# ============================================================
# CLEAN DATA
# ============================================================

# Remove student ID because it is not useful for prediction
if "student_id" in df.columns:
    df = df.drop(columns=["student_id"])


# Convert gender to numbers if it exists
if "gender" in df.columns:

    if df["gender"].dtype == "object":

        gender_map = {
            "male": 0,
            "female": 1,
            "m": 0,
            "f": 1
        }

        df["gender"] = (
            df["gender"]
            .astype(str)
            .str.lower()
            .map(gender_map)
        )

        df["gender"] = df["gender"].fillna(0)


# Convert internet access if it exists
if "internet_access" in df.columns:

    if df["internet_access"].dtype == "object":

        internet_map = {
            "yes": 1,
            "no": 0,
            "true": 1,
            "false": 0
        }

        df["internet_access"] = (
            df["internet_access"]
            .astype(str)
            .str.lower()
            .map(internet_map)
        )

        df["internet_access"] = df["internet_access"].fillna(0)


# ============================================================
# FEATURES
# ============================================================

possible_features = [
    "age",
    "gender",
    "attendance",
    "previous_marks",
    "first_generation",
    "backlogs",
    "financial_difficulty",
    "internet_access",
    "family_income",
    "family_size"
]

# Use only features that actually exist in the CSV
features = [
    column for column in possible_features
    if column in df.columns
]

if not features:
    raise ValueError(
        "\nNo valid prediction features were found in the dataset."
    )


print("\nFeatures used for training:")
for feature in features:
    print(f" - {feature}")


# ============================================================
# PREPARE X AND Y
# ============================================================

X = df[features].copy()

y = pd.to_numeric(
    df["dropout"],
    errors="coerce"
)

# Remove invalid target rows
valid_rows = y.notna()

X = X[valid_rows]
y = y[valid_rows].astype(int)


# Convert all feature values to numeric
for column in X.columns:
    X[column] = pd.to_numeric(
        X[column],
        errors="coerce"
    )

# Replace missing values
X = X.fillna(0)


# ============================================================
# CHECK DATA
# ============================================================

print(f"\nTraining rows: {len(X)}")

print("\nDropout distribution:")
print(y.value_counts())


if len(X) < 10:
    raise ValueError(
        "Dataset contains too few records for training."
    )

if y.nunique() < 2:
    raise ValueError(
        "The dropout column must contain both 0 and 1 values."
    )


# ============================================================
# TRAIN / TEST SPLIT
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


# ============================================================
# RANDOM FOREST MODEL
# ============================================================

clf = RandomForestClassifier(
    n_estimators=200,
    class_weight="balanced",
    random_state=42,
    max_depth=None
)


print("\nTraining Random Forest model...")

clf.fit(X_train, y_train)


# ============================================================
# EVALUATION
# ============================================================

y_pred = clf.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)

print("\n========================================")
print("MODEL TRAINING COMPLETE")
print("========================================")

print(f"Training rows : {len(X_train)}")
print(f"Testing rows  : {len(X_test)}")
print(f"Accuracy      : {accuracy * 100:.2f}%")

print("\nClassification Report:")
print(
    classification_report(
        y_test,
        y_pred,
        zero_division=0
    )
)


# ============================================================
# SAVE MODEL
# ============================================================

joblib.dump(
    {
        "model": clf,
        "features": features
    },
    MODEL_PATH
)

print("\nModel saved successfully!")
print(f"Model path: {MODEL_PATH}")