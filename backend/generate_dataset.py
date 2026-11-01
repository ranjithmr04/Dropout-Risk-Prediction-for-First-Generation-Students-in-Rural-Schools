from pathlib import Path
import numpy as np
import pandas as pd


# ============================================================
# PATH
# ============================================================

ROOT = Path(__file__).resolve().parent
DATASET_DIR = ROOT / "dataset"
DATASET_PATH = DATASET_DIR / "student_dropout.csv"

DATASET_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# SETTINGS
# ============================================================

NUMBER_OF_STUDENTS = 1000

rng = np.random.default_rng(42)


# ============================================================
# GENERATE STUDENT DATA
# ============================================================

attendance = rng.integers(40, 101, NUMBER_OF_STUDENTS)

previous_marks = rng.integers(35, 101, NUMBER_OF_STUDENTS)

first_generation = rng.choice(
    [0, 1],
    size=NUMBER_OF_STUDENTS,
    p=[0.45, 0.55]
)

backlogs = rng.integers(0, 6, NUMBER_OF_STUDENTS)

financial_difficulty = rng.choice(
    [0, 1],
    size=NUMBER_OF_STUDENTS,
    p=[0.60, 0.40]
)

family_income = rng.integers(
    40000,
    500001,
    NUMBER_OF_STUDENTS
)

family_size = rng.integers(
    2,
    9,
    NUMBER_OF_STUDENTS
)


# ============================================================
# CALCULATE DROPOUT RISK
# ============================================================

risk_score = (
    (100 - attendance) * 0.035
    + (100 - previous_marks) * 0.025
    + first_generation * 0.70
    + backlogs * 0.45
    + financial_difficulty * 0.90
    + (family_income < 100000) * 0.80
    + (family_size >= 6) * 0.25
    + rng.normal(0, 0.50, NUMBER_OF_STUDENTS)
)


# ============================================================
# CREATE TARGET
# ============================================================

threshold = np.quantile(risk_score, 0.65)

dropout = (risk_score > threshold).astype(int)


# ============================================================
# CREATE DATAFRAME
# ============================================================

df = pd.DataFrame({
    "attendance": attendance,
    "previous_marks": previous_marks,
    "first_generation": first_generation,
    "backlogs": backlogs,
    "financial_difficulty": financial_difficulty,
    "family_income": family_income,
    "family_size": family_size,
    "dropout": dropout
})


# ============================================================
# SAVE DATASET
# ============================================================

df.to_csv(DATASET_PATH, index=False)


# ============================================================
# DISPLAY INFORMATION
# ============================================================

print("=" * 60)
print("STUDENT DROPOUT DATASET GENERATED")
print("=" * 60)

print(f"\nNumber of students : {len(df)}")
print(f"Number of columns  : {len(df.columns)}")

print("\nColumns:")
for column in df.columns:
    print(f" - {column}")

print("\nDropout distribution:")
print(df["dropout"].value_counts())

print("\nFirst 10 records:")
print(df.head(10).to_string(index=False))

print("\nDataset saved successfully!")

print(f"\nFile:")
print(DATASET_PATH)