import React, { useEffect, useState } from "react";

import {

  createRoot

} from "react-dom/client";



import {

  BrowserRouter,

  useNavigate,

  Routes,

  Route,

  NavLink,

  Navigate,

  useLocation

} from "react-router-dom";



import {

  GraduationCap,

  LayoutDashboard,

  Users,

  Brain,

  HeartHandshake,

  MessageSquare,

  FileBarChart,

  Settings as SettingsIcon,

  LogOut,

  Menu,

  Bell,

  ShieldCheck,

  Trash2,
  ArrowRight,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Database,
  Sparkles,
  Target,
  TrendingUp,
  UserRound

} from "lucide-react";



import axios from "axios";

import "./style.css";





// ============================================================

// API

// ============================================================



const api = axios.create({

  baseURL: "http\://127.0.0.1:8000/api"

});



api.interceptors.request.use((config) => {

  const token = localStorage.getItem("token");



  if (token) {

    config.headers.Authorization = `Bearer ${token}`;

  }



  return config;

});





// ============================================================

// PUBLIC LAYOUT

// ============================================================



function Public({ children }) {

  return (

    <>

      <header className="public">

        <b>🎓 Dropout Risk</b>



        <nav>

          <NavLink to="/">

            Home

          </NavLink>



          <a href="/#features">

            Features

          </a>



          <NavLink to="/login">

            Login

          </NavLink>



          <NavLink

            className="btn"

            to="/signup"

          >

            Sign Up

          </NavLink>

        </nav>

      </header>



      {children}

    </>

  );

}





// ============================================================

// AUTH LAYOUT

// ============================================================



function Auth({ title, children }) {

  return (

    <Public>

      <main className="auth">

        <div className="card authcard">



          <div className="circle">

            <GraduationCap />

          </div>



          <h2>{title}</h2>



          {children}



        </div>

      </main>

    </Public>

  );

}





// ============================================================

// LOGIN

// ============================================================



function Login() {

  const nav = useNavigate();



  const [x, setX] = useState({

    email: "",

    password: ""

  });



  const [e, setE] = useState("");

  const [loading, setLoading] = useState(false);



  async function go(event) {

    event.preventDefault();



    setE("");

    setLoading(true);



    try {

      const response = await api.post(

        "/auth/login",

        {

          email: x.email.trim().toLowerCase(),

          password: x.password

        }

      );



      localStorage.setItem(

        "token",

        response.data.access_token

      );



      localStorage.setItem(

        "user",

        JSON.stringify({ ...response.data.user, role: String(response.data.user?.role || "teacher").trim().toLowerCase() })

      );



      nav("/dashboard");



    } catch (error) {

      console.error("LOGIN ERROR:", error);



      setE(

        error.response?.data?.detail ||

        "Login failed. Please check your email and password."

      );



    } finally {

      setLoading(false);

    }

  }



  return (

    <Auth title="Welcome Back">



      <p>

        Login to your account

      </p>



      {e && (

        <div className="error">

          {e}

        </div>

      )}



      <form onSubmit={go}>



        <label>

          Email

        </label>



        <input

          type="email"

          required

          value={x.email}

          placeholder="Enter your email"

          onChange={(event) =>

            setX({

              ...x,

              email: event.target.value

            })

          }

        />



        <label>

          Password

        </label>



        <input

          type="password"

          required

          value={x.password}

          placeholder="Enter your password"

          onChange={(event) =>

            setX({

              ...x,

              password: event.target.value

            })

          }

        />



        <div className="row">

          <span></span>



          <NavLink to="/forgot-password">

            Forgot Password?

          </NavLink>

        </div>



        <button

          type="submit"

          disabled={loading}

        >

          {loading ? "Logging in..." : "Login"}

        </button>



      </form>



      <p>

        Don't have an account?{" "}



        <NavLink to="/signup">

          Sign Up

        </NavLink>

      </p>



    </Auth>

  );

}





// ============================================================

// SIGNUP

// ============================================================



function Signup() {

  const nav = useNavigate();



  const [x, setX] = useState({

    full_name: "",

    email: "",

    phone: "",

    password: "",

    role: "teacher"

  });



  const [e, setE] = useState("");

  const [loading, setLoading] = useState(false);



  async function go(event) {

    event.preventDefault();



    setE("");

    setLoading(true);



    try {



      const response = await api.post(

        "/auth/signup",

        {

          full_name: x.full_name.trim(),

          email: x.email.trim().toLowerCase(),

          phone: x.phone.trim() || null,

          password: x.password,

          role: x.role

        }

      );



      alert(

        response.data?.message ||

        "Account created successfully!"

      );



      nav("/login");



    } catch (error) {



      console.error(

        "SIGNUP ERROR:",

        error

      );



      if (error.response?.data?.detail) {



        const detail =

          error.response.data.detail;



        if (Array.isArray(detail)) {



          setE(

            detail

              .map(

                (item) =>

                  item.msg ||

                  "Invalid input"

              )

              .join(", ")

          );



        } else {



          setE(detail);



        }



      } else if (error.request) {



        setE(

          "Cannot connect to backend. Make sure FastAPI is running on port 8000."

        );



      } else {



        setE(

          "Signup failed. Please try again."

        );



      }



    } finally {



      setLoading(false);



    }

  }



  const fields = [

    ["full_name", "Full Name"],

    ["email", "Email"],

    ["phone", "Phone"],

    ["password", "Password"]

  ];



  return (

    <Auth title="Create Account">



      <p>

        Help students stay in school

      </p>



      {e && (

        <div className="error">

          {e}

        </div>

      )}



      <form onSubmit={go}>



        {fields.map(([name, label]) => (

          <div key={name}>



            <label>

              {label}

            </label>



            <input

              type={

                name === "email"

                  ? "email"

                  : name === "password"

                  ? "password"

                  : "text"

              }

              required={

                name !== "phone"

              }

              minLength={

                name === "password"

                  ? 6

                  : undefined

              }

              value={x[name]}

              placeholder={

                `Enter ${label.toLowerCase()}`

              }

              onChange={(event) =>

                setX({

                  ...x,

                  [name]:

                    event.target.value

                })

              }

            />



          </div>

        ))}



        <label>

          Role

        </label>



        <select

          value={x.role}

          onChange={(event) =>

            setX({

              ...x,

              role: event.target.value

            })

          }

        >

          <option value="teacher">

            Teacher

          </option>



          <option value="admin">

            Admin

          </option>



          <option value="ngo">

            NGO

          </option>



        </select>



        <button

          type="submit"

          disabled={loading}

        >

          {loading

            ? "Creating Account..."

            : "Sign Up"}

        </button>



      </form>



      <p>

        Already have an account?{" "}



        <NavLink to="/login">

          Login

        </NavLink>

      </p>



    </Auth>

  );

}





// ============================================================

// FORGOT PASSWORD

// ============================================================



