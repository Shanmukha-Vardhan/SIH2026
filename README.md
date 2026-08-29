# 🇮🇳 PM Internship Smart Allocation Engine
### AI-Powered Multi-Dimensional Candidate-to-Internship Matching & Constitutional Quota Allocation Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Firebase%20Hosting-orange?style=for-the-badge&logo=firebase)](https://pminternship-2026.web.app)
[![React 18](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite%205-61DAFB?style=for-the-badge&logo=react)](https://pminternship-2026.web.app)
[![Python 3.11](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Scikit--Learn-3776AB?style=for-the-badge&logo=python)](https://github.com/Shanmukha-Vardhan/SIH2026)
[![SIH 2026](https://img.shields.io/badge/Hackathon-Smart%20India%20Hackathon%202026-emerald?style=for-the-badge)](https://pminternship-2026.web.app/candidates)

---

## 🌟 Live Demo & Portal Links
- 🌐 **Live Web Application:** [https://pminternship-2026.web.app](https://pminternship-2026.web.app)
- 🏢 **10 Enterprise Companies Catalog:** [https://pminternship-2026.web.app/companies](https://pminternship-2026.web.app/companies)
- 🎛️ **Custom Allocation Studio:** [https://pminternship-2026.web.app/custom-allocation](https://pminternship-2026.web.app/custom-allocation)
- 💼 **AVOLVE Enterprise Portal:** [https://pminternship-2026.web.app/company-x](https://pminternship-2026.web.app/company-x)
- 📊 **National Live Analytics:** [https://pminternship-2026.web.app/dashboard](https://pminternship-2026.web.app/dashboard)
- 👥 **Team SIH Roster:** [https://pminternship-2026.web.app/candidates](https://pminternship-2026.web.app/candidates)

---

## 👥 Team SIH Contributors

| Contributor | Role & Designation | Key Competencies |
| :--- | :--- | :--- |
| **S. Shanmukha Vardhan (TL)** | **Team Lead & Full Stack Developer** | System Architecture, React 18, FastAPI, Greedy Quota Optimizer, Python Engine |
| **Yogendra Sai** | **Machine Learning Engineer** | TF-IDF Vectorization, Cosine Similarity, NLP Resume Context Processing |
| **Dibyanshu Biswal** | **Backend Developer** | FastAPI Microservice Architecture, REST Endpoints, API Security |
| **Shyama Shree Pati** | **UI/UX & Frontend Developer** | Indian GovTech Design System, Responsive UI, Component Flow, a11y |
| **Kodali Lakshmi Samiya** | **Data Engineer** | 2,000+ Resume Dataset Sanitization, Demographic Schemas, Pandas Pipelines |
| **Bathula Vinila** | **QA & Integration Engineer** | Quota Compliance Verification, Deterministic Audit Testing, Cross-Browser Reliability |

---

## 🚀 Key Innovation Pillars

1. **Deterministic 3-Engine AI Architecture:**
   - **Skill Matcher:** Normalized Jaccard Set Similarity on verified technical skills.
   - **NLP Semantic Engine:** TF-IDF Vectorization with Cosine Similarity across unstructured project descriptions.
   - **Constitutional Quota Optimizer:** Two-pass greedy affirmative action allocator enforcing exact reservation splits (Open 50%, OBC 27%, SC 15%, ST 7.5%, EWS 10%).

2. **100% Mathematical Explainability:**
   - Detailed radar scorecards for every single applicant showing exact weights: Skills (30%), NLP (25%), Academics (15%), Location (10%), and Inclusivity (20%).
   - Verification token generation and printable allotment slips.

3. **Zero-Cloud Client-Side Resilience:**
   - Evaluates 2,000+ candidates in under 100ms in-memory without incurring external cloud database read costs.

---

## 🛠️ Local Setup Instructions

### Prerequisites
- Node.js 18+ & npm
- Python 3.10+

### 1. Clone the Repository
```bash
git clone https://github.com/Shanmukha-Vardhan/SIH2026.git
cd SIH2026
```

### 2. Run the Frontend
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run the Python Engine (Optional)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```
