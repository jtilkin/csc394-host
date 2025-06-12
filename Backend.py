from typing import Optional, List
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
import os

from pydantic import BaseModel
from fastapi import (
    FastAPI, Depends, HTTPException, status, Request, Response, Query
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlmodel import SQLModel, Field, create_engine, Session, select, delete, or_, func
from jose import jwt, JWTError
from passlib.context import CryptContext
import openai
from openai import AsyncOpenAI
import httpx
from fastapi import Body
from dotenv import load_dotenv
load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")
# ----- Auth config -----
SECRET_KEY = os.getenv("JWT_SECRET", "dev-secret-change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def hash_pw(raw: str) -> str:
    return pwd_context.hash(raw)

def verify_pw(raw: str, hashed: str) -> bool:
    return pwd_context.verify(raw, hashed)

def create_token(data: dict, minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES):
    to_encode = data.copy()
    to_encode["exp"] = datetime.utcnow() + timedelta(minutes=minutes)
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)



# ----- Database config -----
sqlite_file_name = "jobs.db"
engine = create_engine(f"sqlite:///{sqlite_file_name}", echo=True)

def get_session():
    with Session(engine) as session:
        yield session

@asynccontextmanager
async def lifespan(app: FastAPI):
    SQLModel.metadata.create_all(engine)
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# ----- Models -----
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str
    hashed_password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    about_me: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    profile_photo_url: Optional[str] = None
    phone: Optional[str] = None
    experience: Optional[str] = None
    skills: Optional[str] = None
    education: Optional[str] = None
    summary: Optional[str] = None
    other: Optional[str] = None

class Employer(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    employer_name: str
    username: str
    hashed_password: str

class JobListing(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    employer_id: int = Field(foreign_key="employer.id")
    title: str
    location: str
    type: str
    experience: str
    salary: str
    description: str

class Application(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    employer_id: int = Field(foreign_key="employer.id")
    job_listing_id: int = Field(foreign_key="joblisting.id")
    status: Optional[str] = Field(default="Submitted")
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    experience: Optional[str] = None
    skills: Optional[str] = None
    education: Optional[str] = None
    summary: Optional[str] = None
    other: Optional[str] = None

# Pydantic models for API
class Credentials(BaseModel):
    username: str
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None

class UpdateUser(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    about_me: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    profile_photo_url: Optional[str] = None

class SignupAttempt(BaseModel):
    username: str
    password: str
    role: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    employer_name: Optional[str] = None
    
class ChatRequest(BaseModel):
    history: list[dict]           
    search_history: Optional[list[str]] = None



# ----- Auth/user routes -----
@app.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(
    attempt: SignupAttempt,
    session: Session = Depends(get_session)
):
    existing_user = session.exec(select(User).where(User.username == attempt.username)).first()
    existing_employer = session.exec(select(Employer).where(Employer.username == attempt.username)).first()
    if existing_user or existing_employer:
        raise HTTPException(409, "Username already taken")
    
    if attempt.role == "user":
        user = User(
            username=attempt.username,
            hashed_password=hash_pw(attempt.password),
            first_name=attempt.first_name,
            last_name=attempt.last_name
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        token = create_token({"sub": attempt.username, "role": "user"})
        # Return the new user object as well!
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "role": "user",
                "id": user.id,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "about_me": user.about_me,
                "location": user.location,
                "linkedin_url": user.linkedin_url,
                "profile_photo_url": user.profile_photo_url,
                "phone": user.phone,
                "experience": user.experience,
                "skills": user.skills,
                "education": user.education,
                "summary": user.summary,
                "other": user.other
            }
        }
    
    elif attempt.role == "employer":
        employer = Employer(
            username=attempt.username,
            hashed_password=hash_pw(attempt.password),
            employer_name=attempt.employer_name
        )
        session.add(employer)
        session.commit()
        session.refresh(employer)
        token = create_token({"sub": attempt.username, "role": "employer"})
        return {
            "access_token": token, 
            "token_type": "bearer",
            "employer": {
                "role": "employer",
                "id": employer.id,
                "employer_name": employer.employer_name,
                "username": employer.username
            }
        }
    
    else:
        raise HTTPException(400, "Invalid role")

@app.post("/login")
def login(
    form: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session)
):
    user = session.exec(select(User).where(User.username == form.username)).first()
    if user and verify_pw(form.password, user.hashed_password):
        session.refresh(user)
        token = create_token({"sub": user.username, "role": "user"})

        return {
            "access_token": token,
            "user": {
                "role": "user",
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "username": user.username,
                "email": user.email,
                "about_me": user.about_me,
                "location": user.location,
                "linkedin_url": user.linkedin_url,
                "profile_photo_url": user.profile_photo_url,
                "phone": user.phone,
                "experience": user.experience,
                "skills": user.skills,
                "education": user.education,
                "summary": user.summary,
                "other": user.other
            }
        }
    
    employer = session.exec(select(Employer).where(Employer.username == form.username)).first()
    if employer and verify_pw(form.password, employer.hashed_password):
        session.refresh(employer)
        token = create_token({"sub": employer.username, "role": "employer"})

        return {
            "access_token": token,
            "user": {
                "role": "employer",
                "id": employer.id,
                "employer_name": employer.employer_name,
                "username": employer.username
            }
        }
    
    raise HTTPException(status_code=401, detail="Invalid credentials")


@app.post("/reset/password")
def reset_password(
    data: dict,
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session)
):
    new_password = data.get("new_password")
    if not new_password:
        raise HTTPException(400, "New password is required")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        role = payload.get("role")
    except JWTError:
        raise HTTPException(401, "Invalid token")

    if role == "user":
        user = session.exec(select(User).where(User.username == username)).first()
        if not user:
            raise HTTPException(404, "User not found")
        user.hashed_password = hash_pw(new_password)
        session.add(user)

    elif role == "employer":
        employer = session.exec(select(Employer).where(Employer.username == username)).first()
        if not employer:
            raise HTTPException(404, "Employer not found")
        employer.hashed_password = hash_pw(new_password)
        session.add(employer)

    else:
        raise HTTPException(400, "Invalid user role")

    session.commit()
    return {"message": "Password updated successfully"}

@app.post("/reset/username")
def reset_username(data: dict, session: Session = Depends(get_session)):
    email = data.get("email")  # or some identifier
    new_username = data.get("new_username")
    user = session.exec(select(User).where(User.email == email)).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found with given email")

    user.username = new_username
    session.add(user)
    session.commit()
    return {"message": "Username updated successfully"}

@app.post("/apply")
def apply_to_job(
    user_id: int = Body(...),
    employer_id: int = Body(...),
    job_listing_id: int = Body(...),
    first_name: Optional[str] = Body(None),
    last_name: Optional[str] = Body(None),
    email: Optional[str] = Body(None),
    phone: Optional[str] = Body(None),
    location: Optional[str] = Body(None),
    linkedin_url: Optional[str] = Body(None),
    experience: Optional[str] = Body(None),
    skills: Optional[str] = Body(None),
    education: Optional[str] = Body(None),
    summary: Optional[str] = Body(None),
    other: Optional[str] = Body(None),
    session: Session = Depends(get_session)
):
    # Check if the application already exists
    existing_application = session.exec(
        select(Application).where(
            (Application.user_id == user_id) &
            (Application.job_listing_id == job_listing_id)
        )
    ).first()

    if existing_application:
        raise HTTPException(status_code=409, detail="You have already applied to this job.")

    application = Application(
        user_id=user_id,
        employer_id=employer_id,
        job_listing_id=job_listing_id,
        first_name=first_name,
        last_name=last_name,
        email=email,
        phone=phone,
        location=location,
        linkedin_url=linkedin_url,
        experience=experience,
        skills=skills,
        education=education,
        summary=summary,
        other=other
    )
    session.add(application)
    session.commit()
    session.refresh(application)
    return {"message": "Application submitted", "application": application}

# ----- User endpoints -----
@app.get("/users", response_model=List[User])
def read_users(session: Session = Depends(get_session)):
    return session.exec(select(User)).all()

@app.get("/users/{user_id}", response_model=User)
def read_user(user_id: int, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    return user

# PUT update a user (NEW)
@app.put("/users/{user_id}")
def update_user(user_id: int, updated_user: User, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    
    data = updated_user.dict(exclude_unset=True, exclude={"id"})
    for key, value in data.items():
        setattr(user, key, value)

    session.add(user)
    session.commit()
    session.refresh(user)

    user = user.dict()
    user["role"] = "user"
    
    return user

@app.delete("/users/{user_id}")
def delete_user(user_id: int, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    session.delete(user); session.commit()
    return {"ok": True}

def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session)
) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
    except JWTError:
        raise HTTPException(401, "Invalid token")
    user = session.exec(select(User).where(User.username == username)).first()
    if not user:
        raise HTTPException(401, "User not found")
    return user



# ----- Employer endpoints -----
@app.post("/employers", response_model=Employer)
def create_employer(emp: Employer, session: Session = Depends(get_session)):
    session.add(emp); session.commit(); session.refresh(emp)
    return emp

@app.get("/employers", response_model=List[Employer])
def read_employers(session: Session = Depends(get_session)):
    return session.exec(select(Employer)).all()

# Get all job listings posted by an employer 
@app.get("/employers/{employer_id}/listings", response_model=List[JobListing])
def get_employer_listings(employer_id: int, session: Session = Depends(get_session)):
    return session.exec(select(JobListing).where(JobListing.employer_id == employer_id)).all()

# GET all applications submitted to an employer
@app.get("/employers/{employer_id}/applications")
def get_received_applications(employer_id: int, session: Session = Depends(get_session)):
    results = session.exec(
        select(Application, JobListing, User)
        .join(JobListing, Application.job_listing_id == JobListing.id)
        .join(User, Application.user_id == User.id)
        .where(Application.employer_id == employer_id)
    ).all()

    applications = []
    for app, listing, user in results:
        data = app.dict()
        data["title"] = listing.title
        applications.append(data)
    
    return applications


# PUT update an employer
@app.put("/employers/{employer_id}")
def update_employer(employer_id: int, updated_employer: Employer, session: Session = Depends(get_session)):
    employer = session.get(Employer, employer_id)
    if not employer:
        raise HTTPException(404, "Employer not found")
    
    data = updated_employer.dict(exclude_unset=True, exclude={"id"})
    for key, value in data.items():
        setattr(employer, key, value)

    session.add(employer)
    session.commit()
    session.refresh(employer)

    employer = employer.dict()
    employer["role"] = "employer"
    
    return employer

@app.delete("/employers/{employer_id}")
def delete_employer(employer_id: int, session: Session = Depends(get_session)):
    emp = session.get(Employer, employer_id)
    if not emp:
        raise HTTPException(404, "Employer not found")
    session.delete(emp); session.commit()
    return {"ok": True}



# ----- Listing endpoints -----
@app.post("/listings", response_model=JobListing)
def create_listing(lst: JobListing, session: Session = Depends(get_session)):
    session.add(lst); session.commit(); session.refresh(lst)
    return lst

# GET all listings
@app.get("/listings", response_model=List[JobListing])
def get_listings(session: Session = Depends(get_session)):
    return session.exec(select(JobListing)).all()

# GET all listings for job cards
@app.get("/jobcard")
def get_listings(session: Session = Depends(get_session)):
    joined = session.exec(
        select(JobListing, Employer.employer_name).join(Employer, Employer.id == JobListing.employer_id)
    ).all()

    listings = []
    for listing, employer_name in joined:
        data = listing.dict()
        data["company"] = employer_name
        listings.append(data)

    return listings

# GET listing by id
@app.get("/listings/{listing_id}", response_model=JobListing)
def get_listing(listing_id: int, session: Session = Depends(get_session)):
    listing = session.get(JobListing, listing_id)
    if not listing:
        raise HTTPException(404, "Listing not found")
    return listing

# PUT update a listing
@app.put("/listings/{listing_id}", response_model=JobListing)
def update_listing(listing_id: int, updated_listing: JobListing, session: Session = Depends(get_session)):
    listing = session.get(JobListing, listing_id)
    if not listing:
        raise HTTPException(404, "Listing not found")
    
    data = updated_listing.dict(exclude_unset=True, exclude={"id", "employer_id"})
    for key, value in data.items():
        setattr(listing, key, value)

    session.add(listing)
    session.commit()
    session.refresh(listing)
    return listing

@app.delete("/listings/{listing_id}")
def delete_listing(listing_id: int, session: Session = Depends(get_session)):
    lst = session.get(JobListing, listing_id)
    if not lst:
        raise HTTPException(404, "Listing not found")
    
    session.exec(delete(Application).where(Application.job_listing_id == listing_id))

    session.delete(lst); session.commit()
    return {"ok": True}



# ----- Application endpoints -----
@app.post("/applications", response_model=Application)
def create_application(application: Application, session: Session = Depends(get_session)):
    session.add(application); session.commit(); session.refresh(application)
    return application

@app.get("/applications", response_model=List[Application])
def read_application(session: Session = Depends(get_session)):
    return session.exec(select(Application)).all()

@app.get("/applications/{user_id}")
def get_applications(user_id: int, session: Session = Depends(get_session)):
    results = session.exec(
        select(Application, JobListing, Employer.employer_name)
        .join(JobListing, Application.job_listing_id == JobListing.id)
        .join(Employer, JobListing.employer_id == Employer.id)
        .where(Application.user_id == user_id)
    ).all()

    # Return list of job listings the user applied to
    listings = []
    for application, listing, employer_name in results:
        data = listing.dict()
        data["app_id"] = application.id
        data["status"] = application.status
        data["company"] = employer_name
        listings.append(data)

    return listings

@app.get("/applications/status/user/{user_id}")
def get_application_status(user_id: int, session: Session = Depends(get_session)):
    statuses = ["Submitted", "Under Review", "Interview", "Rejected", "Accepted"]
    results = {}
    total = 0

    for status in statuses:
        count = session.exec(
            select(func.count()).where(
                Application.status == status,
                Application.user_id == user_id
            )
        ).one()
        results[status] = count
        total += count
        
    results["Total"] = total
    return results

@app.get("/applications/status/employer/{employer_id}")
def get_application_status(employer_id: int, session: Session = Depends(get_session)):
    statuses = ["Submitted", "Under Review", "Interview", "Rejected", "Accepted"]
    results = {}
    total = 0

    for status in statuses:
        count = session.exec(
            select(func.count()).where(
                Application.status == status,
                Application.employer_id == employer_id
            )
        ).one()
        results[status] = count
        total += count
        
    results["Total"] = total
    return results

@app.delete("/applications/{application_id}")
def delete_application(application_id: int, session: Session = Depends(get_session)):
    application = session.get(Application, application_id)
    if not application:
        raise HTTPException(404, "Application not found")
    session.delete(application); session.commit()
    return {"ok": True}

@app.get("/application/{app_id}")
def application_detail(app_id: int, session: Session = Depends(get_session)):
    rec = session.exec(
        select(Application, JobListing, User)
        .join(JobListing, Application.job_listing_id == JobListing.id)
        .join(User,        Application.user_id       == User.id)
        .where(Application.id == app_id)
    ).first()

    if not rec:
        raise HTTPException(404, "Application not found")

    app, listing, applicant = rec
    return {
        "application": app,
        "listing": {
            "id":    listing.id,
            "title": listing.title,
        },
        "applicant": {
            "first_name": applicant.first_name,
            "last_name":  applicant.last_name,
            "email":      applicant.email,
            "phone":      applicant.phone,
            "location":   applicant.location,
            "linkedin":   applicant.linkedin_url,
            "experience": applicant.experience,
            "skills":     applicant.skills,
            "education":  applicant.education,
            "summary":    applicant.summary,
            "other":      applicant.other,
        }
    }

@app.put("/application/{app_id}/status")
def update_application_status(
    app_id: int,
    status: str = Body(..., embed=True),
    session: Session = Depends(get_session)
):
    app = session.get(Application, app_id)
    if not app:
        raise HTTPException(404, "Application not found")

    app.status = status
    session.add(app)
    session.commit()
    session.refresh(app)
    return {"message": "Status updated", "application": app}



# ----- DB Search -----
@app.get("/search")
def search_listings(q: str = Query(...), session: Session = Depends(get_session)):
    query_lower = f"%{q.lower()}%"
    stmt = select(JobListing, Employer.employer_name).join(Employer, JobListing.employer_id == Employer.id).where(
        or_(
            func.lower(Employer.employer_name).like(query_lower),
            func.lower(JobListing.title).like(query_lower),
            func.lower(JobListing.description).like(query_lower),
            func.lower(JobListing.type).like(query_lower),
            func.lower(JobListing.experience).like(query_lower),
            func.lower(JobListing.location).like(query_lower),
            func.lower(JobListing.salary).like(query_lower),
        )
    )

    query_result = session.exec(stmt).all()
    listings = []
    for listing, employer_name in query_result:
        data = listing.dict()
        data["company"] = employer_name
        listings.append(data)
    return listings



# ----- Adzuna -----
ADZUNA_APP_ID = "b93f0af2"
ADZUNA_APP_KEY = "ac2968e9aa37b2d474d60277da360974"

@app.get("/adzuna")
async def get_adzuna_jobs(q: str):
    import httpx
    url = "https://api.adzuna.com/v1/api/jobs/us/search/1"
    params = {
        "app_id": ADZUNA_APP_ID,
        "app_key": ADZUNA_APP_KEY,
        "results_per_page": 10,
        "what": q,
        "content-type": "application/json"
    }

    async with httpx.AsyncClient() as client:
        res = await client.get(url, params=params)
        res.raise_for_status()
        data = res.json()
        return [
            {
                "id": f"adzuna_{j['id']}",
                "title": j["title"],
                "company": j["company"]["display_name"],
                "location": j["location"]["display_name"],
                "salary": j.get("salary_is_predicted") == "1" and "$" or j.get("salary_min"),
                "url": j["redirect_url"],
                "publication_date": j["created"]
            }
            for j in data["results"]
        ]


@app.get("/remote")
async def remote_search(q: str, limit: int = 10):
    jobs = (await _query_remotive({"search": q, "limit": limit}))[:limit]
    return [
        {
            "id": idx,
            "title": j["title"],
            "company": j["company_name"],
            "location": j.get("candidate_required_location") or "Remote",
            "salary": j.get("salary"),
            "url": j["url"],
            "publication_date": j["publication_date"],
        }
        for idx, j in enumerate(jobs, start=1)
    ]

@app.get("/listings/{listing_id}/similar")
async def get_similar_jobs(
    listing_id: int,
    limit: int = 5,
    session: Session = Depends(get_session),
):
    listing = session.get(JobListing, listing_id)
    if not listing:
        raise HTTPException(404, "Listing not found")

    jobs = (await _query_remotive({"search": listing.title, "limit": limit}))[:limit]
    return {
        "local_listing": listing,
        "remote_matches": [
            {
                "title": j["title"],
                "company": j["company_name"],
                "url": j["url"],
                "publication_date": j["publication_date"],
                "salary": j.get("salary"),
            }
            for j in jobs
        ],
    }




GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_REDIRECT_URI = "http://localhost:8000/google-callback"

@app.get("/google-login")
def google_login():
    url = (
        "https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={GOOGLE_REDIRECT_URI}"
        "&response_type=code&scope=openid%20email%20profile"
    )
    return RedirectResponse(url)

@app.get("/google-callback")
def google_callback(code: str):
    # still needa implement the google authentication
    return {"detail": "Google OAuth flow not implemented in this demo"}

@app.get("/debug/usernames")
def get_usernames(session: Session = Depends(get_session)):
    users = session.exec(select(User)).all()
    employers = session.exec(select(Employer)).all()
    return {
        "usernames": [u.username for u in users + employers]
    }
async def _query_adzuna(term: str, limit: int = 3):
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get("http://localhost:8000/adzuna", params={"q": term})
        r.raise_for_status()
        data = r.json()
        return data[:limit]

@app.post("/chat")
async def chat(req: ChatRequest):
    system_prompt = (
        "You are Jobby, a concise, friendly job-search assistant. "
        "If you see job titles, suggest actions or next steps."
    )

    allowed = {"user", "assistant"}
    messages = ([{"role": "system", "content": system_prompt}]
                + [m for m in req.history if m.get("role") in allowed]
   )

    suggestions = []
    if req.search_history:
        last_terms = req.search_history[-3:]              
        for term in last_terms:
            suggestions += await _query_adzuna(term,2)

        
        seen = set()
        uniq  = []
        for j in suggestions:
            key = j["title"]
            if key not in seen and len(uniq) < 4:
                uniq.append(j); seen.add(key)
        suggestions = uniq

        titles = ", ".join(j["title"] for j in suggestions)
        messages.append(
            {
                "role": "system",
                "content": f"Recent searches: {', '.join(last_terms)}. "
                           f"Here are some possible matches: {titles}",
            }
        )

    client = AsyncOpenAI(api_key=openai.api_key)
    resp = await client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages,
        max_tokens=120,
        temperature=0.7,
    )
    reply = resp.choices[0].message.content.strip()

    
    return {
        "reply": reply,
        "jobs": [
            {
                "title": j["title"],
                "company": j["company"],
                "url": j["url"],
            }
            for j in suggestions
        ],
    }

import csv
from fastapi import UploadFile, File

@app.post("/upload_csv")
async def upload_csv(
    employer_id: int = Body(...),
    file: UploadFile = File(...),
    session: Session = Depends(get_session)
):
    contents = await file.read()
    decoded = contents.decode("utf-8").splitlines()
    reader = csv.DictReader(decoded)

    count = 0
    for row in reader:
        try:
            listing = JobListing(
                employer_id=employer_id,
                title=row["title"],
                location=row["location"],
                type=row["type"],
                experience=row["experience"],
                salary=row["salary"],
                description=row["description"]
            )
            session.add(listing)
            count += 1
        except Exception as e:
            print("Skipping row due to error:", e)
            continue

    session.commit()
    return {"message": f"{count} job listings uploaded successfully"}