function Forgot() {

  const nav = useNavigate();



  const [email, setEmail] = useState("");

  const [e, setE] = useState("");

  const [loading, setLoading] = useState(false);



  async function go(event) {

    event.preventDefault();



    setE("");

    setLoading(true);



    try {



      await api.post(

        "/auth/forgot-password",

        {

          email: email.trim().toLowerCase()

        }

      );



      nav("/verify", {

        state: {

          email: email.trim().toLowerCase()

        }

      });



    } catch (error) {



      setE(

        error.response?.data?.detail ||

        "Unable to send OTP"

      );



    } finally {



      setLoading(false);



    }

  }



  return (

    <Auth title="Forgot Password">



      <p>

        OTP will be sent to your

        registered email.

      </p>



      {e && (

        <div className="error">

          {e}

        </div>

      )}



      <form onSubmit={go}>



        <label>

          Registered Email

        </label>



        <input

          type="email"

          required

          value={email}

          placeholder="Enter your email"

          onChange={(event) =>

            setEmail(

              event.target.value

            )

          }

        />



        <button

          type="submit"

          disabled={loading}

        >

          {loading

            ? "Sending..."

            : "Send OTP"}

        </button>



      </form>



      <p>

        Remember your password?{" "}



        <NavLink to="/login">

          Login

        </NavLink>

      </p>



    </Auth>

  );

}





// ============================================================

// VERIFY OTP

// ============================================================



function Verify() {

  const nav = useNavigate();

  const location = useLocation();



  const email =

    location.state?.email || "";



  const [otp, setOtp] = useState("");

  const [e, setE] = useState("");

  const [loading, setLoading] = useState(false);



  async function go(event) {

    event.preventDefault();



    setE("");

    setLoading(true);



    try {



      await api.post(

        "/auth/verify-otp",

        {

          email,

          otp

        }

      );



      nav("/reset", {

        state: {

          email,

          otp

        }

      });



    } catch (error) {



      setE(

        error.response?.data?.detail ||

        "Invalid OTP"

      );



    } finally {



      setLoading(false);



    }

  }



  if (!email) {

    return (

      <Auth title="Verify OTP">



        <p>

          Please request a new OTP.

        </p>



        <NavLink to="/forgot-password">

          Request OTP

        </NavLink>



      </Auth>

    );

  }



  return (

    <Auth title="Verify OTP">



      <p>

        Enter the 6-digit OTP sent to{" "}

        {email}

      </p>



      {e && (

        <div className="error">

          {e}

        </div>

      )}



      <form onSubmit={go}>



        <label>

          OTP

        </label>



        <input

          className="otp"

          maxLength="6"

          inputMode="numeric"

          required

          value={otp}

          onChange={(event) =>

            setOtp(

              event.target.value

                .replace(/\D/g, "")

            )

          }

        />



        <button

          type="submit"

          disabled={loading}

        >

          {loading

            ? "Verifying..."

            : "Verify OTP"}

        </button>



      </form>



    </Auth>

  );

}





// ============================================================

// RESET PASSWORD

// ============================================================



function Reset() {

  const nav = useNavigate();

  const location = useLocation();



  const [p, setP] = useState("");

  const [c, setC] = useState("");

  const [e, setE] = useState("");

  const [loading, setLoading] = useState(false);



  async function go(event) {

    event.preventDefault();



    setE("");



    if (p !== c) {

      setE(

        "Passwords do not match"

      );

      return;

    }



    setLoading(true);



    try {



      await api.post(

        "/auth/reset-password",

        {

          email:

            location.state?.email,

          otp:

            location.state?.otp,

          new_password: p

        }

      );



      alert(

        "Password reset successfully."

      );



      nav("/login");



    } catch (error) {



      setE(

        error.response?.data?.detail ||

        "Reset failed"

      );



    } finally {



      setLoading(false);



    }

  }



  return (

    <Auth title="New Password">



      {e && (

        <div className="error">

          {e}

        </div>

      )}



      <form onSubmit={go}>



        <label>

          New Password

        </label>



        <input

          type="password"

          minLength="8"

          required

          value={p}

          onChange={(event) =>

            setP(event.target.value)

          }

        />



        <label>

          Confirm Password

        </label>



        <input

          type="password"

          required

          value={c}

          onChange={(event) =>

            setC(event.target.value)

          }

        />



        <button

          type="submit"

          disabled={loading}

        >

          {loading

            ? "Resetting..."

            : "Reset Password"}

        </button>



      </form>



    </Auth>

  );

}





// ============================================================

// AUTH GUARD

// ============================================================



function Guard({ children }) {

  const token =

    localStorage.getItem("token");



  return token

    ? children

    : (

      <Navigate

        to="/login"

        replace

      />

    );

}





// ============================================================

// APPLICATION LAYOUT

// ============================================================



function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem("user") || "{}"); }
  catch { return {}; }
}

function getUserRole() {
  return String(getCurrentUser().role || "teacher").trim().toLowerCase();
}

function Layout({ children }) {
  const nav = useNavigate();
  const [small, setSmall] = useState(false);
  const user = getCurrentUser();
  const role = getUserRole();

  const roleLinks = {
    admin: [
      ["/dashboard", "Admin Dashboard", LayoutDashboard],
      ["/students", "All Students", Users],
      ["/prediction", "Risk Prediction", Brain],
      ["/interventions", "Interventions", HeartHandshake],
      ["/sms", "SMS Alerts", MessageSquare],
      ["/reports", "Reports", FileBarChart],
      ["/settings", "Settings", SettingsIcon]
    ],
    teacher: [
      ["/dashboard", "Teacher Dashboard", LayoutDashboard],
      ["/students", "Students", Users],
      ["/prediction", "Risk Prediction", Brain],
      ["/interventions", "Interventions", HeartHandshake],
      ["/sms", "Parent SMS", MessageSquare],
      ["/settings", "Settings", SettingsIcon]
    ],
    ngo: [
      ["/dashboard", "NGO Dashboard", LayoutDashboard],
      ["/students", "Support Students", Users],
      ["/interventions", "Support Cases", HeartHandshake],
      ["/reports", "Impact Reports", FileBarChart],
      ["/settings", "Settings", SettingsIcon]
    ]
  };

  const links = roleLinks[role] || roleLinks.teacher;
  const roleTitle = role === "admin" ? "Admin" : role === "ngo" ? "NGO" : "Teacher";
  const roleClass = `role-${role}`;

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    nav("/login");
  }

  return (
    <div className={`layout ${roleClass}`}>
      <aside className={small ? "small" : ""}>
        <div className="brand">
          <div className="brand-mark"><GraduationCap size={21} /></div>
          {!small && <div><b>Dropout<span>Risk</span></b><small>Early Intervention</small></div>}
        </div>

        {!small && <div className="portal-label">{roleTitle} Portal</div>}

        <div className="nav-label">{!small && "WORKSPACE"}</div>
        {links.map(([path, title, Icon]) => (
          <NavLink key={path} to={path} className={({ isActive }) => isActive ? "active" : ""}>
            <Icon size={18} />
            {!small && <span>{title}</span>}
          </NavLink>
        ))}

        <div className="sidebar-spacer" />

        <button className="logout" onClick={logout}>
          <LogOut size={18} />
          {!small && "Logout"}
        </button>
      </aside>

      <section className="main">
        <header>
          <div className="header-left">
            <button className="menu" onClick={() => setSmall(!small)} aria-label="Toggle sidebar">
              <Menu size={19} />
            </button>
            <div>
              <b>{roleTitle} Workspace</b>
              <small>Student early-warning system</small>
            </div>
          </div>

          <div className="header-right">
            <div className="header-status"><span className="status-dot" /> System active</div>
            <Bell size={18} />
            <div className="user-chip">
              <div className="user-avatar"><UserRound size={16} /></div>
              <div><b>{user.full_name || roleTitle}</b><small>{roleTitle}</small></div>
            </div>
          </div>
        </header>
        <div className="content">{children}</div>
      </section>
    </div>
  );
}

