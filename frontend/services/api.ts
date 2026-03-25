import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

// ── Auth helpers ──────────────────────────────────────────────
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ── Auth APIs ──────────────────────────────────────────────────
export const registerUser = async (name: string, email: string, password: string, role: string = "patient") => {
  const res = await axios.post(`${API_URL}/auth/register`, { name, email, password });
  if (res.data.access_token) localStorage.setItem("auth_token", res.data.access_token);
  if (res.data.user) localStorage.setItem("auth_user", JSON.stringify(res.data.user));
  return res.data;
};

export const loginUser = async (email: string, password: string) => {
  const res = await axios.post(`${API_URL}/auth/login`, { email, password });
  if (res.data.access_token) localStorage.setItem("auth_token", res.data.access_token);
  if (res.data.user) localStorage.setItem("auth_user", JSON.stringify(res.data.user));
  return res.data;
};

export const getMe = async () => {
  const res = await axios.get(`${API_URL}/auth/me`, { headers: authHeaders() });
  return res.data;
};

export const updateProfile = async (name: string) => {
  const res = await axios.put(`${API_URL}/auth/profile/update`, { name }, { headers: authHeaders() });
  return res.data;
};

export const getUserActivity = async () => {
  const res = await axios.get(`${API_URL}/auth/activity`, { headers: authHeaders() });
  return res.data;
};

export const logout = () => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
};

export const getStoredUser = () => {
  if (typeof window === "undefined") return null;
  const u = localStorage.getItem("auth_user");
  return u ? JSON.parse(u) : null;
};

// ── Clinical APIs ──────────────────────────────────────────────
export const diagnosePatient = async (
  age: number,
  symptoms: string,
  gender: string = "male",
  conditions: string = "none",
  name: string = "Anonymous",
  allergies: string = "none"
) => {
  const response = await axios.post(
    `${API_URL}/diagnose`,
    { name, age, gender, symptoms, allergies, conditions },
    { headers: authHeaders() }
  );
  return response.data;
};

export const fetchHistory = async () => {
  // History now returns ONLY the logged-in user's records
  const response = await axios.get(`${API_URL}/history`, { headers: authHeaders() });
  return response.data;
};

export const fetchAnalytics = async () => {
  const response = await axios.get(`${API_URL}/analytics`, { headers: authHeaders() });
  return response.data;
};

export const sendChatMessage = async (
  message: string,
  history: Array<{ role: string; content: string }>,
  language: string = "en",
  diagnosisContext: Record<string, string> = {}
) => {
  const response = await axios.post(
    `${API_URL}/chat`,
    { message, history, language, diagnosis_context: diagnosisContext },
    { headers: authHeaders() }
  );
  return response.data;
};

export const getDiagnosisExplanation = async (
  disease: string,
  symptoms: string,
  age: number = 30,
  gender: string = "unknown",
  conditions: string = "none",
  allergies: string = "none",
  language: string = "en"
) => {
  const response = await axios.post(
    `${API_URL}/diagnose/explain`,
    { disease, symptoms, age, gender, conditions, allergies, language },
    { headers: authHeaders() }
  );
  return response.data;
};

export const getExtendedAnalysis = async (
  symptoms: string,
  age: number = 30,
  gender: string = "unknown",
  conditions: string = "none",
  allergies: string = "none",
  language: string = "en",
  confidenceScore: number = 1.0,
  diseaseInDb: boolean = true
) => {
  const response = await axios.post(
    `${API_URL}/diagnose/extended`,
    {
      symptoms,
      age,
      gender,
      conditions,
      allergies,
      language,
      confidence_score: confidenceScore,
      disease_in_db: diseaseInDb,
    },
    { headers: authHeaders() }
  );
  return response.data;
};

export const downloadPdfReport = async (reportData: any) => {
  const response = await axios.post(`${API_URL}/generate_pdf`, reportData, {
    responseType: "blob",
    headers: authHeaders(),
  });
  return response.data;
};