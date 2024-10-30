import { base_url } from "../constants/api";
import axios from "axios";


const client = axios.create({
  baseURL: base_url,
  timeout: 1000,
});

export default client
