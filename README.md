# JobberWobber

# Team Members
Ayush Patel, Jeffrey Tilkin, Aditya Rao, and Rayan Ansari

# Project Pitch
Job hunting for the best listings can be tough with scattered listings and no simple method for following up on applications. Our website provides a single, simple-to-use site where job seekers can search listings and effortlessly monitor application status. In contrast to other sites, we merge straightforward job search functionality with integrated application tracking and useful features such as resume templates, providing clients with everything they require to conduct their job search in one location.

# Front End
We will use React to build a responsive web app that both users and employers can use.

# Back End
We will use SQLite to store user, employer, and job listing information, and deploy a FastAPI server to handle data transfer between the front end and the database.

# Requirements
## Functional
Users should be able to sign up, log in/out, and reset their password.

Users should be able to search, browse, and view job listing details, including title, location, type, experience, and salary.

Users should be able to apply to job listings and monitor their application status.

Employers should be able to sign up, log in/out, and reset their password.

Employers should be able to manage job listings (add new jobs, edit existing listings, or delete expired/incorrect listings).

## Non Functional
Performance: The website should load in under 3 seconds for 95% of users, ensuring smooth navigation and fast access to job listings and application tracking features, even during peak usage times (e.g., graduation season or job fair weeks).

Security: User data, including login credentials and review information, must be encrypted using AES-256 encryption, with secure authentication mechanisms to protect user privacy.

Usability: The website should have an intuitive, easy-to-use interface on desktop devices, achieving a user satisfaction score of at least 80% for ease of navigation and functionality. 

Scalability: The platform must support up to 50 active concurrently without significant slowdowns or issues, especially during peak application times.
