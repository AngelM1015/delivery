import { base_url } from "../constants/api";
import axios from "axios";

let requestQueue = [];

const client = axios.create({
  baseURL: base_url,
  timeout: 10000,
});

export default client;
