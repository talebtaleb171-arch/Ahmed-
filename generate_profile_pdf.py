from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, ListItem, ListFlowable
from reportlab.lib.units import inch

def generate_pdf(output_path):
    doc = SimpleDocTemplate(output_path, pagesize=letter)
    styles = getSampleStyleSheet()
    
    # Custom Styles
    title_style = ParagraphStyle(
        'MainTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1E3A8A'),
        spaceAfter=20,
        alignment=1 # Center
    )
    
    subtitle_style = ParagraphStyle(
        'SubTitle',
        parent=styles['Heading2'],
        fontSize=18,
        textColor=colors.HexColor('#10B981'),
        spaceBefore=15,
        spaceAfter=10
    )
    
    normal_style = styles['Normal']
    normal_style.fontSize = 11
    normal_style.leading = 14
    
    content = []
    
    # Header
    content.append(Paragraph("BUSINESS PROFILE", title_style))
    content.append(Paragraph("Groupe DHD", title_style))
    content.append(Paragraph("Industry Leader in Manufacturing, Global Trade & Distribution", styles['Italic']))
    content.append(Spacer(1, 0.2 * inch))
    
    # Website
    content.append(Paragraph("<b>Website:</b> www.groupe-dhd.com", normal_style))
    content.append(Spacer(1, 0.2 * inch))
    
    # Overview
    content.append(Paragraph("Company Overview", subtitle_style))
    content.append(Paragraph("Groupe DHD is a growing Mauritanian industrial and commercial group established in the mid-1980s.", normal_style))
    content.append(Spacer(1, 0.1 * inch))
    content.append(Paragraph("The group operates across three core pillars:", normal_style))
    
    pillars = [
        "1. Manufacturing",
        "2. International Trade",
        "3. Distribution & Logistics"
    ]
    for p in pillars:
        content.append(Paragraph(p, normal_style))
        
    content.append(Spacer(1, 0.1 * inch))
    content.append(Paragraph("<b>Headquarters:</b> Industrial Zone – El Mina, Nouakchott, Mauritania", normal_style))
    content.append(Paragraph("Groupe DHD maintains a strong regional presence through its commercial and logistics networks in neighboring countries.", normal_style))
    
    # Vision
    content.append(Paragraph("Vision", subtitle_style))
    content.append(Paragraph("Groupe DHD strives to become:", normal_style))
    v_items = [
        "A leading industrial and commercial force in West Africa",
        "A bridge between global and regional markets",
        "A model of quality, sustainability, and operational excellence"
    ]
    for i in v_items:
        content.append(Paragraph(f"• {i}", normal_style))
        
    content.append(Spacer(1, 0.1 * inch))
    content.append(Paragraph("Its vision is built upon:", normal_style))
    v_points = [
        "Enhancing value creation locally and regionally",
        "Developing manufacturing operations integrated with global supply chains",
        "Commitment to quality and reliability standards",
        "Transitioning from traditional trade to an integrated industrial and commercial model"
    ]
    for i in v_points:
        content.append(Paragraph(f"✓ {i}", normal_style))
        
    # Operations
    content.append(Paragraph("Groupe DHD Today (Current Operations)", subtitle_style))
    
    # 1. Manufacturing
    content.append(Paragraph("<b>1. Manufacturing</b>", normal_style))
    m_items = [
        "Owns advanced production facilities",
        "Utilizes modern industrial technologies",
        "Focuses on product quality and operational efficiency",
        "Aims to create local added value"
    ]
    for i in m_items:
        content.append(Paragraph(f"• {i}", normal_style))
    content.append(Spacer(1, 0.1 * inch))
        
    # 2. Import & Export
    content.append(Paragraph("<b>2. Import & Export</b>", normal_style))
    ie_items = [
        "Imports products from multiple global markets",
        "Manages supply chains professionally",
        "Connects local markets with international sources",
        "Maintains strategic partnerships with global suppliers"
    ]
    for i in ie_items:
        content.append(Paragraph(f"• {i}", normal_style))
    content.append(Spacer(1, 0.1 * inch))
        
    # 3. Distribution & Logistics
    content.append(Paragraph("<b>3. Distribution & Logistics</b>", normal_style))
    content.append(Paragraph("Groupe DHD operates a distribution network across Mauritania and neighboring countries, with an integrated fleet including:", normal_style))
    fleet = [
        "Heavy transport vehicles (🚛)",
        "Medium vehicles (🚚)",
        "Light vehicles (🚐)"
    ]
    for i in fleet:
        # Note: Standard PDF fonts don't support emojis well, stripping for safety or just text
        content.append(Paragraph(f"• {i.split('(')[0].strip()}", normal_style))
    content.append(Paragraph("Ensuring efficient and flexible delivery to the most remote destinations.", normal_style))
    
    # Presence
    content.append(Paragraph("Geographical Presence", subtitle_style))
    countries = ["Mauritania (Headquarters)", "Mali", "Senegal", "Gambia", "Burkina Faso"]
    content.append(Paragraph(", ".join(countries), normal_style))
    
    # Contact
    content.append(Paragraph("Contact Us", subtitle_style))
    content.append(Paragraph("<b>Address:</b> Zone Industrielle El Mina, Nouakchott, Mauritania (BP: 30019)", normal_style))
    content.append(Paragraph("<b>Phone:</b> +222 25 05 45 44", normal_style))
    content.append(Paragraph("<b>Email:</b> groupedhd@groupe-dhd.com", normal_style))
    content.append(Paragraph("<b>Website:</b> www.groupe-dhd.com", normal_style))
    
    # Conclusion
    content.append(Spacer(1, 0.3 * inch))
    content.append(Paragraph("Conclusion", subtitle_style))
    content.append(Paragraph("Groupe DHD is an integrated industrial and commercial group with manufacturing capabilities, managing international supply chains and providing advanced distribution and logistics solutions across West Africa.", normal_style))

    doc.build(content)
    print(f"PDF generated successfully at: {output_path}")

if __name__ == "__main__":
    path = "C:/Users/Jbuje/Desktop/Groupe_DHD_Profile.pdf"
    generate_pdf(path)
