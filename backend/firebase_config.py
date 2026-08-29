import firebase_admin
from firebase_admin import credentials, firestore
import os

def init_firebase():
    """Initialize Firebase with the best available credentials."""
    try:
        firebase_admin.get_app()
    except ValueError:
        # Try service account key first
        sa_path = os.path.join(os.path.dirname(__file__), 'serviceAccountKey.json')
        if os.path.exists(sa_path):
            cred = credentials.Certificate(sa_path)
            firebase_admin.initialize_app(cred)
            print("Firebase initialized with service account key")
        else:
            # Fall back to Application Default Credentials (gcloud auth)
            firebase_admin.initialize_app(options={'projectId': 'pminternship-2026'})
            print("Firebase initialized with ADC (project: pminternship-2026)")

init_firebase()
db = firestore.client()
