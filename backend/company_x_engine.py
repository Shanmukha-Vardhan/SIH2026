import pandas as pd
import numpy as np
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# AVOLVE Company Profile & Criteria
AVOLVE_PROFILE = {
    "company_name": "AVOLVE Technologies Pvt. Ltd.",
    "role": "Software & Data Engineering Intern",
    "sector": "IT / Technology",
    "location": "Hyderabad",
    "vacancies": 20,
    "target_skills": ["python", "sql", "machine-learning", "javascript", "problem-solving"],
    "min_cgpa": 7.0,
    "max_backlogs": 0,
    "eligible_qualifications": ["B.Tech", "MCA", "BSc"],
    "quotas": {
        "General": 10,  # Open Merit (50%)
        "OBC": 5,        # 25%
        "SC": 3,         # 15%
        "ST": 1,         # 5%
        "EWS": 1         # 5%
    }
}

DATASET_PATH = os.path.join(os.path.dirname(__file__), '..', 'candidates_company_x.csv')

def load_company_x_candidates():
    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError(f"Dataset not found at {DATASET_PATH}")
    
    df = pd.read_csv(DATASET_PATH)
    # Fill NaN values with safe defaults
    df = df.fillna({
        'Differently_Abled': False,
        'Previous_PM_Internship': False,
        'Backlogs': 0,
        'CGPA': 0.0,
        'Skills': '',
        'Projects': '',
        'Internship_Work_Experience': 'None',
        'Certifications': 'None',
        'Achievements': 'None',
        'Resume_Text': '',
        'Preferred_Locations': '',
        'Preferred_Sectors': '',
        'Preferred_Roles': '',
        'Willing_To_Relocate': 'No',
        'Area_Type': 'Urban'
    })
    
    records = df.to_dict(orient='records')
    for r in records:
        # Standardize types
        r['Skills_List'] = [s.strip().lower() for s in str(r['Skills']).split(',') if s.strip()]
        r['CGPA'] = float(r['CGPA'])
        r['Backlogs'] = int(r['Backlogs'])
        r['Differently_Abled'] = str(r['Differently_Abled']).lower() in ['true', 'yes', '1']
        r['Previous_PM_Internship'] = str(r['Previous_PM_Internship']).lower() in ['true', 'yes', '1']
        r['Willing_To_Relocate'] = str(r['Willing_To_Relocate']).lower() in ['true', 'yes', '1']
    return records

def compute_applicant_score(candidate: dict, target_jd_text: str, vectorizer=None) -> dict:
    target_skills = set(AVOLVE_PROFILE["target_skills"])
    c_skills = set(candidate['Skills_List'])
    
    # 1. Skill Overlap Score (Weight 30%)
    if len(target_skills) > 0:
        skill_intersection = len(c_skills.intersection(target_skills))
        skill_score = min(100.0, (skill_intersection / len(target_skills)) * 100)
    else:
        skill_score = 0.0

    # 2. Semantic NLP Resume & Projects Match (Weight 25%)
    combined_resume = f"{candidate.get('Projects', '')} {candidate.get('Certifications', '')} {candidate.get('Resume_Text', '')}"
    if vectorizer:
        try:
            tfidf_mat = vectorizer.transform([combined_resume, target_jd_text])
            sim = cosine_similarity(tfidf_mat[0:1], tfidf_mat[1:2])[0][0]
            semantic_score = min(100.0, max(0.0, float(sim) * 120))  # Scale up slightly for realistic match
        except Exception:
            semantic_score = 50.0
    else:
        semantic_score = 50.0

    # 3. Academic & Merit Score (Weight 15%)
    cgpa = candidate.get('CGPA', 0.0)
    # Scale CGPA 7.0 - 10.0 to 0 - 100
    if cgpa >= AVOLVE_PROFILE['min_cgpa']:
        academic_score = min(100.0, ((cgpa - 5.0) / 5.0) * 100)
    else:
        academic_score = max(0.0, (cgpa / 10.0) * 50)  # Penalize under min_cgpa

    # Backlog penalty
    if candidate.get('Backlogs', 0) > AVOLVE_PROFILE['max_backlogs']:
        academic_score = max(0.0, academic_score - 30)

    # 4. Location & Relocation Fit (Weight 10%)
    pref_locs = str(candidate.get('Preferred_Locations', '')).lower()
    target_loc = AVOLVE_PROFILE['location'].lower()
    willing_relocate = candidate.get('Willing_To_Relocate', False)
    
    if target_loc in pref_locs or 'any' in pref_locs:
        location_score = 100.0
    elif willing_relocate:
        location_score = 80.0
    else:
        location_score = 30.0

    # 5. Affirmative Action & Inclusivity Boost (Weight 20%)
    # Base 40
    aff_score = 40.0
    
    # Rural / Semi-Urban
    area = str(candidate.get('Area_Type', '')).lower()
    if area == 'rural':
        aff_score += 25.0
    elif area == 'semi-urban':
        aff_score += 10.0
        
    # Social Category
    cat = str(candidate.get('Category', '')).upper()
    if cat in ['SC', 'ST']:
        aff_score += 20.0
    elif cat in ['OBC', 'EWS']:
        aff_score += 15.0
        
    # Differently Abled (PwD)
    if candidate.get('Differently_Abled', False):
        aff_score += 20.0

    # Past PM Internship scheme penalty (prioritize fresh candidates)
    if candidate.get('Previous_PM_Internship', False):
        aff_score = max(0.0, aff_score - 25.0)

    affirmative_score = min(100.0, max(0.0, aff_score))

    # Total Composite Score
    total_score = (
        (skill_score * 0.30) +
        (semantic_score * 0.25) +
        (academic_score * 0.15) +
        (location_score * 0.10) +
        (affirmative_score * 0.20)
    )

    return {
        "total_score": round(total_score, 2),
        "breakdown": {
            "skill_score": round(skill_score, 2),
            "semantic_score": round(semantic_score, 2),
            "academic_score": round(academic_score, 2),
            "location_score": round(location_score, 2),
            "affirmative_score": round(affirmative_score, 2)
        },
        "skills_matched": list(c_skills.intersection(target_skills)),
        "skills_missing": list(target_skills - c_skills)
    }

