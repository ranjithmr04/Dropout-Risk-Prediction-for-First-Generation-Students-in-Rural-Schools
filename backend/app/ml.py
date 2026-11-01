from pathlib import Path


# ============================================================
# PROJECT PATH
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent


# ============================================================
# PREDICTION FUNCTION
# ============================================================

def predict_dropout(
    attendance,
    previous_marks,
    first_generation,
    backlogs,
    financial_difficulty,
    family_income,
    family_size
):
    """
    Predict dropout risk for a student.

    This runtime version does not require pandas,
    scipy, scikit-learn or joblib.
    """

    # --------------------------------------------------------
    # Convert input values
    # --------------------------------------------------------

    attendance = float(attendance)
    previous_marks = float(previous_marks)
    first_generation = int(first_generation)
    backlogs = int(backlogs)
    financial_difficulty = int(financial_difficulty)
    family_income = float(family_income)
    family_size = int(family_size)


    # ========================================================
    # RISK SCORE
    # ========================================================

    risk_score = 0.0


    # --------------------------------------------------------
    # Attendance
    # --------------------------------------------------------

    if attendance < 50:
        risk_score += 30

    elif attendance < 60:
        risk_score += 25

    elif attendance < 75:
        risk_score += 15

    elif attendance < 85:
        risk_score += 5


    # --------------------------------------------------------
    # Previous academic marks
    # --------------------------------------------------------

    if previous_marks < 40:
        risk_score += 25

    elif previous_marks < 50:
        risk_score += 20

    elif previous_marks < 60:
        risk_score += 12

    elif previous_marks < 70:
        risk_score += 5


    # --------------------------------------------------------
    # First-generation student
    # --------------------------------------------------------

    if first_generation == 1:
        risk_score += 10


    # --------------------------------------------------------
    # Academic backlogs
    # --------------------------------------------------------

    if backlogs >= 4:
        risk_score += 15

    elif backlogs >= 2:
        risk_score += 10

    elif backlogs == 1:
        risk_score += 5


    # --------------------------------------------------------
    # Financial difficulty
    # --------------------------------------------------------

    if financial_difficulty == 1:
        risk_score += 10


    # --------------------------------------------------------
    # Family income
    # --------------------------------------------------------

    if family_income < 50000:
        risk_score += 10

    elif family_income < 100000:
        risk_score += 7

    elif family_income < 200000:
        risk_score += 3


    # --------------------------------------------------------
    # Family size
    # --------------------------------------------------------

    if family_size >= 8:
        risk_score += 10

    elif family_size >= 6:
        risk_score += 7

    elif family_size >= 4:
        risk_score += 3


    # ========================================================
    # LIMIT SCORE
    # ========================================================

    risk_percentage = max(0.0, min(100.0, risk_score))

    risk_percentage = round(risk_percentage, 2)


    # ========================================================
    # RISK LEVEL
    # ========================================================

    if risk_percentage < 40:

        risk_level = "Low Risk"

        prediction = 0

    elif risk_percentage < 70:

        risk_level = "Medium Risk"

        prediction = 0

    else:

        risk_level = "High Risk"

        prediction = 1


    # ========================================================
    # CONTRIBUTING FACTORS
    # ========================================================

    factors = []


    if attendance < 75:
        factors.append("Low attendance")


    if previous_marks < 60:
        factors.append(
            "Low previous academic marks"
        )


    if backlogs >= 2:
        factors.append(
            "Multiple academic backlogs"
        )


    if financial_difficulty == 1:
        factors.append(
            "Financial difficulty"
        )


    if family_income < 100000:
        factors.append(
            "Low family income"
        )


    if first_generation == 1:
        factors.append(
            "First-generation student"
        )


    if family_size >= 6:
        factors.append(
            "Large family size"
        )


    # ========================================================
    # RECOMMENDATIONS
    # ========================================================

    recommendations = []


    if attendance < 75:
        recommendations.append(
            "Improve class attendance and regular participation."
        )


    if previous_marks < 60:
        recommendations.append(
            "Consider additional academic support or tutoring."
        )


    if backlogs >= 2:
        recommendations.append(
            "Meet an academic advisor and prepare a backlog recovery plan."
        )


    if financial_difficulty == 1:
        recommendations.append(
            "Explore scholarships, financial aid and student support programs."
        )


    if family_income < 100000:
        recommendations.append(
            "Check eligibility for available educational financial assistance."
        )


    if first_generation == 1:
        recommendations.append(
            "Provide mentoring and guidance support for the student."
        )


    if family_size >= 6:
        recommendations.append(
            "Consider additional family and community support services."
        )


    if not recommendations:
        recommendations.append(
            "Continue maintaining good academic performance and attendance."
        )


    # ========================================================
    # RETURN RESULT
    # ========================================================

    return {
        "prediction": prediction,
        "risk_percentage": risk_percentage,
        "risk_level": risk_level,
        "factors": factors,
        "recommendations": recommendations
    }