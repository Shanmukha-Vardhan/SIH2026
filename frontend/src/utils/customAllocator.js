/**
 * Client-Side Custom AI Allocation Engine
 * Computes multi-factor scores, enforces custom quotas & criteria, and selects interns with 0 DB reads.
 */

export function runCustomAllocation(candidates, config) {
  const {
    company_name = 'Custom Enterprise',
    role = 'Intern',
    location = 'Any',
    sector = 'IT',
    vacancies = 20,
    min_cgpa = 7.0,
    max_backlogs = 0,
    target_skills = ['python', 'sql', 'machine-learning'],
    weights = {
      skills: 30,
      semantic: 25,
      academic: 15,
      location: 10,
      inclusivity: 20
    },
    quotas = {
      General: 50,
      OBC: 27,
      SC: 15,
      ST: 5,
      EWS: 3
    },
    toggles = {
      rural_boost: true,
      pwd_priority: true,
      first_time_priority: true
    }
  } = config;

  const targetSkillsSet = new Set(target_skills.map(s => s.toLowerCase().trim()));

  // 1. Score every candidate
  const scoredCandidates = candidates.map(c => {
    // A. Skills Overlap
    const cSkills = new Set(c.Skills_List || []);
    const matchedSkills = [];
    targetSkillsSet.forEach(ts => {
      if (cSkills.has(ts)) matchedSkills.push(ts);
    });
    
    const skillScore = targetSkillsSet.size > 0 
      ? (matchedSkills.length / targetSkillsSet.size) * 100 
      : 0;

    // B. Semantic Resume & Project Match (Keyword density & project relevance)
    const combinedText = `${c.Projects || ''} ${c.Certifications || ''} ${c.Resume_Text || ''}`.toLowerCase();
    let semanticMatches = 0;
    targetSkillsSet.forEach(ts => {
      if (combinedText.includes(ts)) semanticMatches++;
    });
    const semanticScore = targetSkillsSet.size > 0 
      ? Math.min(100, (semanticMatches / targetSkillsSet.size) * 110)
      : 50;

    // C. Academic Score
    const cgpa = typeof c.CGPA === 'number' ? c.CGPA : parseFloat(c.CGPA) || 0;
    let academicScore = 0;
    if (cgpa >= min_cgpa) {
      academicScore = Math.min(100, ((cgpa - 5.0) / 5.0) * 100);
    } else {
      academicScore = Math.max(0, (cgpa / 10.0) * 40);
    }

    const backlogs = typeof c.Backlogs === 'number' ? c.Backlogs : parseInt(c.Backlogs, 10) || 0;
    if (backlogs > max_backlogs) {
      academicScore = Math.max(0, academicScore - 30);
    }

    // D. Location & Relocation
    const prefLocs = String(c.Preferred_Locations || '').toLowerCase();
    const targetLoc = location.toLowerCase();
    const willingRelocate = String(c.Willing_To_Relocate).toLowerCase() === 'true' || String(c.Willing_To_Relocate).toLowerCase() === 'yes';
    
    let locationScore = 30;
    if (targetLoc === 'any' || prefLocs.includes(targetLoc) || prefLocs.includes('any')) {
      locationScore = 100;
    } else if (willingRelocate) {
      locationScore = 80;
    }

    // E. Inclusivity & Affirmative Action
    let affScore = 40;
    const area = String(c.Area_Type || '').toLowerCase();
    if (toggles.rural_boost) {
      if (area === 'rural') affScore += 25;
      else if (area === 'semi-urban') affScore += 10;
    }

    const category = String(c.Category || '').toUpperCase();
    if (['SC', 'ST'].includes(category)) affScore += 20;
    else if (['OBC', 'EWS'].includes(category)) affScore += 15;

    if (toggles.pwd_priority && (c.Differently_Abled === true || String(c.Differently_Abled).toLowerCase() === 'true')) {
      affScore += 20;
    }

    if (toggles.first_time_priority && (c.Previous_PM_Internship === true || String(c.Previous_PM_Internship).toLowerCase() === 'true')) {
      affScore = Math.max(0, affScore - 25);
    }

    const affirmativeScore = Math.min(100, Math.max(0, affScore));

    // Normalize weights to sum to 100
    const totalWeight = (weights.skills + weights.semantic + weights.academic + weights.location + weights.inclusivity) || 100;
    const wSkills = weights.skills / totalWeight;
    const wSemantic = weights.semantic / totalWeight;
    const wAcademic = weights.academic / totalWeight;
    const wLocation = weights.location / totalWeight;
    const wInclusivity = weights.inclusivity / totalWeight;

    const totalScore = (
      (skillScore * wSkills) +
      (semanticScore * wSemantic) +
      (academicScore * wAcademic) +
      (locationScore * wLocation) +
      (affirmativeScore * wInclusivity)
    );

    return {
      ...c,
      score: parseFloat(totalScore.toFixed(2)),
      breakdown: {
        skill_score: parseFloat(skillScore.toFixed(2)),
        semantic_score: parseFloat(semanticScore.toFixed(2)),
        academic_score: parseFloat(academicScore.toFixed(2)),
        location_score: parseFloat(locationScore.toFixed(2)),
        affirmative_score: parseFloat(affirmativeScore.toFixed(2))
      },
      skills_matched: matchedSkills
    };
  });

  // 2. Sort by score descending
  scoredCandidates.sort((a, b) => b.score - a.score);

  // 3. Compute Quota Seats count based on total vacancies
  const quotaCounts = {
    General: Math.max(1, Math.round((quotas.General / 100) * vacancies)),
    OBC: Math.max(0, Math.round((quotas.OBC / 100) * vacancies)),
    SC: Math.max(0, Math.round((quotas.SC / 100) * vacancies)),
    ST: Math.max(0, Math.round((quotas.ST / 100) * vacancies)),
    EWS: Math.max(0, Math.round((quotas.EWS / 100) * vacancies))
  };

  const selected = [];
  const selectedIds = new Set();

  // Phase A: Open Merit (Top scorers regardless of category)
  for (const c of scoredCandidates) {
    if (selected.length < quotaCounts.General) {
      selected.push({
        ...c,
        allocated_under: 'Open Merit (Unreserved)'
      });
      selectedIds.add(c.Applicant_ID || c.candidate_id || c.Name);
    }
  }

  // Phase B: Reserved Quotas
  const reservedKeys = ['OBC', 'SC', 'ST', 'EWS'];
  for (const key of reservedKeys) {
    const quotaTarget = quotaCounts[key];
    let filled = 0;
    for (const c of scoredCandidates) {
      const id = c.Applicant_ID || c.candidate_id || c.Name;
      if (selectedIds.has(id)) continue;
      
      const candidateCat = String(c.Category || '').toUpperCase();
      if (candidateCat === key && filled < quotaTarget && selected.length < vacancies) {
        selected.push({
          ...c,
          allocated_under: `${key} Reserved Quota`
        });
        selectedIds.add(id);
        filled++;
      }
    }
  }

  // Phase C: Fill any remaining seats from top scorers
  if (selected.length < vacancies) {
    for (const c of scoredCandidates) {
      const id = c.Applicant_ID || c.candidate_id || c.Name;
      if (!selectedIds.has(id) && selected.length < vacancies) {
        selected.push({
          ...c,
          allocated_under: 'Merit Pool Fallback'
        });
        selectedIds.add(id);
      }
    }
  }

  // Phase D: Waitlist (Top 10 unallocated)
  const waitlist = [];
  for (const c of scoredCandidates) {
    const id = c.Applicant_ID || c.candidate_id || c.Name;
    if (!selectedIds.has(id) && waitlist.length < 10) {
      waitlist.push({
        ...c,
        waitlist_rank: waitlist.length + 1
      });
    }
  }

  // Stats
  const totalRural = selected.filter(s => String(s.Area_Type || '').toLowerCase() === 'rural').length;
  const totalPwd = selected.filter(s => s.Differently_Abled === true || String(s.Differently_Abled).toLowerCase() === 'true').length;
  const totalFemale = selected.filter(s => String(s.Gender || '').toLowerCase() === 'female').length;
  const avgCgpa = selected.length > 0 ? (selected.reduce((acc, curr) => acc + (parseFloat(curr.CGPA) || 0), 0) / selected.length).toFixed(2) : 0;
  const avgScore = selected.length > 0 ? (selected.reduce((acc, curr) => acc + curr.score, 0) / selected.length).toFixed(2) : 0;

  return {
    total_candidates: candidates.length,
    total_selected: selected.length,
    total_waitlisted: waitlist.length,
    selected_candidates: selected,
    waitlist_candidates: waitlist,
    summary_stats: {
      avg_score: avgScore,
      avg_cgpa: avgCgpa,
      rural_count: totalRural,
      rural_percentage: selected.length > 0 ? ((totalRural / selected.length) * 100).toFixed(1) : 0,
      pwd_count: totalPwd,
      female_count: totalFemale
    }
  };
}