function Home() {
  const features = [
    ["ML Risk Prediction", "Estimate student risk using academic, attendance and family indicators.", Brain],
    ["Student Intelligence", "Keep student information organized in one secure workspace.", Database],
    ["Early Intervention", "Turn risk signals into structured support and intervention actions.", HeartHandshake],
    ["Role-Based Workspace", "Separate workflows for administrators, teachers and NGOs.", Users],
    ["Parent Communication", "Prepare and manage important SMS communication for follow-up.", MessageSquare],
    ["Reports & Insights", "Track risk distribution and intervention activity through reports.", FileBarChart]
  ];

  return (
    <Public>
      <section className="hero modern-hero">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={14} /> AI-POWERED EARLY INTERVENTION</div>
          <h1>See the warning signs <span>before a student drops out.</span></h1>
          <p>
            A practical early-warning platform for rural schools that brings student data,
            dropout-risk prediction and intervention workflows into one place.
          </p>
          <div className="hero-actions">
            <NavLink className="btn heroBtn" to="/signup">Start monitoring <ArrowRight size={17} /></NavLink>
            <a className="hero-secondary" href="#features">Explore features</a>
          </div>
          <div className="hero-proof">
            <div><CheckCircle2 size={16} /> Attendance signals</div>
            <div><CheckCircle2 size={16} /> Academic indicators</div>
            <div><CheckCircle2 size={16} /> Family & socioeconomic context</div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="dashboard-preview">
            <div className="preview-top"><span>Risk overview</span><span className="preview-live"><i /> LIVE</span></div>
            <div className="preview-number"><b>Early Warning</b><span>Student support dashboard</span></div>
            <div className="preview-chart">
              <div className="preview-donut"><strong>Risk</strong><small>Monitor</small></div>
              <div className="preview-bars">
                <div><span>High</span><i style={{width:"42%"}} /></div>
                <div><span>Medium</span><i style={{width:"65%"}} /></div>
                <div><span>Low</span><i style={{width:"84%"}} /></div>
              </div>
            </div>
            <div className="preview-alert"><AlertTriangle size={17} /><div><b>Attention needed</b><span>Review high-risk students and plan intervention.</span></div></div>
          </div>
        </div>
      </section>

      <section className="home-stats">
        <div><strong>01</strong><span>Collect student information</span></div>
        <div><strong>02</strong><span>Generate risk insights</span></div>
        <div><strong>03</strong><span>Plan early intervention</span></div>
        <div><strong>04</strong><span>Track support activity</span></div>
      </section>

      <section id="features" className="features modern-features">
        <div className="section-heading"><div className="eyebrow">ONE PLATFORM</div><h2>Everything needed for early action</h2><p>Designed around the workflow of the people supporting students.</p></div>
        <div className="feature-grid">
          {features.map(([title, description, Icon]) => (
            <article key={title} className="feature-card">
              <div className="feature-icon"><Icon size={21} /></div>
              <h3>{title}</h3>
              <p>{description}</p>
              <span className="feature-arrow"><ArrowRight size={15} /></span>
            </article>
          ))}
        </div>
      </section>

      <section className="home-cta">
        <div><div className="eyebrow">READY TO BEGIN?</div><h2>Build a stronger early-warning workflow.</h2><p>Use the platform to organize student data, review risk and coordinate support.</p></div>
        <NavLink className="btn" to="/signup">Create account <ArrowRight size={17} /></NavLink>
      </section>
    </Public>
  );
}

function Stat({ t, v, icon: Icon = Activity, tone = "purple" }) {
  return (
    <article className={`stat stat-${tone}`}>
      <div className="stat-icon"><Icon size={19} /></div>
      <div><small>{t}</small><b>{v}</b></div>
      <div className="stat-accent" />
    </article>
  );
}


function DashboardData({ children }) {
  const [d, setD] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/dashboard")
      .then((response) => setD(response.data))
      .catch((error) => {
        console.error("Dashboard error:", error);
        setError(error.response?.data?.detail || "Unable to load dashboard.");
      });
  }, []);

  if (error) return <div className="error">{error}</div>;
  if (!d) return <div className="dashboard-loading"><Activity size={24} /><p>Loading dashboard...</p></div>;
  return children(d);
}

function DashboardHeader({ role, title, subtitle, icon: Icon }) {
  const roleLabel = role === "admin" ? "ADMIN CONTROL CENTER" : role === "ngo" ? "NGO SUPPORT CENTER" : "TEACHER EARLY-WARNING CENTER";
  return (
    <div className={`dashboard-hero dashboard-${role}`}>
      <div>
        <div className="dashboard-eyebrow"><Icon size={14} /> {roleLabel}</div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="dashboard-hero-icon"><Icon size={34} /></div>
    </div>
  );
}

function DashboardStats({ d }) {
  return (
    <div className="stats">
      <Stat t="Total Students" v={d.total_students ?? 0} icon={Users} tone="purple" />
      <Stat t="High Risk" v={d.high_risk ?? 0} icon={AlertTriangle} tone="red" />
      <Stat t="Medium Risk" v={d.medium_risk ?? 0} icon={Activity} tone="orange" />
      <Stat t="Low Risk" v={d.low_risk ?? 0} icon={CheckCircle2} tone="green" />
    </div>
  );
}

function RiskDistribution({ d }) {
  const high = Number(d.high_percentage ?? 0);
  const medium = Number(d.medium_percentage ?? 0);
  const low = Number(d.low_percentage ?? 0);
  const total = Math.max(0, Math.min(100, high + medium + low));
  const mediumEnd = high + medium;
  return (
    <article className="card analytics-card risk-analytics">
      <div className="card-heading"><div><span className="mini-label">ANALYTICS</span><h3>Risk distribution</h3></div><div className="heading-icon"><TrendingUp size={17} /></div></div>
      <div className="risk-chart-row">
        <div className="risk-donut" style={{background:`conic-gradient(#ef4444 0 ${high}%, #f59e0b ${high}% ${mediumEnd}%, #22c55e ${mediumEnd}% ${total}%, #edf0f6 ${total}% 100%)`}}>
          <div><strong>{d.total_students ?? 0}</strong><span>students</span></div>
        </div>
        <div className="risk-legend">
          <div><i className="dot high-dot" /><span>High risk</span><b>{high}%</b></div>
          <div><i className="dot medium-dot" /><span>Medium risk</span><b>{medium}%</b></div>
          <div><i className="dot low-dot" /><span>Low risk</span><b>{low}%</b></div>
        </div>
      </div>
      <div className="risk-progress"><span style={{width:`${high}%`}} /><span style={{width:`${medium}%`}} /><span style={{width:`${low}%`}} /></div>
    </article>
  );
}

function QuickActions({ role }) {
  const actions = role === "admin"
    ? [["/students", "Manage students", Users], ["/reports", "View reports", FileBarChart], ["/sms", "SMS alerts", MessageSquare]]
    : role === "ngo"
      ? [["/students", "Review students", Users], ["/interventions", "Support cases", HeartHandshake], ["/reports", "Impact reports", FileBarChart]]
      : [["/students", "Add student", Users], ["/prediction", "Run prediction", Brain], ["/sms", "Parent SMS", MessageSquare]];

  return (
    <article className="card quick-actions">
      <div className="card-heading"><div><span className="mini-label">SHORTCUTS</span><h3>Quick actions</h3></div><Target size={19} /></div>
      <div className="quick-action-list">
        {actions.map(([path, title, Icon]) => <NavLink key={path} to={path}><span className="quick-icon"><Icon size={17} /></span><span>{title}</span><ArrowRight size={15} /></NavLink>)}
      </div>
    </article>
  );
}

