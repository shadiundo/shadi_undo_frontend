// src/pages/auth/useSign.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuthContext } from '@/context/useAuthContext'; // adjust path if needed
import { loginSchema } from './LoginForm'; // assumes LoginForm exports loginSchema
// decode JWT payload (no verification) - used only to infer role if server doesn't return user

const API_URL = import.meta.env.VITE_API_URL;

function decodeJwt(token) {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payloadB64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(payloadB64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch (err) {
    return null;
  }
}

export default function useSign() {
  const navigate = useNavigate();
  const { saveSession } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: true
    }
  });

  async function onSubmit(values) {
  setLoading(true);
  setError(null);

  try {
    // call backend login endpoint - adjust base URL if your frontend does not proxy
   const res = await fetch(`${API_URL}/api/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'include',
      body: JSON.stringify({ email: values.email, password: values.password })
    });

    let json;
    try {
      json = await res.json();
    } catch (e) {
      throw new Error('Invalid server response');
    }

    if (!res.ok || !json.token) {
      const msg = json.message || json.error || `Login failed (HTTP ${res.status})`;
      throw new Error(msg);
    }

    const token = json.token;
    const user = json.user || null;

    // derive role: prefer returned user.role, otherwise decode token
    let role = user?.role || null;
    if (!role) {
      const payload = decodeJwt(token);
      role = payload?.role || null;
    }

    // Build session object expected by AuthProvider.
    // Also attach isAdmin flag for easy checks elsewhere.
    const isAdmin = role === 'admin';
    const session = { user, token, isAdmin };

    // Persist via AuthProvider: saveSession(session, remember)
    saveSession(session, !!values.remember);

    // --- NEW: store admin token in localStorage when admin logs in ---
    // Use a clear key so it's obvious elsewhere in the app.
    if (isAdmin) {
      try {
        localStorage.setItem('adminToken', token);
      } catch (e) {
        // localStorage can throw in some environments (e.g. private mode), don't crash.
        console.warn('Unable to write adminToken to localStorage', e);
      }
    } else {
      // Clean up any stale admin token if a non-admin signs in.
      try {
        localStorage.removeItem('adminToken');
      } catch (e) {
        console.warn('Unable to remove adminToken from localStorage', e);
      }
    }

    // navigate to dashboard (adjust route if necessary)
    navigate('/dashboard/professions', { replace: true });
    reset();
  } catch (err) {
    setError(err.message || 'Login failed');
  } finally {
    setLoading(false);
  }
}


  return {
    control,
    loading,
    error,
    login: handleSubmit(onSubmit)
  };
}
