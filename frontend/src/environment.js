let IS_PROD = true;

const server = IS_PROD
  ? "https://zoom-clone-backend-k2xd.onrender.com"
  : "http://localhost:8000";

export default server;