function WorkflowCard({ role }) {
  const items = role === "admin"
    ? ["Review system-wide student records", "Monitor risk distribution", "Coordinate intervention activity", "Review reports and alerts"]
    : role === "ngo"
      ? ["Review students needing support", "Identify assistance opportunities", "Record intervention activity", "Monitor impact through reports"]
      : ["Add student information", "Run a risk prediction", "Review contributing factors", "Create an intervention plan"];

  return (
    <article className="card workflow-card">
      <div className="card-heading"><div><span className="mini-label">WORKFLOW</span><h3>{role === "admin" ? "Administration flow" : role === "ngo" ? "Support flow" : "Teacher flow"}</h3></div><Activity size={19} /></div>
      <div className="workflow-list">
        {items.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p>{index < items.length - 1 && <i />}</div>)}
      </div>
    </article>
  );
}

function AdminDashboard() {
  return <DashboardData>{(d) => <div className="role-dashboard role-dashboard-admin">
    <DashboardHeader role="admin" title="Admin Dashboard" subtitle="System-wide visibility for student risk, interventions and communication." icon={LayoutDashboard} />
    <DashboardStats d={d} />
    <div className="dashboard-grid dashboard-grid-top"><RiskDistribution d={d} /><QuickActions role="admin" /></div>
    <div className="dashboard-grid"><WorkflowCard role="admin" /><article className="card insight-card"><span className="mini-label">SYSTEM INSIGHT</span><h3>Keep the full student journey visible.</h3><p>Use the student database, risk predictions, interventions, SMS activity and reports as one connected workflow.</p><div className="insight-points"><span><Database size={15} /> Student data</span><span><Brain size={15} /> Risk signals</span><span><HeartHandshake size={15} /> Support actions</span></div></article></div>
  </div>}</DashboardData>;
}

function TeacherDashboard() {
  return <DashboardData>{(d) => <div className="role-dashboard role-dashboard-teacher">
    <DashboardHeader role="teacher" title="Teacher Dashboard" subtitle="Identify students needing attention and move from prediction to intervention." icon={GraduationCap} />
    <DashboardStats d={d} />
    <div className="dashboard-grid dashboard-grid-top"><RiskDistribution d={d} /><QuickActions role="teacher" /></div>
    <div className="dashboard-grid"><WorkflowCard role="teacher" /><article className="card attention-card"><span className="mini-label">ATTENTION QUEUE</span><h3>Students needing follow-up</h3><div className="attention-row high-row"><AlertTriangle size={18} /><div><b>{d.high_risk ?? 0} high-risk students</b><span>Review and plan timely support.</span></div></div><div className="attention-row medium-row"><Activity size={18} /><div><b>{d.medium_risk ?? 0} medium-risk students</b><span>Monitor trends and follow up regularly.</span></div></div><NavLink to="/prediction" className="inline-link">Run a new prediction <ArrowRight size={15} /></NavLink></article></div>
  </div>}</DashboardData>;
}

function NgoDashboard() {
  return <DashboardData>{(d) => <div className="role-dashboard role-dashboard-ngo">
    <DashboardHeader role="ngo" title="NGO Dashboard" subtitle="Coordinate educational, financial and counselling support for students who may need it." icon={HeartHandshake} />
    <DashboardStats d={d} />
    <div className="dashboard-grid dashboard-grid-top"><RiskDistribution d={d} /><QuickActions role="ngo" /></div>
    <div className="dashboard-grid"><WorkflowCard role="ngo" /><article className="card impact-card"><span className="mini-label">SUPPORT OVERVIEW</span><h3>Focus resources where support is needed.</h3><div className="impact-number"><strong>{d.high_risk ?? 0}</strong><span>high-risk cases visible</span></div><p>Use support cases and impact reports to organize follow-up, assistance and intervention records.</p><NavLink to="/interventions" className="inline-link">Open support cases <ArrowRight size={15} /></NavLink></article></div>
  </div>}</DashboardData>;
}

function RoleDashboard() {
  const role = getUserRole();
  if (role === "admin") return <AdminDashboard />;
  if (role === "ngo") return <NgoDashboard />;
  return <TeacherDashboard />;
}


function Students() {

  const [s, setS] =

    useState([]);



  const [x, setX] =

    useState({

      student_id: "",

      name: "",

      age: 14,

      gender: "",

      attendance: 80,

      previous_marks: 70,

      first_generation: 1,

      backlogs: 0,

      financial_difficulty: 0,

      family_income: 150000,

      family_size: 4,

      parent_education: "",

      phone: ""

    });



  const [loading, setLoading] =

    useState(false);



  const load = async () => {

    try {

      const response = await api.get("/students");



      let data = response.data;



      // FastAPI normally returns an array.

      // Also handle wrapped or stringified responses safely.

      if (typeof data === "string") {

        try {

          data = JSON.parse(data);

        } catch {

          data = [];

        }

      }



      if (data && !Array.isArray(data)) {

        data = data.students ?? data.data ?? data.results ?? [];

      }



      const students = Array.isArray(data) ? data : [];



      setS(students);



      console.log("Students loaded successfully:", students);

    } catch (error) {

      console.error("Students loading error:", error);



      setS([]);



      const status = error.response?.status;

      const detail = error.response?.data?.detail;



      if (status === 401) {

        console.error("Student API returned 401. Please log in again.");

      } else if (status) {

        console.error(`Student API returned ${status}:`, detail || error.response?.data);

      }

    }

  };



  useEffect(() => {

    load();

  }, []);



  async function deleteStudent(student) {

    const studentId = student.id ?? student.student_id;



    if (!studentId) {

      alert("Unable to identify this student.");

      return;

    }



    const confirmed = window.confirm(

      `Are you sure you want to delete ${student.name || "this student"}?`

    );



    if (!confirmed) {

      return;

    }



    try {

      await api.delete(`/students/${studentId}`);



      alert("Student deleted successfully.");



      await load();

    } catch (error) {

      console.error("Student delete error:", error);



      alert(

        error.response?.data?.detail ||

        "Unable to delete student. Make sure the backend DELETE endpoint is available."

      );

    }

  }



  async function go(event) {



    event.preventDefault();



    setLoading(true);



    try {



      await api.post(

        "/students",

        {

          ...x,



          age: Number(x.age),



          attendance:

            Number(x.attendance),



          previous_marks:

            Number(x.previous_marks),



          first_generation:

            Number(x.first_generation),



          backlogs:

            Number(x.backlogs),



          financial_difficulty:

            Number(

              x.financial_difficulty

            ),



          family_income:

            Number(

              x.family_income

            ),



          family_size:

            Number(x.family_size)

        }

      );



      alert(

        "Student saved and risk prediction completed."

      );



      setX({

        student_id: "",

        name: "",

        age: 14,

        gender: "",

        attendance: 80,

        previous_marks: 70,

        first_generation: 1,

        backlogs: 0,

        financial_difficulty: 0,

        family_income: 150000,

        family_size: 4,

        parent_education: "",

        phone: ""

      });



      await load();



    } catch (error) {



      alert(

        error.response?.data?.detail ||

        "Unable to save student"

      );



    } finally {



      setLoading(false);



    }

  }



  const inputFields = [

    "student_id",

    "name",

    "age",

    "gender",

    "attendance",

    "previous_marks",

    "first_generation",

    "backlogs",

    "financial_difficulty",

    "family_income",

    "family_size",

    "parent_education",

    "phone"

  ];



  const numberFields = [

    "age",

    "attendance",

    "previous_marks",

    "first_generation",

    "backlogs",

    "financial_difficulty",

    "family_income",

    "family_size"

  ];



  return (

    <>



      <h1>

        Students

      </h1>



      <div className="grid">



        <article className="card">



          <h3>

            Add Student

          </h3>



          <form

            className="formgrid"

            onSubmit={go}

          >



            {inputFields.map(

              (key) => (



                <div key={key}>



                  <label>

                    {key.replaceAll(

                      "_",

                      " "

                    )}

                  </label>



                  <input

                    type={

                      numberFields.includes(

                        key

                      )

                        ? "number"

                        : "text"

                    }

                    step={

                      [

                        "attendance",

                        "previous_marks",

                        "family_income"

                      ].includes(key)

                        ? "0.01"

                        : undefined

                    }

                    required={[

                      "student_id",

                      "name"

                    ].includes(key)}

                    value={x[key]}

                    onChange={(event) =>

                      setX({

                        ...x,

                        [key]:

                          event.target.value

                      })

                    }

                  />



                </div>



              )

            )}



            <button

              type="submit"

              disabled={loading}

            >

              {loading

                ? "Saving..."

                : "Save & Predict"}

            </button>



          </form>



        </article>



        <article className="card table">



          <h3>

            Students

          </h3>



          <table>



            <thead>



              <tr>

                <th>ID</th>

                <th>Name</th>

                <th>Attendance</th>

                <th>Risk</th>

                <th className="student-action-header">Action</th>

              </tr>



            </thead>



            <tbody>



              {s.length === 0 ? (



                <tr>

                  <td colSpan="5">

                    No students found.

                  </td>

                </tr>



              ) : (



                s.map(

                  (student) => (



                    <tr

                      key={

                        student.id ??

                        student.student_id

                      }

                    >



                      <td>

                        {student.student_id}

                      </td>



                      <td>

                        {student.name}

                      </td>



                      <td>

                        {student.attendance}%

                      </td>



                      <td>



                        <b

                          className={String(

                            student.risk_level ||

                            ""

                          ).toLowerCase()}

                        >

                          {

                            student.risk_level ||

                            "Not predicted"

                          }

                        </b>



                      </td>



                      <td className="student-action-cell">

                        <button

                          type="button"

                          className="delete-student-btn"

                          title={`Delete ${student.name || "student"}`}

                          aria-label={`Delete ${student.name || "student"}`}

                          onClick={() =>

                            deleteStudent(student)

                          }

                        >

                          <Trash2 size={17} />

                        </button>

                      </td>



                    </tr>



                  )

                )



              )}



            </tbody>



          </table>



        </article>



      </div>



    </>

  );

}





