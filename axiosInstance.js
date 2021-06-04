import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://api.monkeytype.com",
});

export default axiosInstance;
