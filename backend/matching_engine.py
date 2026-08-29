def compute_match_score(candidate: dict, internship: dict) -> dict:
    # skill score
    c_skills = set([s.lower() for s in candidate.get('skills', [])])
    i_skills = set([s.lower() for s in internship.get('required_skills', [])])
    
    if len(c_skills.union(i_skills)) > 0:
        jaccard = len(c_skills.intersection(i_skills)) / len(c_skills.union(i_skills))
        skill_score = jaccard * 100
    else:
        skill_score = 0
        
    # sector score
    c_sector = str(candidate.get('sector_preference', '')).lower()
    i_sector = str(internship.get('sector', '')).lower()
    sector_score = 100 if c_sector == i_sector else 0
    
    # location score
    c_loc = str(candidate.get('location_preference', '')).lower()
    i_loc = str(internship.get('location', '')).lower()
    c_state = str(candidate.get('state', '')).lower()
    i_state = str(internship.get('state', '')).lower()
    
    if c_loc == 'any' or c_loc == i_loc or c_state == i_state:
        location_score = 100
    else:
        location_score = 0
        
    # qualification score
    c_qual = str(candidate.get('qualification', '')).lower()
    i_qual = str(internship.get('qualification_required', '')).lower()
    
    if i_qual == 'any' or i_qual == c_qual:
        qualification_score = 100
    else:
        qualification_score = 0
        
    # affirmative score
    aff_score = 50
    if candidate.get('is_aspirational_district'):
        aff_score += 20
    if candidate.get('is_rural'):
        aff_score += 15
        
    cat = str(candidate.get('category', '')).upper()
    if cat in ['SC', 'ST', 'EWS']:
        aff_score += 10
    elif cat == 'OBC':
        aff_score += 5
        
    if candidate.get('past_internship'):
        aff_score -= 15
        
    affirmative_score = max(0, min(100, aff_score))
    
    total = (skill_score * 0.35) + (sector_score * 0.25) + (location_score * 0.15) + (qualification_score * 0.10) + (affirmative_score * 0.15)
    
    return {
        'total_score': total,
        'breakdown': {
            'skill_score': skill_score,
            'sector_score': sector_score,
            'location_score': location_score,
            'qualification_score': qualification_score,
            'affirmative_score': affirmative_score
        }
    }

def compute_score_matrix(candidates: list[dict], internships: list[dict]) -> list[dict]:
    matrix = []
    
    for c in candidates:
        candidate_scores = []
        for i in internships:
            score_data = compute_match_score(c, i)
            candidate_scores.append({
                'candidate_id': c.get('candidate_id'),
                'internship_id': i.get('internship_id'),
                'total_score': score_data['total_score'],
                'breakdown': score_data['breakdown'],
                'candidate': c,
                'internship': i
            })
            
        candidate_scores.sort(key=lambda x: x['total_score'], reverse=True)
        matrix.extend(candidate_scores[:10])
        
    return matrix
