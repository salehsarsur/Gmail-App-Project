# ASP Project – Exercise 4: Gmail-like Full Stack Webmail with React

##  JIRA Sprint Board

You can find the sprint tracking and user stories here:
[JIRA Sprint Link](https://muradkhalaily.atlassian.net/jira/software/projects/AP/list)


## 📌 Overview

This exercise extends the previous Gmail-like backend project into a complete full-stack Gmail clone using **React** for the frontend. The system continues to rely on a multi-threaded C++ TCP blacklist server, Node.js/Express backend, and introduces a user-friendly and functional email interface with features including JWT authentication, inbox management, and spam filtering.

---

## 🌐 Tech Stack

### Backend
- **Node.js** + **Express** – RESTful API server
- **C++** – TCP server with Bloom filter blacklist from Exercise 2
- **JWT** – Authentication and secure access control
- **Docker + Docker Compose** – Containerized deployment

### Frontend
- **React** – Gmail-style Single Page Application
- **HTML/CSS/JS** – Styling and interaction
- **Bootstrap** – UI components
- **React Router** – SPA routing
- **Dark/Light Theme Toggle**

### Project Management
- **JIRA** – Scrum boards, sprints, and epics
- **Git + GitHub** – Version control and pull request workflow

---

## 🏗️ Project Structure

```
project-root/
├── client/                      # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/          # React components (MailCard, InboxView, etc.)
│   │   ├── pages/               # Login, Register, Inbox, Compose
│   │   ├── context/             # Auth and Theme context
│   │   ├── App.js               # Main Router
│   │   └── index.js
│   └── package.json                      # Node.js Backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── middlewares/
│   └── App.js

├── src/               # C++ Bloom Filter Server
│   ├── BloomFilter/
│   ├── Server_Client/
│   ├── ThreadPool/
│   ├── Hash/
│   ├── HTTP_Methods/
│   ├── Tests/
│   └── Main/
├── uploads/
├── docker-compose.yml
├── Dockerfile.node
├── Dockerfile.bloom
└── README.md
```

---

## 📬 Frontend Functionality (React)

### ✔️ Authentication
- Register & login with form validation
- JWT-based session management
- Profile picture and spam indicator detection

### 📥 Inbox
- View recent sent/received emails
- Dynamic labels (Inbox, Spam, Trash, Sent)
- Search across subject, body, and sender
- Compose and send new mail
- Update/Delete mail entries

### 🎨 Theming
- Toggle between **Dark Mode** and **Light Mode**
- Theme stored in context and persisted between sessions

### ✨ UX Features
- Spam warnings on blacklisted URLs
- Responsive layout for different screen sizes
- Email preview cards and search highlighting
- Live feedback for login failures, blocked content, etc.

---

## 🛡️ Authentication Workflow (JWT)

- `POST /api/users` → Register
- `POST /api/tokens` → Login (receives JWT token)
- JWT stored in frontend and sent in headers as `Authorization: Bearer <token>`
- Protected routes require JWT validation

---

## 🔌 Backend API (Same as EX3)

- `/api/users`, `/api/mails`, `/api/labels`, `/api/blacklist`
- Middleware verifies `Authorization` token and sets `req.userId`

---

## 🧪 Example React Features

```js
// useAuth for global auth context
const { user, login, logout } = useAuth();

// useEffect to fetch user mails
useEffect(() => {
  fetch('/api/mails', {
    headers: { 'Authorization': `Bearer ${user.token}` }
  }).then(res => res.json())
    .then(setMails);
}, []);
```

---

## 🚀 Running the App

### Build & Start Backend + C++ Server & Start Frontend

```bash
docker-compose up --build
```

Visit: [http://localhost:3001](http://localhost:3001)

---

## 📈 JIRA Workflow

- ✅ Stories tracked via [JIRA Board](https://muradkhalaily.atlassian.net/jira/software/projects/AP/list)
- ✅ Tasks created and assigned per feature/component
- ✅ Activity and sprint progress updated regularly
- ✅ Pull requests follow strict review and merge policies
- ✅ Feature branches linked to relevant JIRA issues

---

## 🛠️ Development Guidelines

- All changes must go through **feature branches**
- Each branch tied to a **JIRA ticket**
- Code is reviewed via **Pull Requests**
- Only merged after **approval**
- Frontend and backend tasks tracked in JIRA with statuses: `To Do`, `In Progress`, `Code Review`, `Done`

---

## ✅ Highlights

- Fully functional React frontend with mailbox features
- Integration with secure backend via JWT
- Dockerized full-stack deployment
- Blacklist filtering via Bloom filter TCP server
- Responsive UI and Gmail-like interaction flow
- Scrum-based development with complete documentation

---

![login lightmode](<Screenshot1.png>)
![signup an email](<Screenshot2.png>)
![login darkmode](<Screenshot3.png>)
![inbox](<Screenshot4.png>)
![new mail](<Screenshot5.png>)
![labels and new label](<Screenshot6.png>)
![show and edit the profile pic and the password](<Screenshot7.png>)

---
## 👨‍💼 Authors

- **Murad Khalaily**
- **Saleh Sarsur**
- **Mostafa Shalash**
