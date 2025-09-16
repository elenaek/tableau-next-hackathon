import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    TNEXT_PATIENT_USERNAME: process.env.TNEXT_PATIENT_USERNAME,
    TNEXT_PATIENT_PW: process.env.TNEXT_PATIENT_PW,
  }
};

export default nextConfig;