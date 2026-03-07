import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

export const diagnosePatient = async (age: number, symptoms: string) => {

  const response = await axios.post(`${API_URL}/diagnose`, {
    age: age,
    gender: "male",
    symptoms: symptoms,
    allergies: [],
    conditions: []
  });

  return response.data;
};