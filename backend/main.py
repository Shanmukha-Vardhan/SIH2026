from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from firebase_config import db
from matching_engine import compute_score_matrix
from allocator import run_allocation
from company_x_engine import AVOLVE_PROFILE, load_company_x_candidates, run_avolve_allocation

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.get("/api/candidates")
def get_candidates(page: int = 1, limit: int = 20, search: str = None, category: str = None, state: str = None):
    query = db.collection('candidates')
    if category:
        query = query.where('category', '==', category)
    if state:
        query = query.where('state', '==', state)
        
    docs = list(query.stream())
    
    if search:
        docs = [d for d in docs if search.lower() in d.to_dict().get('name', '').lower()]
        
    total = len(docs)
    start = (page - 1) * limit
    end = start + limit
    paginated = [d.to_dict() for d in docs[start:end]]
    
    return {"total": total, "page": page, "limit": limit, "data": paginated}

@app.get("/api/candidates/{candidate_id}")
def get_candidate(candidate_id: str):
    doc = db.collection('candidates').document(candidate_id).get()
    return doc.to_dict() if doc.exists else {"error": "not found"}

@app.get("/api/internships")
def get_internships(page: int = 1, limit: int = 20, search: str = None, sector: str = None, state: str = None):
    query = db.collection('internships')
    if sector:
        query = query.where('sector', '==', sector)
    if state:
        query = query.where('state', '==', state)
        
    docs = list(query.stream())
    
    if search:
        docs = [d for d in docs if search.lower() in d.to_dict().get('company_name', '').lower()]
        
    total = len(docs)
    start = (page - 1) * limit
    end = start + limit
    paginated = [d.to_dict() for d in docs[start:end]]
    
    return {"total": total, "page": page, "limit": limit, "data": paginated}

@app.get("/api/internships/{internship_id}")
def get_internship(internship_id: str):
    doc = db.collection('internships').document(internship_id).get()
    return doc.to_dict() if doc.exists else {"error": "not found"}

@app.post("/api/allocate")
def allocate():
    candidates = [d.to_dict() for d in db.collection('candidates').stream()]
    internships = [d.to_dict() for d in db.collection('internships').stream()]
    
    matrix = compute_score_matrix(candidates, internships)
    result = run_allocation(candidates, internships, matrix)
    
    # Store allocations
    alloc_batch = db.batch()
    alloc_ref = db.collection('allocations')
    
    # Delete old allocations for simplicity
    for doc in alloc_ref.stream():
        alloc_batch.delete(doc.reference)
    alloc_batch.commit()
    
    alloc_batch = db.batch()
    count = 0
    for alloc in result['allocations']:
        doc_ref = alloc_ref.document(str(alloc['candidate_id']))
        alloc_batch.set(doc_ref, alloc)
        count += 1
        if count % 500 == 0:
            alloc_batch.commit()
            alloc_batch = db.batch()
    
    if count % 500 != 0:
        alloc_batch.commit()
        
    # Store stats
    db.collection('stats').document('latest').set(result['stats'])
    
    return {
        "status": "completed",
        "total_matched": result['stats']['total_matched'],
        "total_unmatched": result['stats']['total_unmatched'],
        "avg_score": result['stats']['avg_score']
    }

@app.get("/api/results")
def get_results(page: int = 1, limit: int = 20, min_score: float = None, category: str = None):
    query = db.collection('allocations')
    if min_score is not None:
        query = query.where('score', '>=', min_score)
        
    docs = list(query.stream())
    total = len(docs)
    start = (page - 1) * limit
    end = start + limit
    paginated = [d.to_dict() for d in docs[start:end]]
    
    return {"total": total, "page": page, "limit": limit, "data": paginated}

@app.get("/api/results/{candidate_id}")
def get_result(candidate_id: str):
    doc = db.collection('allocations').document(candidate_id).get()
    return doc.to_dict() if doc.exists else {"error": "not found"}

@app.get("/api/stats")
def get_stats():
    doc = db.collection('stats').document('latest').get()
    if not doc.exists:
        return {"error": "not found"}
    
    data = doc.to_dict()
    
    # Transform dicts into arrays for frontend charts
    score_buckets = data.get('score_distribution_buckets', {})
    data['score_distribution'] = [{'name': k, 'count': v} for k, v in score_buckets.items()]
    
    cat_dist = data.get('category_distribution', {})
    data['category_allocation'] = [{'name': k, 'value': v} for k, v in cat_dist.items()]
    
    state_dist = data.get('state_distribution', {})
    sorted_states = sorted(state_dist.items(), key=lambda x: x[1], reverse=True)[:10]
    data['top_states'] = [{'state': k, 'count': v} for k, v in sorted_states]
    
    sector_dist = data.get('sector_distribution', {})
    data['sector_allocation'] = [{'name': k, 'value': v} for k, v in sector_dist.items()]
    
    return data

# ==========================================
# AVOLVE TECHNOLOGIES (COMPANY X) ENDPOINTS
# ==========================================

_avolve_cache = {
    "applicants": None,
    "last_result": None
}

@app.get("/api/company-x/profile")
def get_company_x_profile():
    return AVOLVE_PROFILE

@app.get("/api/company-x/applicants")
def get_company_x_applicants(page: int = 1, limit: int = 20, search: str = None, category: str = None, area_type: str = None):
    if _avolve_cache["applicants"] is None:
        _avolve_cache["applicants"] = load_company_x_candidates()
        
    applicants = _avolve_cache["applicants"]
    filtered = applicants
    
    if search:
        s = search.lower()
        filtered = [a for a in filtered if s in str(a.get('Name', '')).lower() or s in str(a.get('Applicant_ID', '')).lower() or s in str(a.get('Skills', '')).lower()]
        
    if category:
        filtered = [a for a in filtered if str(a.get('Category', '')).upper() == category.upper()]
        
    if area_type:
        filtered = [a for a in filtered if str(a.get('Area_Type', '')).lower() == area_type.lower()]
        
    total = len(filtered)
    start = (page - 1) * limit
    end = start + limit
    paginated = filtered[start:end]
    
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "data": paginated
    }

@app.post("/api/company-x/allocate")
def allocate_company_x():
    result = run_avolve_allocation()
    _avolve_cache["last_result"] = result
    return result

@app.get("/api/company-x/results")
def get_company_x_results():
    if _avolve_cache["last_result"] is None:
        # If not run yet, run it on the fly
        _avolve_cache["last_result"] = run_avolve_allocation()
    return _avolve_cache["last_result"]