// ============================================================

// RISK PREDICTION

// ============================================================



function Prediction() {

  const [x, setX] = useState({

    attendance: 75,

    previous_marks: 70,

    first_generation: 1,

    backlogs: 1,

    financial_difficulty: 0,

    family_income: 150000,

    family_size: 4

  });



  const [r, setR] = useState(null);

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);



  // -----------------------------------------

  // HANDLE INPUT CHANGE

  // -----------------------------------------

  function handleChange(event) {

    const { name, value } = event.target;



    setX((previous) => ({

      ...previous,

      [name]: value

    }));

  }



  // -----------------------------------------

  // RUN PREDICTION

  // -----------------------------------------

  async function go(event) {

    event.preventDefault();



    setError("");

    setR(null);



    // ---------------------------------------

    // Convert all values to proper numbers

    // ---------------------------------------

    const data = {

      attendance: Number(x.attendance),

      previous_marks: Number(x.previous_marks),

      first_generation: Number(x.first_generation),

      backlogs: Number(x.backlogs),

      financial_difficulty: Number(x.financial_difficulty),

      family_income: Number(x.family_income),

      family_size: Number(x.family_size)

    };



    // ---------------------------------------

    // Frontend validation

    // ---------------------------------------



    if (

      Number.isNaN(data.attendance) ||

      data.attendance < 0 ||

      data.attendance > 100

    ) {

      setError("Attendance must be between 0 and 100.");

      return;

    }



    if (

      Number.isNaN(data.previous_marks) ||

      data.previous_marks < 0 ||

      data.previous_marks > 100

    ) {

      setError("Previous marks must be between 0 and 100.");

      return;

    }



    if (

      data.first_generation !== 0 &&

      data.first_generation !== 1

    ) {

      setError("First generation must be 0 or 1.");

      return;

    }



    if (

      Number.isNaN(data.backlogs) ||

      data.backlogs < 0

    ) {

      setError("Backlogs cannot be negative.");

      return;

    }



    if (

      data.financial_difficulty !== 0 &&

      data.financial_difficulty !== 1

    ) {

      setError("Financial difficulty must be 0 or 1.");

      return;

    }



    if (

      Number.isNaN(data.family_income) ||

      data.family_income < 0

    ) {

      setError("Family income cannot be negative.");

      return;

    }



    if (

      Number.isNaN(data.family_size) ||

      data.family_size < 1

    ) {

      setError("Family size must be at least 1.");

      return;

    }



    console.log("Prediction request:", data);



    setLoading(true);



    try {

      // -------------------------------------

      // IMPORTANT

      // api baseURL should be:

      // http\://127.0.0.1:8000/api

      //

      // Therefore endpoint is only /predict

      // -------------------------------------



      const response = await api.post(

        "/predict",

        data

      );



      console.log(

        "Prediction response:",

        response.data

      );



      setR(response.data);



    } catch (error) {

      console.error(

        "Prediction error:",

        error

      );



      console.error(

        "Server response:",

        error.response?.data

      );



      // -------------------------------------

      // FastAPI 422 validation error

      // -------------------------------------

      if (

        error.response?.status === 422

      ) {

        const detail =

          error.response?.data?.detail;



        if (Array.isArray(detail)) {

          const messages = detail.map(

            (item) => {

              const field =

                Array.isArray(item.loc)

                  ? item.loc[

                      item.loc.length - 1

                    ]

                  : "field";



              return `${field}: ${item.msg}`;

            }

          );



          setError(

            messages.join(" | ")

          );

        } else {

          setError(

            "Invalid prediction data. Please check all fields."

          );

        }



      } else if (

        error.response?.status === 401

      ) {

        setError(

          "Session expired. Please login again."

        );



      } else if (

        error.response?.status === 500

      ) {

        setError(

          error.response?.data?.detail ||

          "Server error while making prediction."

        );



      } else {

        setError(

          error.response?.data?.detail ||

          "Prediction failed. Please check whether the backend is running."

        );

      }



    } finally {

      setLoading(false);

    }

  }



  return (

    <>

      <h1>

        Risk Prediction

      </h1>



      {error && (

        <div className="error">

          {error}

        </div>

      )}



      <div className="grid prediction-layout">



        {/* =====================================

            PREDICTION FORM

        ====================================== */}



        <article className="card prediction-form-card">



          <form

            className="formgrid"

            onSubmit={go}

          >

            <div className="prediction-form-heading">

              <h3>Student Risk Factors</h3>

              <p>

                Enter the student's academic, family and socioeconomic

                information to estimate dropout risk.

              </p>

            </div>



            {/* Attendance */}



            <div>

              <label>

                Attendance (%)

              </label>



              <input

                type="number"

                name="attendance"

                min="0"

                max="100"

                step="0.01"

                value={x.attendance}

                onChange={handleChange}

                required

              />

            </div>





            {/* Previous Marks */}



            <div>

              <label>

                Previous Marks (%)

              </label>



              <input

                type="number"

                name="previous_marks"

                min="0"

                max="100"

                step="0.01"

                value={x.previous_marks}

                onChange={handleChange}

                required

              />

            </div>





            {/* First Generation */}



            <div>

              <label>

                First Generation Student

              </label>



              <select

                name="first_generation"

                value={x.first_generation}

                onChange={handleChange}

              >

                <option value="1">

                  Yes

                </option>



                <option value="0">

                  No

                </option>

              </select>

            </div>





            {/* Backlogs */}



            <div>

              <label>

                Backlogs

              </label>



              <input

                type="number"

                name="backlogs"

                min="0"

                step="1"

                value={x.backlogs}

                onChange={handleChange}

                required

              />

            </div>





            {/* Financial Difficulty */}



            <div>

              <label>

                Financial Difficulty

              </label>



              <select

                name="financial_difficulty"

                value={x.financial_difficulty}

                onChange={handleChange}

              >

                <option value="0">

                  No

                </option>



                <option value="1">

                  Yes

                </option>

              </select>

            </div>





            {/* Family Income */}



            <div>

              <label>

                Family Income

              </label>



              <input

                type="number"

                name="family_income"

                min="0"

                step="0.01"

                value={x.family_income}

                onChange={handleChange}

                required

              />

            </div>





            {/* Family Size */}



            <div>

              <label>

                Family Size

              </label>



              <input

                type="number"

                name="family_size"

                min="1"

                step="1"

                value={x.family_size}

                onChange={handleChange}

                required

              />

            </div>





            {/* Submit */}



            <button

              type="submit"

              disabled={loading}

            >

              {loading

                ? "Predicting..."

                : "Run Prediction"}

            </button>



          </form>



        </article>





        {/* =====================================

            RESULT

        ====================================== */}



        <article className="card prediction-result-card">



          {!r ? (



            <p>

              Enter the student factors and

              click <b>Run Prediction</b>.

            </p>



          ) : (



            <>



              {/* Risk Percentage */}



              <div

                className={`risk-circle ${String(

                  r.risk_level ||

                  "unknown"

                )

                  .toLowerCase()

                  .replace(

                    /\s+/g,

                    "-"

                  )}`}

              >

                {(() => {

                  const raw =

                    r.risk_percentage ??

                    r.probability ??

                    0;



                  const numeric = Number(raw);



                  if (!Number.isFinite(numeric)) return 0;



                  return numeric <= 1

                    ? Math.round(numeric * 100)

                    : Math.round(numeric);

                })()}%

              </div>





              {/* Risk Level */}



              <h2>

                {r.risk_level ||

                  "Prediction Result"}

              </h2>





              {/* Risk Message */}



              <p>



                {r.risk_level ===

                "High Risk"



                  ? "Immediate parent contact and intervention is recommended."



                  : r.risk_level ===

                    "Medium Risk"



                  ? "Monitor the student closely and follow up regularly."



                  : "Continue regular monitoring and maintain current performance."}



              </p>





              {/* =================================

                  CONTRIBUTING FACTORS

              ================================== */}



              {Array.isArray(

                r.factors

              ) &&

                r.factors.length > 0 && (



                  <>



                    <h3>

                      Contributing Factors

                    </h3>



                    <ul>



                      {r.factors.map(

                        (

                          factor,

                          index

                        ) => (



                          <li

                            key={`${factor}-${index}`}

                          >

                            {factor}

                          </li>



                        )

                      )}



                    </ul>



                  </>

                )}





              {/* =================================

                  RECOMMENDATIONS

              ================================== */}



              {Array.isArray(

                r.recommendations

              ) &&

                r.recommendations.length > 0 && (



                  <>



                    <h3>

                      Recommendations

                    </h3>



                    <ul>



                      {r.recommendations.map(

                        (

                          recommendation,

                          index

                        ) => (



                          <li

                            key={`${recommendation}-${index}`}

                          >

                            {recommendation}

                          </li>



                        )

                      )}



                    </ul>



                  </>

                )}



            </>



          )}



        </article>



      </div>

    </>

  );

}





