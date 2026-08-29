def run_allocation(candidates: list, internships: list, score_matrix: list) -> dict:
    score_matrix.sort(key=lambda x: x['total_score'], reverse=True)

    assigned_candidates = set()
    internship_fill = {}
    internship_capacity = {str(i.get('internship_id')): int(i.get('capacity', 1)) for i in internships}

    # Build lookup maps
    candidate_map = {str(c.get('candidate_id')): c for c in candidates}
    internship_map = {str(i.get('internship_id')): i for i in internships}

    allocations = []

    for entry in score_matrix:
        c_id = str(entry['candidate_id'])
        i_id = str(entry['internship_id'])

        if c_id in assigned_candidates:
            continue

        fill_count = internship_fill.get(i_id, 0)
        capacity = internship_capacity.get(i_id, 1)

        if fill_count >= capacity:
            continue

        assigned_candidates.add(c_id)
        internship_fill[i_id] = fill_count + 1

        c_data = candidate_map.get(c_id, {})
        i_data = internship_map.get(i_id, {})

        allocations.append({
            'candidate_id': c_id,
            'internship_id': i_id,
            'score': round(entry['total_score'], 2),
            'breakdown': entry['breakdown'],
            'candidate_name': c_data.get('name', ''),
            'company_name': i_data.get('company_name', ''),
            'candidate_category': c_data.get('category', ''),
            'candidate_state': c_data.get('state', ''),
            'candidate_district': c_data.get('district', ''),
            'candidate_qualification': c_data.get('qualification', ''),
            'candidate_skills': c_data.get('skills', []),
            'candidate_is_aspirational': c_data.get('is_aspirational_district', False),
            'candidate_is_rural': c_data.get('is_rural', False),
            'internship_sector': i_data.get('sector', ''),
            'internship_location': i_data.get('location', ''),
            'internship_required_skills': i_data.get('required_skills', []),
        })

    all_c_ids = set([str(c.get('candidate_id')) for c in candidates])
    unmatched = list(all_c_ids - assigned_candidates)

    # Compute category distribution from allocations
    category_distribution = {}
    aspirational_count = 0
    rural_count = 0
    state_distribution = {}

    for a in allocations:
        cat = a.get('candidate_category', 'Unknown')
        category_distribution[cat] = category_distribution.get(cat, 0) + 1

        st = a.get('candidate_state', 'Unknown')
        state_distribution[st] = state_distribution.get(st, 0) + 1

        if a.get('candidate_is_aspirational'):
            aspirational_count += 1
        if a.get('candidate_is_rural'):
            rural_count += 1

    # Score distribution buckets
    score_buckets = {'0-20': 0, '20-40': 0, '40-60': 0, '60-80': 0, '80-100': 0}
    for a in allocations:
        s = a['score']
        if s < 20:
            score_buckets['0-20'] += 1
        elif s < 40:
            score_buckets['20-40'] += 1
        elif s < 60:
            score_buckets['40-60'] += 1
        elif s < 80:
            score_buckets['60-80'] += 1
        else:
            score_buckets['80-100'] += 1

    # Sector distribution
    sector_distribution = {}
    for a in allocations:
        sec = a.get('internship_sector', 'Unknown')
        sector_distribution[sec] = sector_distribution.get(sec, 0) + 1

    avg_score = round(sum(a['score'] for a in allocations) / len(allocations), 2) if allocations else 0

    stats = {
        'total_candidates': len(candidates),
        'total_internships': len(internships),
        'total_matched': len(allocations),
        'total_unmatched': len(unmatched),
        'match_rate': round(len(allocations) / len(candidates) * 100, 1) if candidates else 0,
        'avg_score': avg_score,
        'category_distribution': category_distribution,
        'aspirational_district_count': aspirational_count,
        'aspirational_district_percentage': round(aspirational_count / len(allocations) * 100, 1) if allocations else 0,
        'rural_count': rural_count,
        'rural_percentage': round(rural_count / len(allocations) * 100, 1) if allocations else 0,
        'state_distribution': state_distribution,
        'score_distribution_buckets': score_buckets,
        'sector_distribution': sector_distribution,
    }

    return {
        'allocations': allocations,
        'stats': stats,
        'unmatched': unmatched
    }
