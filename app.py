from flask import Flask, render_template, request, jsonify
import pdfminer.high_level
import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import os

app = Flask(__name__)
nlp = spacy.load("en_core_web_sm")

# Function to extract text from PDF resume
def extract_text_from_pdf(pdf_path):
    return pdfminer.high_level.extract_text(pdf_path)

# Function to extract skills from text
def extract_skills(text):
    doc = nlp(text)
    return list(set([token.text for token in doc if token.pos_ in ["NOUN", "PROPN"]]))

# Function to compare resume with job description and find missing skills
def match_resume_to_job(resume_text, job_description):
    vectorizer = TfidfVectorizer()
    vectors = vectorizer.fit_transform([resume_text, job_description])
    similarity_score = cosine_similarity(vectors[0], vectors[1])[0][0]

    # Extract skills from both resume and job description
    resume_skills = set(extract_skills(resume_text))
    job_skills = set(extract_skills(job_description))
    
    # Find missing skills (skills in job description but not in resume)
    missing_skills = list(job_skills - resume_skills)

    return round(similarity_score * 100, 2), missing_skills  # Convert similarity to percentage

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    if 'resume' not in request.files or request.files['resume'].filename == '':
        return jsonify({"error": "No file selected"}), 400

    job_description = request.form.get('job_description', '').strip()
    resume = request.files['resume']

    # Save and extract text from resume
    resume_path = "uploaded_resume.pdf"
    resume.save(resume_path)
    resume_text = extract_text_from_pdf(resume_path)

    # Extract skills, match with job description, and find missing skills
    match_score, missing_skills = match_resume_to_job(resume_text, job_description)

    # Cleanup the uploaded file
    os.remove(resume_path)

    return jsonify({"match_score": match_score, "missing_skills": missing_skills})

if __name__ == '__main__':
    app.run(debug=True)
