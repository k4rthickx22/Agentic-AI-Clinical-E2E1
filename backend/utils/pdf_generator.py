from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer,
    Table, TableStyle, HRFlowable, Image
)
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import pagesizes
from datetime import datetime
import os
import uuid


def add_page_number(canvas_obj, doc):
    page_num_text = f"Page {doc.page}"
    canvas_obj.setFont("Helvetica", 9)
    canvas_obj.drawRightString(550, 20, page_num_text)


def generate_pdf(file_path, patient_data, decision, severity):

    doc = SimpleDocTemplate(
        file_path,
        pagesize=pagesizes.A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    elements = []
    styles = getSampleStyleSheet()

    # ===============================
    # STYLES
    # ===============================
    title_style = styles["Heading1"]
    title_style.textColor = colors.HexColor("#0b5394")
    title_style.fontSize = 18

    section_style = styles["Heading2"]
    section_style.textColor = colors.HexColor("#1f4e79")
    section_style.fontSize = 13

    normal_style = styles["Normal"]
    normal_style.fontSize = 11

    small_style = ParagraphStyle(
        name='SmallText',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.grey
    )

    # ===============================
    # HEADER WITH LOGO
    # ===============================
    logo_path = "assets/medical_logo.png"

    if os.path.exists(logo_path):
        logo = Image(logo_path, width=1.2 * inch, height=1.2 * inch)
    else:
        logo = Paragraph("", normal_style)

    case_id = str(uuid.uuid4())[:8]

    header_text = Paragraph(
        f"<b>AI Clinical Decision Support System</b><br/>"
        f"Comprehensive Clinical Evaluation Report<br/>"
        f"Case ID: {case_id}<br/>"
        f"Generated: {datetime.now().strftime('%d-%m-%Y %H:%M')}",
        normal_style
    )

    header_table = Table([[logo, header_text]], colWidths=[1.5 * inch, 4 * inch])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))

    elements.append(header_table)
    elements.append(Spacer(1, 0.2 * inch))
    elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#0b5394")))
    elements.append(Spacer(1, 0.4 * inch))

    # ===============================
    # PATIENT DETAILS
    # ===============================
    elements.append(Paragraph("Patient Details", section_style))
    elements.append(Spacer(1, 0.2 * inch))

    patient_table_data = [
        ["Age", patient_data["age"]],
        ["Gender", patient_data["gender"]],
        ["Predicted Diagnosis", decision.get("predicted_disease", "N/A")],
        ["Severity Level", severity]
    ]

    table = Table(patient_table_data, colWidths=[2.2 * inch, 3 * inch])
    table.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor("#e9f2fb")),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))

    elements.append(table)
    elements.append(Spacer(1, 0.4 * inch))

    # ===============================
    # PRESENTING SYMPTOMS
    # ===============================
    elements.append(Paragraph("Presenting Complaints", section_style))
    elements.append(Spacer(1, 0.2 * inch))
    elements.append(Paragraph(decision.get("symptoms_summary", "Symptoms analyzed via AI model."), normal_style))
    elements.append(Spacer(1, 0.4 * inch))

    # ===============================
    # RISK ASSESSMENT
    # ===============================
    elements.append(Paragraph("Risk Assessment Summary", section_style))
    elements.append(Spacer(1, 0.2 * inch))
    elements.append(Paragraph(decision.get("risk_summary", "Risk calculated using patient profile and drug compatibility."), normal_style))
    elements.append(Spacer(1, 0.4 * inch))

    # ===============================
    # MEDICATION PLAN
    # ===============================
    elements.append(Paragraph("Medication Plan", section_style))
    elements.append(Spacer(1, 0.2 * inch))

    medication_data = [
        ["Medicine", decision.get("recommended_drug", "N/A")],
        ["Dosage", decision.get("dosage", "N/A")],
        ["Duration", decision.get("duration", "N/A")],
    ]

    med_table = Table(medication_data, colWidths=[2.2 * inch, 3 * inch])
    med_table.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor("#f5f5f5")),
    ]))

    elements.append(med_table)
    elements.append(Spacer(1, 0.4 * inch))

    # ===============================
    # DIETARY ADVICE
    # ===============================
    elements.append(Paragraph("Dietary & Food Intake Recommendations", section_style))
    elements.append(Spacer(1, 0.2 * inch))

    diet_items = decision.get("diet", [
        "Maintain adequate hydration.",
        "Consume balanced meals with sufficient nutrients.",
        "Avoid excessive processed foods."
    ])

    for item in diet_items:
        elements.append(Paragraph(f"• {item}", normal_style))

    elements.append(Spacer(1, 0.4 * inch))

    # ===============================
    # LIFESTYLE MODIFICATIONS
    # ===============================
    elements.append(Paragraph("Lifestyle Modifications", section_style))
    elements.append(Spacer(1, 0.2 * inch))

    lifestyle_items = decision.get("lifestyle", [
        "Ensure adequate rest.",
        "Engage in light physical activity as tolerated.",
        "Avoid stress triggers."
    ])

    for item in lifestyle_items:
        elements.append(Paragraph(f"• {item}", normal_style))

    elements.append(Spacer(1, 0.4 * inch))

    # ===============================
    # WARNING SIGNS
    # ===============================
    elements.append(Paragraph("Warning Signs – Seek Immediate Care If:", section_style))
    elements.append(Spacer(1, 0.2 * inch))

    warning_items = decision.get("warnings", [
        "Symptoms worsen significantly.",
        "High fever persists.",
        "Breathing difficulty develops."
    ])

    for warn in warning_items:
        elements.append(Paragraph(f"• {warn}", normal_style))

    elements.append(Spacer(1, 0.4 * inch))

    # ===============================
    # FOLLOW-UP PLAN
    # ===============================
    elements.append(Paragraph("Follow-Up & Monitoring Plan", section_style))
    elements.append(Spacer(1, 0.2 * inch))
    elements.append(Paragraph(
        decision.get("follow_up", "Follow up with a healthcare provider within 3–5 days or earlier if symptoms worsen."),
        normal_style
    ))
    elements.append(Spacer(1, 0.4 * inch))

    # ===============================
    # DISCLAIMER
    # ===============================
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.grey))
    elements.append(Spacer(1, 0.3 * inch))

    elements.append(Paragraph(
        "<i>This AI-generated report is intended for clinical decision support purposes only. "
        "It does not replace a licensed healthcare professional’s diagnosis or treatment plan.</i>",
        small_style
    ))

    doc.build(elements, onFirstPage=add_page_number, onLaterPages=add_page_number)