// ============================================================

// INTERVENTIONS

// ============================================================



function Interventions() {



  const [i, setI] =

    useState([]);



  const [x, setX] =

    useState({

      student_id: "",

      intervention_type:

        "Counselling",

      assigned_to: "",

      notes: ""

    });



  const load = () => {



    api

      .get("/interventions")

      .then((response) => {



        setI(

          Array.isArray(

            response.data

          )

            ? response.data

            : []

        );



      })

      .catch((error) => {



        console.error(

          "Intervention error:",

          error

        );



      });



  };



  useEffect(() => {

    load();

  }, []);



  async function go(event) {



    event.preventDefault();



    try {



      await api.post(

        "/interventions",

        {

          ...x,

          student_id:

            Number(x.student_id)

        }

      );



      alert(

        "Intervention created successfully."

      );



      setX({

        student_id: "",

        intervention_type:

          "Counselling",

        assigned_to: "",

        notes: ""

      });



      load();



    } catch (error) {



      alert(

        error.response?.data?.detail ||

        "Unable to create intervention"

      );



    }

  }



  return (

    <>



      <h1>

        Interventions

      </h1>



      <div className="grid">



        <article className="card">



          <form onSubmit={go}>



            <label>

              Student Database ID

            </label>



            <input

              required

              type="number"

              value={x.student_id}

              onChange={(event) =>

                setX({

                  ...x,

                  student_id:

                    event.target.value

                })

              }

            />



            <label>

              Type

            </label>



            <select

              value={

                x.intervention_type

              }

              onChange={(event) =>

                setX({

                  ...x,

                  intervention_type:

                    event.target.value

                })

              }

            >



              <option>

                Counselling

              </option>



              <option>

                Parent Meeting

              </option>



              <option>

                Scholarship

              </option>



              <option>

                NGO Support

              </option>



            </select>



            <label>

              Assigned To

            </label>



            <input

              value={x.assigned_to}

              onChange={(event) =>

                setX({

                  ...x,

                  assigned_to:

                    event.target.value

                })

              }

            />



            <label>

              Notes

            </label>



            <textarea

              value={x.notes}

              onChange={(event) =>

                setX({

                  ...x,

                  notes:

                    event.target.value

                })

              }

            />



            <button type="submit">

              Create Intervention

            </button>



          </form>



        </article>



        <article className="card table">



          <table>



            <thead>



              <tr>

                <th>Student</th>

                <th>Type</th>

                <th>Assigned</th>

                <th>Status</th>

              </tr>



            </thead>



            <tbody>



              {i.length === 0 ? (



                <tr>

                  <td colSpan="4">

                    No interventions found.

                  </td>

                </tr>



              ) : (



                i.map(

                  (item) => (



                    <tr

                      key={

                        item.id ??

                        `${item.student_id}-${item.intervention_type}`

                      }

                    >



                      <td>

                        {item.student_id}

                      </td>



                      <td>

                        {

                          item.intervention_type

                        }

                      </td>



                      <td>

                        {item.assigned_to}

                      </td>



                      <td>

                        {item.status}

                      </td>



                    </tr>



                  )

                )



              )}



            </tbody>



          </table>



        </article>



      </div>



    </>

  );

}





