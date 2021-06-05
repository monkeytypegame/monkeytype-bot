import axios from "axios";
const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const axiosInstance = axios.create({
  baseURL: "https://api.monkeytype.com",
});

const uid = "monkeytype-bot";
const additionalClaims = { isDiscordBot: true };

let customToken;
customToken = admin.auth().createCustomToken(uid, additionalClaims);

// Request interceptor for API calls
axiosInstance.interceptors.request.use(
  async config => {
    if (customToken) {
      config.headers = {
        'Authorization': `Bearer ${customToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    } else {
      config.headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }
    return config;
  },
  error => {
    Promise.reject(error)
});

// Response interceptor for API calls
axiosInstance.interceptors.response.use((response) => {
  return response
}, async function (error) {
  const originalRequest = error.config;
  if (error.response.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    //console.log("Refreshing access token");
    await customToken = admin.auth().createCustomToken(uid, additionalClaims);
    return axiosApiInstance(originalRequest);
  }
  return Promise.reject(error);
});


export default axiosInstance;
