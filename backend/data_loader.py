import pandas as pd
from firebase_config import db
import os

def process_boolean(val):
    if pd.isna(val): return False
    val_str = str(val).lower().strip()
    return val_str in ['true', 'yes', '1', 't', 'y']

def load_data():
    candidates_path = '../candidates.csv'
    internships_path = '../internships.csv'
    
    if not os.path.exists(candidates_path) or not os.path.exists(internships_path):
        print("CSV files not found!")
        return

    candidates = pd.read_csv(candidates_path)
    internships = pd.read_csv(internships_path)
    
    print(f"Loaded {len(candidates)} candidates and {len(internships)} internships.")
    
    # Process candidates
    candidates_batch = db.batch()
    candidates_ref = db.collection('candidates')
    count = 0
    for _, row in candidates.iterrows():
        doc_id = str(row['candidate_id'])
        doc_ref = candidates_ref.document(doc_id)
        
        data = row.to_dict()
        data['skills'] = [s.strip() for s in str(data.get('skills', '')).split(',') if s.strip()]
        data['is_aspirational_district'] = process_boolean(data.get('is_aspirational_district'))
        data['is_rural'] = process_boolean(data.get('is_rural'))
        data['past_internship'] = process_boolean(data.get('past_internship'))
        
        candidates_batch.set(doc_ref, data)
        count += 1
        
        if count % 500 == 0:
            candidates_batch.commit()
            candidates_batch = db.batch()
            print(f"Uploaded {count} candidates...")
            
    if count % 500 != 0:
        candidates_batch.commit()
        print(f"Uploaded {count} candidates...")

    # Process internships
    internships_batch = db.batch()
    internships_ref = db.collection('internships')
    count = 0
    for _, row in internships.iterrows():
        doc_id = str(row['internship_id'])
        doc_ref = internships_ref.document(doc_id)
        
        data = row.to_dict()
        data['required_skills'] = [s.strip() for s in str(data.get('required_skills', '')).split(',') if s.strip()]
        
        internships_batch.set(doc_ref, data)
        count += 1
        
        if count % 500 == 0:
            internships_batch.commit()
            internships_batch = db.batch()
            print(f"Uploaded {count} internships...")
            
    if count % 500 != 0:
        internships_batch.commit()
        print(f"Uploaded {count} internships...")

    print("Data upload complete!")

if __name__ == '__main__':
    load_data()