// ============================================================

// SMS

// ============================================================



function SMS() {



  const [x, setX] =

    useState({

      phone: "",

      message: ""

    });



  const [l, setL] =

    useState([]);



  const load = () => {



    api

      .get("/sms/logs")

      .then((response) => {



        setL(

          Array.isArray(

            response.data

          )

            ? response.data

            : []

        );



      })

      .catch((error) => {



        console.error(

          "SMS logs error:",

          error

        );



      });



  };



  useEffect(() => {

    load();

  }, []);



  async function go(event) {



    event.preventDefault();



    try {



      const response =

        await api.post(

          "/sms",

          x

        );



      alert(

        response.data.message ||

        response.data.status ||

        "SMS request completed"

      );



      setX({

        phone: "",

        message: ""

      });



      load();



    } catch (error) {



      alert(

        error.response?.data?.detail ||

        "SMS sending failed"

      );



    }

  }



  return (

    <>



      <h1>

        SMS Alerts

      </h1>



      <div className="grid">



        <article className="card">



          <form onSubmit={go}>



            <label>

              Parent Phone

            </label>



            <input

              required

              placeholder="+91XXXXXXXXXX"

              value={x.phone}

              onChange={(event) =>

                setX({

                  ...x,

                  phone:

                    event.target.value

                })

              }

            />



            <label>

              Message

            </label>



            <textarea

              required

              rows="6"

              value={x.message}

              onChange={(event) =>

                setX({

                  ...x,

                  message:

                    event.target.value

                })

              }

            />



            <button type="submit">

              Send SMS

            </button>



          </form>



        </article>



        <article className="card table">



          <table>



            <thead>



              <tr>

                <th>Phone</th>

                <th>Status</th>

                <th>Message</th>

              </tr>



            </thead>



            <tbody>



              {l.length === 0 ? (



                <tr>

                  <td colSpan="3">

                    No SMS records found.

                  </td>

                </tr>



              ) : (



                l.map(

                  (item) => (



                    <tr

                      key={

                        item.id ??

                        `${item.recipient}-${item.status}`

                      }

                    >



                      <td>

                        {item.recipient}

                      </td>



                      <td>

                        {item.status}

                      </td>



                      <td>

                        {item.message}

                      </td>



                    </tr>



                  )

                )



              )}



            </tbody>



          </table>



        </article>



      </div>



    </>

  );

}





// ============================================================

// REPORTS

// ============================================================



