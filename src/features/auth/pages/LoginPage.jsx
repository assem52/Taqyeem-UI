import { setAuthSession } from '../../../shared/utils/authSession';
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useLoginMutation } from "../authApi";
import AuthShell, {
  authFieldClass,
  authLabelClass,
  authPrimaryBtnClass,
} from "../components/AuthShell";
import { ShieldAlert, User } from "../../../shared/components/Icons";
import { useDispatch } from 'react-redux';

const DEMO_ACCOUNTS = {
  student: {
    label: "Student",
    email: "assem.test@example.com",
    password: "Student123!",
  },
  admin: {
    label: "Admin",
    email: "admin@example.com",
    password: "Admin123!",
  },
};

function homeForRole(role) {
  return role === "ADMIN" ? "/admin/quizzes" : "/";
}

function destinationForLogin(role, next) {
  if (next?.startsWith("/admin")) {
    return role === "ADMIN" ? next : homeForRole(role);
  }
  if (next?.startsWith("/invite") || next?.startsWith("/quizzes")) {
    return role === "STUDENT" ? next : homeForRole(role);
  }
  if (next) return next;
  return homeForRole(role);
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [demoKey, setDemoKey] = useState(null);

  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const status = localStorage.getItem('status');
    if (token && role) {
      if (role === 'STUDENT' && status === 'UNVERIFIED') {
        navigate('/verify-email', { replace: true });
      } else {
        navigate(homeForRole(role), { replace: true });
      }
    if (token && role) {
      navigate(destinationForLogin(role, next), { replace: true });
    }}
  }, [navigate, next]);

  const completeLogin = async (loginEmail, loginPassword) => {
    setErrorMsg("");

    const response = await login({
      email: loginEmail.trim().toLowerCase(),
      password: loginPassword,
    }).unwrap();

    if (!response?.access_token) {
      throw new Error(
        "Login succeeded but no token was returned. Please try again.",
      );
    }

    const role = response.role ?? response.user?.role ?? "STUDENT";
    const status = response.status ?? response.user?.status;
    localStorage.setItem("token", response.access_token);
    localStorage.setItem("role", role);
    if (status) localStorage.setItem("status", status);

    if (role === "STUDENT" && status === "UNVERIFIED") {
      const params = new URLSearchParams({
        email: loginEmail.trim().toLowerCase(),
      });
      if (next) params.set("next", next);
      navigate(`/verify?${params.toString()}`, { replace: true });
      return;
    }

    navigate(destinationForLogin(role, next), { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDemoKey(null);
    try {
      const response = await login({
        email: email.trim().toLowerCase(),
        password,
      }).unwrap();

      if (!response || !response.access_token) {
        setErrorMsg('Login succeeded but no token was returned. Please try again.');
        return;
      }

      const role = response.role ?? response.user?.role ?? 'STUDENT';
      const status = response.status ?? response.user?.status ?? 'UNVERIFIED';
      const userEmail = response.user?.email ?? response.email ?? email.trim().toLowerCase();
      const userName = response.user?.name ?? response.name ?? '';

      // Cleanly replace auth session and reset RTK query cache for new user
      setAuthSession(
        {
          token: response.access_token,
          role,
          status,
          email: userEmail,
          name: userName,
        },
        dispatch
      );

      if (role === 'STUDENT' && status === 'UNVERIFIED') {
        navigate('/verify-email', { replace: true });
        return;
      }

      navigate(destinationForLogin(role, next), { replace: true });

    } catch (err) {
      setErrorMsg(
        err?.data?.message ||
          err?.message ||
          "Invalid email or password. Please try again.",
      );
    }
  };

  const handleDemoLogin = async (key) => {
    const account = DEMO_ACCOUNTS[key];
    if (!account) return;
    setDemoKey(key);
    setEmail(account.email);
    setPassword(account.password);
    try {
      await completeLogin(account.email, account.password);
    } catch (err) {
      setErrorMsg(
        err?.data?.message ||
          err?.message ||
          "Demo login failed. Is the seed data loaded?",
      );
    } finally {
      setDemoKey(null);
    }
  };

  const registerHref = next
    ? `/register?next=${encodeURIComponent(next)}`
    : "/register";

  const busy = isLoading || Boolean(demoKey);

  return (

    <AuthShell
      title="Welcome back"
      subtitle="Sign in with your learner or instructor account."
      footer={
        <>
          No account?{" "}
          <Link
            to={registerHref}
            className="text-primary font-semibold hover:underline"
          >
            Register
          </Link>
          {" · "}
          <Link
            to="/forgot-password"
            className="text-primary font-semibold hover:underline"
          >
            Forgot password
          </Link>
        </>
      }
    >
      {errorMsg ? (
        <div
          role="alert"
          className="border-danger/20 bg-danger/5 text-danger mb-5 rounded-button border px-3.5 py-2.5 text-sm"
        >
          {errorMsg}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className={authLabelClass}>
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="name@example.com"
            className={authFieldClass}
          />
        </div>

        <div>
          <label htmlFor="login-password" className={authLabelClass}>
            Password
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Your password"
              className={`${authFieldClass} pr-16`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-muted hover:text-heading absolute top-1/2 right-3 -translate-y-1/2 text-xs font-semibold"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={busy}
          className={`${authPrimaryBtnClass} mt-2`}
        >
          {isLoading && !demoKey ? "Signing in…" : "Sign in"}
        </button>
      </form>

      {import.meta.env.DEV ? (
        <div className="border-border mt-6 border-t pt-5">
          <p className="text-muted mb-3 text-xs font-medium tracking-wide uppercase">
            Quick login (dev)
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => handleDemoLogin("student")}
              className="border-border bg-background hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-primary flex flex-col items-center gap-2 rounded-button border px-3 py-4 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="bg-primary/10 text-primary flex h-11 w-11 items-center justify-center rounded-full">
                <User size={22} />
              </span>
              <span className="text-heading font-semibold">
                {demoKey === "student" ? "Signing in…" : "Student"}
              </span>
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => handleDemoLogin("admin")}
              className="border-border bg-background hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-primary flex flex-col items-center gap-2 rounded-button border px-3 py-4 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="bg-primary/10 text-primary flex h-11 w-11 items-center justify-center rounded-full">
                <ShieldAlert size={22} />
              </span>
              <span className="text-heading font-semibold">
                {demoKey === "admin" ? "Signing in…" : "Admin"}
              </span>
            </button>
          </div>
        </div>
      ) : null}
    </AuthShell>
  );
}
