import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, hex_color):
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def add_heading_styled(doc, text, level):
    h = doc.add_heading(text, level=level)
    run = h.runs[0]
    if level == 1:
        run.font.size = Pt(18)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0x71, 0x4B, 0x67) # Odoo Plum
        h.paragraph_format.space_before = Pt(16)
        h.paragraph_format.space_after = Pt(6)
    elif level == 2:
        run.font.size = Pt(14)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0x01, 0x7E, 0x84) # Odoo Teal
        h.paragraph_format.space_before = Pt(12)
        h.paragraph_format.space_after = Pt(4)
    elif level == 3:
        run.font.size = Pt(12)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0x37, 0x41, 0x51)
        h.paragraph_format.space_before = Pt(8)
        h.paragraph_format.space_after = Pt(2)
    return h

def add_callout(doc, text, title="NOTE / BEST PRACTICE"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    set_cell_background(cell, "F3F4F6")
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)
    
    # Left border color accent
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:top w:val="none"/>
            <w:left w:val="single" w:sz="24" w:space="0" w:color="714B67"/>
            <w:bottom w:val="none"/>
            <w:right w:val="none"/>
        </w:tcBorders>
    ''')
    tcPr.append(tcBorders)

    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(2)
    r_title = p.add_run(f"[{title}] ")
    r_title.bold = True
    r_title.font.size = Pt(10)
    r_title.font.color.rgb = RGBColor(0x71, 0x4B, 0x67)

    r_text = p.add_run(text)
    r_text.font.size = Pt(10)
    r_text.font.color.rgb = RGBColor(0x1F, 0x29, 0x37)
    
    p_after = doc.add_paragraph()
    p_after.paragraph_format.space_before = Pt(4)
    p_after.paragraph_format.space_after = Pt(4)

def format_table_headers(tbl, col_names, col_widths=None):
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr_cells = tbl.rows[0].cells
    for i, name in enumerate(col_names):
        hdr_cells[i].text = name
        set_cell_background(hdr_cells[i], "714B67")
        set_cell_margins(hdr_cells[i], top=120, bottom=120, left=140, right=140)
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        for run in p.runs:
            run.font.bold = True
            run.font.size = Pt(9.5)
            run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        if col_widths and i < len(col_widths):
            hdr_cells[i].width = col_widths[i]

def style_table_rows(tbl, zebra=True):
    for r_idx, row in enumerate(tbl.rows[1:]):
        bg = "F9FAFB" if (zebra and r_idx % 2 == 1) else "FFFFFF"
        for cell in row.cells:
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
            for p in cell.paragraphs:
                for run in p.runs:
                    run.font.size = Pt(9)
                    run.font.color.rgb = RGBColor(0x37, 0x41, 0x51)

def build_document(output_path):
    doc = docx.Document()

    # Page Margins (1 inch all around)
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # Document Header / Title
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(0)
    title_p.paragraph_format.space_after = Pt(2)
    r_title = title_p.add_run("LeadAgent7: Multi-Channel Marketing & Tools Blueprint")
    r_title.font.size = Pt(24)
    r_title.font.bold = True
    r_title.font.color.rgb = RGBColor(0x71, 0x4B, 0x67)

    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_after = Pt(14)
    r_sub = sub_p.add_run("Comprehensive Guide for WhatsApp, Email Marketing, Social Media Automation, CSV Ingestion, and Open-Source Infrastructure")
    r_sub.font.size = Pt(12)
    r_sub.font.color.rgb = RGBColor(0x4B, 0x55, 0x63)

    # Metadata Strip
    meta_p = doc.add_paragraph()
    meta_p.paragraph_format.space_after = Pt(18)
    r_meta = meta_p.add_run("Architecture Stack: Vercel (Frontend & API) | Supabase (PostgreSQL RLS) | Render (Microservices) | Groq AI (Llama 3.3)")
    r_meta.font.size = Pt(9.5)
    r_meta.font.bold = True
    r_meta.font.color.rgb = RGBColor(0x01, 0x7E, 0x84)

    # Divider line
    p_div = doc.add_paragraph()
    p_div.paragraph_format.space_after = Pt(12)
    p_div_border = parse_xml(f'<w:pBdr {nsdecls("w")}><w:bottom w:val="single" w:sz="12" w:space="1" w:color="E5E7EB"/></w:pBdr>')
    p_div._p.get_or_add_pPr().append(p_div_border)

    # 1. Executive Summary
    add_heading_styled(doc, "1. Executive Summary", 1)
    doc.add_paragraph(
        "LeadAgent7 is a unified, multi-tenant intelligence and marketing portal designed to automate the entire customer journey: "
        "from social discovery and ad campaigns, through CSV contact uploads and WhatsApp/Email broadcasts, to appointment booking and CRM deal closing. "
        "This document details all open-source tools, free services, integration patterns, and safeguard protocols to operate the platform with zero to minimal SaaS subscription costs."
    )

    # 2. WhatsApp Tools & Messaging Infrastructure
    add_heading_styled(doc, "2. WhatsApp Marketing & Messaging Tools", 1)
    doc.add_paragraph(
        "To avoid Meta's Cloud API per-conversation commercial fees (which range from $0.03 to $0.08 per message), LeadAgent7 uses open-source WhatsApp Web multi-device bridge protocols. "
        "The following open-source tools provide enterprise-grade capabilities:"
    )

    wa_table = doc.add_table(rows=6, cols=4)
    format_table_headers(wa_table, ["Tool Name", "License & Source", "Core Strengths", "Role in LeadAgent7"])
    
    wa_data = [
        ("Evolution API (Top Pick)", "Apache 2.0 (GitHub)", "Turnkey REST API, multi-tenant instances, QR pairing, webhook dispatch, media upload.", "Primary WhatsApp engine container deployed on Render. Dispatches broadcasts and listens for customer replies."),
        ("Baileys", "MIT (GitHub)", "Ultra-fast TypeScript library implementing WhatsApp Web protocol directly over WebSockets.", "Underlying driver used in LeadAgent7's custom bridge adapter (`lib/connectors/whatsapp/baileys-adapter.ts`)."),
        ("WAHA (WhatsApp HTTP API)", "Core MIT (GitHub)", "Docker-ready REST API supporting Baileys and Playwright engines with Swagger docs.", "Alternative drop-in container service for Render deployment."),
        ("Chatwoot", "AGPL-3.0 (GitHub)", "Open-source live chat and omnichannel customer inbox (Intercom/Zendesk alternative).", "Provides multi-agent human fallback inbox when leads request human assistance."),
        ("Typebot.io", "AGPL-3.0 (GitHub)", "Visual drag-and-drop conversational chatbot and qualification form builder.", "Embedded qualification flow triggered automatically when new WhatsApp inquiries arrive.")
    ]

    for row_idx, item in enumerate(wa_data):
        row_cells = wa_table.rows[row_idx + 1].cells
        for col_idx, text in enumerate(item):
            row_cells[col_idx].text = text
            if col_idx == 0:
                row_cells[col_idx].paragraphs[0].runs[0].font.bold = True

    style_table_rows(wa_table)

    add_callout(
        doc,
        "CRITICAL WHATSAPP ANTI-BAN RULES: Sending cold bulk messages without rate limiting will trigger Meta's spam algorithms and ban your number.\n"
        "1. Randomized Jitter: Enforce 8 to 18 seconds randomized pause between outgoing messages.\n"
        "2. Spintax Variations: Vary greetings and phrasing using dynamic tags ({{contact_name}}, {{company}}).\n"
        "3. Warm-up Ladder: Start with 30-50 messages/day in Week 1, ramping up by 30% weekly.\n"
        "4. Immediate Opt-Out: Automatically honor 'Stop' or 'Unsubscribe' replies by tagging the contact as do_not_contact.",
        "WHATSAPP COMPLIANCE & SAFETY"
    )

    # 3. Email Marketing & Customer CSV Ingestion
    add_heading_styled(doc, "3. Email Marketing & Customer CSV Ingestion", 1)
    doc.add_paragraph(
        "LeadAgent7 provides an integrated marketing hub allowing operators to drag-and-drop customer CSV files, map columns, deduplicate records, "
        "and dispatch branded email campaigns with conversion tracking."
    )

    email_table = doc.add_table(rows=5, cols=4)
    format_table_headers(email_table, ["Service / Engine", "Free Tier / Cost", "Type", "Best Use Case"])

    email_data = [
        ("Resend (Top Pick)", "3,000 emails/month free (100/day)", "Developer API", "Transactional emails, booking confirmations, and smart follow-ups. Native React Email integration."),
        ("Brevo (Sendinblue)", "300 emails/day forever (9,000/mo)", "Cloud SMTP & API", "High daily broadcast volume. Zero credit card required, includes unsubscribe management."),
        ("Listmonk", "100% Free (Self-hosted Go engine)", "FOSS Application", "High-volume newsletter & broadcast engine. Deploys in a single Docker container on Render, connects to SES."),
        ("Amazon SES", "$0.10 per 1,000 emails", "Infrastructure", "High-scale delivery for 50,000+ subscriber lists at near-zero operating cost.")
    ]

    for row_idx, item in enumerate(email_data):
        row_cells = email_table.rows[row_idx + 1].cells
        for col_idx, text in enumerate(item):
            row_cells[col_idx].text = text
            if col_idx == 0:
                row_cells[col_idx].paragraphs[0].runs[0].font.bold = True

    style_table_rows(email_table)

    add_heading_styled(doc, "Customer CSV Upload Architecture", 2)
    doc.add_paragraph(
        "1. Ingestion: Client-side CSV stream parsing using PapaParse to handle 50,000+ rows without browser lag.\n"
        "2. Column Mapping: Interactive GUI maps columns ('Full Name' -> contact_name, 'Mobile' -> phone, 'Email' -> email).\n"
        "3. Phone Normalization: Automatically converts international numbers into strict E.164 standard (e.g., +971501234567).\n"
        "4. Idempotent Deduplication: Upserts into the Supabase 'leads' table using ON CONFLICT (organization_id, email) or phone.\n"
        "5. Lifecycle Event Log: Emits a 'csv_imported' event into 'lead_events' with batch metadata for audit trails."
    )

    # 4. Social Media & Ad Automation Tools
    add_heading_styled(doc, "4. Social Media & Ad Automation Tools", 1)
    doc.add_paragraph(
        "LeadAgent7 unifies social discovery across Instagram, Facebook, YouTube, and Google Ads without paying for expensive third-party scraping SaaS:"
    )

    social_table = doc.add_table(rows=5, cols=4)
    format_table_headers(social_table, ["Platform / Tool", "License", "Mechanism", "Function in LeadAgent7"])

    social_data = [
        ("Playwright (Microsoft)", "Apache 2.0", "Headless Chromium Worker on Render", "Automates session management, public Meta Ad Library searches, and public post engagement scraping."),
        ("Crawlee (Apify)", "Apache 2.0", "Node.js Scraping Library", "Provides automatic proxy rotation, request retries, and browser fingerprint randomization."),
        ("n8n (Community)", "Fair-Code / Self-hostable", "Visual Workflow Engine on Render", "Polls Google Ads API, Meta Graph API, and YouTube Analytics every 15 minutes and pushes to Supabase."),
        ("Airbyte Community", "ELv2 (Self-hostable)", "Open-source ELT Pipeline", "Automated synchronization of ad campaign spend, impressions, clicks, and conversion values.")
    ]

    for row_idx, item in enumerate(social_data):
        row_cells = social_table.rows[row_idx + 1].cells
        for col_idx, text in enumerate(item):
            row_cells[col_idx].text = text
            if col_idx == 0:
                row_cells[col_idx].paragraphs[0].runs[0].font.bold = True

    style_table_rows(social_table)

    # 5. Calendar, Appointment Booking & CRM Pipeline
    add_heading_styled(doc, "5. Calendar Booking & CRM Pipeline Tools", 1)
    doc.add_paragraph(
        "Converting marketing touches into booked consultations is handled by integrating open-source scheduling infrastructure:"
    )

    cal_table = doc.add_table(rows=3, cols=4)
    format_table_headers(cal_table, ["Tool", "License", "Integration Pattern", "Key Features"])

    cal_data = [
        ("Cal.com (Top Pick)", "AGPL-3.0 (Commercial Friendly)", "React Component (`@calcom/embed-react`) & Webhooks", "Directly embedded into LeadAgent7 /bookings page. 2-way Google Calendar & Outlook sync, time-slot selection, booking webhooks."),
        ("Twenty CRM", "AGPL-3.0", "Headless GraphQL / REST API", "Modern open-source CRM backend if advanced custom object pipelines are required beyond LeadAgent7's native schema.")
    ]

    for row_idx, item in enumerate(cal_data):
        row_cells = cal_table.rows[row_idx + 1].cells
        for col_idx, text in enumerate(item):
            row_cells[col_idx].text = text
            if col_idx == 0:
                row_cells[col_idx].paragraphs[0].runs[0].font.bold = True

    style_table_rows(cal_table)

    # 6. AI & Intelligent Agents
    add_heading_styled(doc, "6. AI & Intelligence Engine", 1)
    doc.add_paragraph(
        "LeadAgent7 implements strict separation between authoritative mathematics (CTR, CPC, CPL calculated in TypeScript/SQL) and AI reasoning:"
    )

    ai_table = doc.add_table(rows=4, cols=4)
    format_table_headers(ai_table, ["Tool / Model", "Provider", "Latency / Performance", "Application"])

    ai_data = [
        ("Llama 3.3 70B Versatile", "Groq Cloud API", "< 800ms time-to-first-token", "Extracts intent and sentiment from WhatsApp chats and comments; drafts personalized marketing copy; generates executive insights."),
        ("Ollama (Local LLM)", "Self-hosted FOSS", "Free offline inference (Llama 3.2 / Qwen)", "Zero-cost local or VPS fallback when cloud API connectivity is restricted."),
        ("Langfuse", "MIT (Self-hostable)", "Observability & Prompt Logging", "Tracks token usage, response latencies, and evaluates lead scoring accuracy across versioned prompts.")
    ]

    for row_idx, item in enumerate(ai_data):
        row_cells = ai_table.rows[row_idx + 1].cells
        for col_idx, text in enumerate(item):
            row_cells[col_idx].text = text
            if col_idx == 0:
                row_cells[col_idx].paragraphs[0].runs[0].font.bold = True

    style_table_rows(ai_table)

    # 7. Multi-Channel Campaign Execution Blueprint
    add_heading_styled(doc, "7. Step-by-Step Multi-Channel Campaign Execution", 1)
    doc.add_paragraph(
        "When executing a customer outreach campaign from the LeadAgent7 portal, follow this operational runbook:"
    )
    doc.add_paragraph(
        "Step 1: Upload Contact Database\n"
        "• Navigate to Marketing -> New Campaign.\n"
        "• Upload customer CSV file. The portal validates rows, strips invalid phone characters, and sets tenant organization_id.\n\n"
        "Step 2: Audience Segmentation\n"
        "• Apply filters: All Imported Leads, High Score (>70), Uncontacted, or specific tags (e.g., 'VIP October').\n\n"
        "Step 3: Copywriting with Groq AI\n"
        "• Click 'Generate with Groq'. Groq drafts 3 copy variations featuring dynamic placeholders ({{contact_name}}, {{booking_link}}).\n\n"
        "Step 4: Multi-Channel Dispatch Strategy\n"
        "• High Priority: Send WhatsApp broadcast via Render worker with anti-ban jitter (10s delay between messages).\n"
        "• Standard Volume: Send branded HTML email via Resend / Brevo.\n"
        "• Sequential Drip: Send email first; if no booking within 48 hours, automatically trigger a WhatsApp follow-up.\n\n"
        "Step 5: Automated Pipeline Progression\n"
        "• As soon as the customer clicks the link or replies, Supabase Realtime updates the Odoo Kanban column from 'New' -> 'Contacted' -> 'Booking Scheduled'."
    )

    # 8. Infrastructure & Cost Comparison
    add_heading_styled(doc, "8. Infrastructure & Cost Comparison", 1)
    doc.add_paragraph(
        "By pairing Vercel, Supabase, Render, and Open-Source engines, LeadAgent7 delivers the capabilities of a $500+/mo enterprise stack for essentially $0 to $7/mo:"
    )

    cost_table = doc.add_table(rows=6, cols=4)
    format_table_headers(cost_table, ["Stack Layer", "Traditional Enterprise SaaS Cost", "LeadAgent7 Open-Source Stack", "Monthly Cost"])

    cost_data = [
        ("Web Portal & Gateway", "HubSpot CRM ($90/mo) + Retool ($50/mo)", "Next.js App Router on Vercel", "$0 (Vercel Hobby Tier)"),
        ("Database & Auth", "Postgres RDS ($45/mo) + Auth0 ($35/mo)", "Supabase Managed PostgreSQL + RLS", "$0 (Supabase Free Tier)"),
        ("WhatsApp Bridge", "Meta Cloud API ($40-$100/mo in message fees)", "Baileys / Evolution API on Render", "$7/mo (Render Starter with persistent socket)"),
        ("Browser Scraping & Jobs", "Apify / BrightData ($49-$150/mo)", "Playwright Worker on Render", "$0 (Included in worker service)"),
        ("AI Inference Engine", "OpenAI GPT-4o ($30-$80/mo in tokens)", "Groq API (Llama 3.3 70B)", "$0 (Groq Developer Free Tier)")
    ]

    for row_idx, item in enumerate(cost_data):
        row_cells = cost_table.rows[row_idx + 1].cells
        for col_idx, text in enumerate(item):
            row_cells[col_idx].text = text
            if col_idx == 0:
                row_cells[col_idx].paragraphs[0].runs[0].font.bold = True

    style_table_rows(cost_table)

    # Save Document
    doc.save(output_path)
    print(f"Document successfully created at: {output_path}")

if __name__ == "__main__":
    out_dir = r"c:\Users\admin\Music\SKYLETIC"
    out_file = os.path.join(out_dir, "LeadAgent7_Marketing_and_Tools_Blueprint.docx")
    build_document(out_file)