function Reports() {
  const [r, setR] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    api
      .get("/reports/summary")
      .then((response) => {
        if (mounted) {
          setR(response.data || {});
          setError("");
        }
      })
      .catch((error) => {
        console.error("Reports error:", error);
        if (mounted) {
          setError(
            error.response?.data?.detail ||
            "Unable to load reports. Make sure the FastAPI backend is running."
          );
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const total = Number(r?.students ?? 0);
  const high = Number(r?.high ?? 0);
  const medium = Number(r?.medium ?? 0);
  const low = Number(r?.low ?? 0);
  const interventions = Number(r?.interventions ?? 0);

  const highPct = total > 0 ? Math.round((high / total) * 100) : 0;
  const mediumPct = total > 0 ? Math.round((medium / total) * 100) : 0;
  const lowPct = total > 0 ? Math.round((low / total) * 100) : 0;

  if (loading) {
    return (
      <div className="reports-page">
        <div className="reports-heading">
          <div>
            <span className="mini-label">ANALYTICS</span>
            <h1>Reports & Insights</h1>
            <p>Loading your latest student-risk summary...</p>
          </div>
          <div className="reports-heading-icon">
            <FileBarChart size={28} />
          </div>
        </div>

        <div className="card reports-loading">
          <Activity size={24} />
          <p>Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <div className="reports-heading">
        <div>
          <span className="mini-label">ANALYTICS & REPORTING</span>
          <h1>Reports & Insights</h1>
          <p>Overview of student risk levels and intervention activity.</p>
        </div>

        <div className="reports-heading-icon">
          <FileBarChart size={28} />
        </div>
      </div>

      {error && (
        <div className="error reports-error">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="stats reports-stats">
        <Stat
          t="Total Students"
          v={total}
          icon={Users}
          tone="purple"
        />
        <Stat
          t="High Risk"
          v={high}
          icon={AlertTriangle}
          tone="red"
        />
        <Stat
          t="Medium Risk"
          v={medium}
          icon={Activity}
          tone="orange"
        />
        <Stat
          t="Low Risk"
          v={low}
          icon={CheckCircle2}
          tone="green"
        />
        <Stat
          t="Interventions"
          v={interventions}
          icon={HeartHandshake}
          tone="blue"
        />
      </div>

      <div className="grid reports-grid">
        <article className="card reports-card">
          <div className="card-heading">
            <div>
              <span className="mini-label">RISK OVERVIEW</span>
              <h3>Student risk distribution</h3>
            </div>
            <div className="heading-icon">
              <TrendingUp size={18} />
            </div>
          </div>

          <div className="reports-bars">
            <div className="report-bar-row">
              <div>
                <span>High Risk</span>
                <b>{high} students</b>
              </div>
              <div className="report-bar">
                <i style={{ width: `${highPct}%` }} />
              </div>
              <small>{highPct}%</small>
            </div>

            <div className="report-bar-row">
              <div>
                <span>Medium Risk</span>
                <b>{medium} students</b>
              </div>
              <div className="report-bar">
                <i style={{ width: `${mediumPct}%` }} />
              </div>
              <small>{mediumPct}%</small>
            </div>

            <div className="report-bar-row">
              <div>
                <span>Low Risk</span>
                <b>{low} students</b>
              </div>
              <div className="report-bar">
                <i style={{ width: `${lowPct}%` }} />
              </div>
              <small>{lowPct}%</small>
            </div>
          </div>
        </article>

        <article className="card reports-card">
          <div className="card-heading">
            <div>
              <span className="mini-label">ACTION SUMMARY</span>
              <h3>Intervention activity</h3>
            </div>
            <div className="heading-icon">
              <HeartHandshake size={18} />
            </div>
          </div>

          <div className="reports-action-number">
            <strong>{interventions}</strong>
            <span>recorded interventions</span>
          </div>

          <p className="reports-guidance">
            Prioritize high-risk students for timely counselling, parent
            communication, academic support and financial or NGO assistance.
            Continue monitoring medium-risk students regularly.
          </p>
        </article>
      </div>

      <article className="card reports-guidance-card">
        <div className="guidance-icon">
          <ShieldCheck size={20} />
        </div>
        <div>
          <span className="mini-label">RECOMMENDED WORKFLOW</span>
          <h3>Turn risk information into early action</h3>
          <p>
            Review high-risk students first, check the contributing factors,
            create an intervention where required, and use parent SMS or NGO
            support for follow-up.
          </p>
        </div>
      </article>
    </div>
  );
}


// ============================================================

// SETTINGS

// ============================================================



function Settings() {

  let user = {};

  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    user = {};
  }

  const role = String(user.role || "teacher").toLowerCase();

  const roleInfo = {
    admin: {
      title: "Administrator",
      description: "Full system management and monitoring access.",
      className: "settings-admin",
      Icon: ShieldCheck
    },
    teacher: {
      title: "Teacher",
      description: "Student monitoring and early intervention access.",
      className: "settings-teacher",
      Icon: GraduationCap
    },
    ngo: {
      title: "NGO Partner",
      description: "Student support and intervention access.",
      className: "settings-ngo",
      Icon: HeartHandshake
    }
  };

  const currentRole = roleInfo[role] || roleInfo.teacher;
  const RoleIcon = currentRole.Icon;
  const name = user.full_name || user.name || "User";
  const email = user.email || "Email not available";
  const initials = name
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("") || "U";

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  return (
    <div className="settings-page">

      <div className="settings-heading">
        <div>
          <span className="settings-eyebrow">ACCOUNT CENTER</span>
          <h1>Settings</h1>
          <p>Manage your profile, account information and security.</p>
        </div>
        <div className="settings-header-icon">
          <SettingsIcon size={24} />
        </div>
      </div>

      <article className={`settings-profile ${currentRole.className}`}>
        <div className="settings-profile-left">
          <div className="settings-avatar">{initials}</div>
          <div className="settings-profile-info">
            <span className="settings-small-label">YOUR PROFILE</span>
            <h2>{name}</h2>
            <p>{email}</p>
            <div className="settings-role-badge">
              <RoleIcon size={14} />
              {currentRole.title}
            </div>
          </div>
        </div>

        <div className="settings-profile-status">
          <span className="status-dot" />
          Active Account
        </div>
      </article>

      <div className="settings-grid">

        <article className="card settings-card">
          <div className="settings-card-heading">
            <div className="settings-section-icon blue">
              <UserRound size={19} />
            </div>
            <div>
              <span>ACCOUNT</span>
              <h3>Account Information</h3>
            </div>
          </div>

          <div className="settings-info-list">
            <div className="settings-info-row">
              <div className="settings-info-icon">👤</div>
              <div>
                <small>Full Name</small>
                <strong>{name}</strong>
              </div>
            </div>

            <div className="settings-info-row">
              <div className="settings-info-icon">✉️</div>
              <div>
                <small>Email Address</small>
                <strong>{email}</strong>
              </div>
            </div>

            <div className="settings-info-row">
              <div className="settings-info-icon">📱</div>
              <div>
                <small>Phone Number</small>
                <strong>{user.phone || "Not provided"}</strong>
              </div>
            </div>

            <div className="settings-info-row">
              <div className="settings-info-icon">🛡️</div>
              <div>
                <small>Account Role</small>
                <strong>{currentRole.title}</strong>
              </div>
            </div>
          </div>
        </article>

        <article className="card settings-card">
          <div className="settings-card-heading">
            <div className="settings-section-icon purple">
              <ShieldCheck size={19} />
            </div>
            <div>
              <span>SECURITY</span>
              <h3>Account Security</h3>
            </div>
          </div>

          <div className="security-box">
            <div className="security-icon">
              <ShieldCheck size={25} />
            </div>
            <div>
              <strong>Password Protected</strong>
              <p>Your account is protected with password authentication.</p>
            </div>
          </div>

          <div className="security-status">
            <div>
              <CheckCircle2 size={17} />
              <span>Password protection enabled</span>
            </div>
            <span className="secure-badge">Secure</span>
          </div>

          <NavLink to="/forgot-password" className="settings-action-button">
            🔑 Reset Password
            <ArrowRight size={16} />
          </NavLink>
        </article>
      </div>

      <article className={`card settings-role-card ${currentRole.className}`}>
        <div className="settings-role-icon">
          <RoleIcon size={25} />
        </div>

        <div className="settings-role-content">
          <span className="settings-small-label">YOUR ACCESS</span>
          <h3>{currentRole.title}</h3>
          <p>{currentRole.description}</p>

          <div className="settings-permissions">
            {role === "admin" && (
              <>
                <span><CheckCircle2 size={14} /> Student Management</span>
                <span><CheckCircle2 size={14} /> Risk Analytics</span>
                <span><CheckCircle2 size={14} /> Reports</span>
                <span><CheckCircle2 size={14} /> SMS Alerts</span>
              </>
            )}

            {role === "teacher" && (
              <>
                <span><CheckCircle2 size={14} /> Student Monitoring</span>
                <span><CheckCircle2 size={14} /> Risk Prediction</span>
                <span><CheckCircle2 size={14} /> Interventions</span>
                <span><CheckCircle2 size={14} /> Parent SMS</span>
              </>
            )}

            {role === "ngo" && (
              <>
                <span><CheckCircle2 size={14} /> Support Students</span>
                <span><CheckCircle2 size={14} /> Support Cases</span>
                <span><CheckCircle2 size={14} /> Impact Reports</span>
                <span><CheckCircle2 size={14} /> Interventions</span>
              </>
            )}
          </div>
        </div>
      </article>

      <div className="settings-bottom-grid">
        <article className="card settings-status-card">
          <div className="settings-status-icon green">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <span>ACCOUNT STATUS</span>
            <h3>Active</h3>
            <p>Your account is currently active and ready to use.</p>
          </div>
        </article>

        <article className="card settings-status-card">
          <div className="settings-status-icon blue">
            <ShieldCheck size={22} />
          </div>
          <div>
            <span>SECURITY</span>
            <h3>OTP Password Reset</h3>
            <p>Password recovery uses a one-time OTP sent to your registered email.</p>
          </div>
        </article>
      </div>

      <article className="card settings-logout-card">
        <div>
          <div className="settings-logout-icon">
            <LogOut size={20} />
          </div>
          <div>
            <h3>Sign out of your account</h3>
            <p>End your current session on this device.</p>
          </div>
        </div>

        <button className="settings-logout-button" onClick={logout}>
          <LogOut size={17} />
          Logout
        </button>
      </article>

    </div>
  );
}


// APP ROUTES

// ============================================================



function App() {



  return (

    <Routes>



      {/* PUBLIC */}



      <Route

        path="/"

        element={<Home />}

      />



      <Route

        path="/login"

        element={<Login />}

      />



      <Route

        path="/signup"

        element={<Signup />}

      />



      <Route

        path="/forgot-password"

        element={<Forgot />}

      />



      <Route

        path="/verify"

        element={<Verify />}

      />



      <Route

        path="/reset"

        element={<Reset />}

      />





      {/* PROTECTED */}



      <Route

        path="/dashboard"

        element={

          <Guard>

            <Layout>

              <RoleDashboard />

            </Layout>

          </Guard>

        }

      />



      <Route

        path="/students"

        element={

          <Guard>

            <Layout>

              <Students />

            </Layout>

          </Guard>

        }

      />



      <Route

        path="/prediction"

        element={

          <Guard>

            <Layout>

              <Prediction />

            </Layout>

          </Guard>

        }

      />



      <Route

        path="/interventions"

        element={

          <Guard>

            <Layout>

              <Interventions />

            </Layout>

          </Guard>

        }

      />



      <Route

        path="/sms"

        element={

          <Guard>

            <Layout>

              <SMS />

            </Layout>

          </Guard>

        }

      />



      <Route

        path="/reports"

        element={

          <Guard>

            <Layout>

              <Reports />

            </Layout>

          </Guard>

        }

      />



      <Route

        path="/settings"

        element={

          <Guard>

            <Layout>

              <Settings />

            </Layout>

          </Guard>

        }

      />



      {/* FALLBACK */}



      <Route

        path="*"

        element={

          <Navigate

            to="/"

            replace

          />

        }

      />



    </Routes>

  );

}





// ============================================================

// START REACT

// ============================================================



createRoot(

  document.getElementById("root")

).render(

  <BrowserRouter>

    <App />

  </BrowserRouter>

);