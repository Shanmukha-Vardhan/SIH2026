/**
 * Exports candidate allocation results as an official CSV file download.
 */
export function exportAllocationToCSV(candidates, companyName = 'Enterprise_Allocation') {
  if (!candidates || candidates.length === 0) {
    alert('No candidates available to export.');
    return;
  }

  const headers = [
    'Allotment_Rank',
    'Applicant_ID',
    'Candidate_Name',
    'Gender',
    'Category',
    'Allocated_Under_Quota',
    'Composite_AI_Score',
    'Skills_Score',
    'NLP_Semantic_Score',
    'Academic_Score',
    'Location_Score',
    'Inclusivity_Score',
    'Highest_Qualification',
    'Branch',
    'CGPA',
    'Backlogs',
    'State',
    'District',
    'Area_Type',
    'Differently_Abled',
    'Matched_Skills'
  ];

  const rows = candidates.map((c, idx) => {
    const breakdown = c.breakdown || {};
    return [
      idx + 1,
      `"${c.Applicant_ID || c.candidate_id || ''}"`,
      `"${(c.Name || c.name || '').replace(/"/g, '""')}"`,
      `"${c.Gender || c.gender || ''}"`,
      `"${c.Category || c.category || 'General'}"`,
      `"${c.allocated_under || 'Open Merit'}"`,
      c.score || 0,
      breakdown.skill_score || 0,
      breakdown.semantic_score || 0,
      breakdown.academic_score || 0,
      breakdown.location_score || 0,
      breakdown.affirmative_score || 0,
      `"${c.Highest_Qualification || c.qualification || ''}"`,
      `"${c.Branch_Specialization || ''}"`,
      c.CGPA || c.cgpa || 0,
      c.Backlogs || 0,
      `"${c.State || c.state || ''}"`,
      `"${c.District || c.district || ''}"`,
      `"${c.Area_Type || 'Rural'}"`,
      c.Differently_Abled ? 'Yes' : 'No',
      `"${(c.skills_matched || []).join(', ')}"`
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  const sanitizedCompanyName = companyName.replace(/[^a-zA-Z0-9_-]/g, '_');
  link.setAttribute('download', `PM_Internship_Allocation_${sanitizedCompanyName}_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