def run_avolve_allocation():
    candidates = load_company_x_candidates()
    
    # Construct target JD text for semantic NLP matching
    target_jd = f"{AVOLVE_PROFILE['role']} in {AVOLVE_PROFILE['sector']} at {AVOLVE_PROFILE['location']}. Requires skills in {', '.join(AVOLVE_PROFILE['target_skills'])}. Hands on programming, SQL databases, machine learning pipelines, python backends, and problem solving."
    
    all_texts = [f"{c.get('Projects', '')} {c.get('Certifications', '')} {c.get('Resume_Text', '')}" for c in candidates]
    all_texts.append(target_jd)
    
    vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
    vectorizer.fit(all_texts)
    
    scored_candidates = []
    for c in candidates:
        eval_result = compute_applicant_score(c, target_jd, vectorizer)
        c_copy = dict(c)
        c_copy['score'] = eval_result['total_score']
        c_copy['breakdown'] = eval_result['breakdown']
        c_copy['skills_matched'] = eval_result['skills_matched']
        c_copy['skills_missing'] = eval_result['skills_missing']
        scored_candidates.append(c_copy)
        
    # Sort all applicants by total composite score
    scored_candidates.sort(key=lambda x: x['score'], reverse=True)
    
    # Quota Allocator:
    # 10 Open Merit (General/Any category highest score)
    # 5 OBC, 3 SC, 1 ST, 1 EWS
    quotas = dict(AVOLVE_PROFILE['quotas'])
    selected = []
    selected_ids = set()
    
    # Phase 1: Open Merit (Top 10 overall regardless of category)
    for c in scored_candidates:
        if len(selected) < quotas['General']:
            c_assigned = dict(c)
            c_assigned['allocated_under'] = 'Open Merit (Unreserved)'
            selected.append(c_assigned)
            selected_ids.add(c['Applicant_ID'])
            
    # Phase 2: Category Quotas
    category_quotas = {
        'OBC': quotas['OBC'],
        'SC': quotas['SC'],
        'ST': quotas['ST'],
        'EWS': quotas['EWS']
    }
    
    for cat, quota_count in category_quotas.items():
        cat_filled = 0
        for c in scored_candidates:
            if c['Applicant_ID'] in selected_ids:
                continue
            if str(c.get('Category', '')).upper() == cat and cat_filled < quota_count:
                c_assigned = dict(c)
                c_assigned['allocated_under'] = f'{cat} Reserved Quota'
                selected.append(c_assigned)
                selected_ids.add(c['Applicant_ID'])
                cat_filled += 1
                
    # Phase 3: Fill any unfilled reserved seats from remaining top scorers
    if len(selected) < AVOLVE_PROFILE['vacancies']:
        for c in scored_candidates:
            if c['Applicant_ID'] not in selected_ids and len(selected) < AVOLVE_PROFILE['vacancies']:
                c_assigned = dict(c)
                c_assigned['allocated_under'] = 'Merit Pool Fallback'
                selected.append(c_assigned)
                selected_ids.add(c['Applicant_ID'])
                
    # Phase 4: Waitlist (Next 10 highest scorers not in selected)
    waitlist = []
    for c in scored_candidates:
        if c['Applicant_ID'] not in selected_ids and len(waitlist) < 10:
            w_candidate = dict(c)
            w_candidate['waitlist_rank'] = len(waitlist) + 1
            waitlist.append(w_candidate)

    # Compute Allocation Summary Stats
    total_rural = sum(1 for s in selected if str(s.get('Area_Type', '')).lower() == 'rural')
    total_pwd = sum(1 for s in selected if s.get('Differently_Abled', False))
    total_female = sum(1 for s in selected if str(s.get('Gender', '')).lower() == 'female')
    avg_selected_cgpa = round(sum(s['CGPA'] for s in selected) / len(selected), 2) if selected else 0
    avg_selected_score = round(sum(s['score'] for s in selected) / len(selected), 2) if selected else 0
    
    category_counts = {}
    for s in selected:
        cat = s.get('Category', 'General')
        category_counts[cat] = category_counts.get(cat, 0) + 1

    return {
        "company_profile": AVOLVE_PROFILE,
        "total_applicants": len(candidates),
        "total_selected": len(selected),
        "total_waitlisted": len(waitlist),
        "selected_candidates": selected,
        "waitlist_candidates": waitlist,
        "summary_stats": {
            "avg_score": avg_selected_score,
            "avg_cgpa": avg_selected_cgpa,
            "rural_count": total_rural,
            "rural_percentage": round((total_rural / len(selected)) * 100, 1) if selected else 0,
            "pwd_count": total_pwd,
            "female_count": total_female,
            "category_distribution": category_counts
        }
    }
