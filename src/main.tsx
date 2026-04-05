import { createRoot } from "react-dom/client"
import { GoogleOAuthProvider } from "@react-oauth/google"

import App from "./App"
import { AuthProvider } from "./context/AuthContext"

import "./index.css"

const GOOGLE_CLIENT_ID ="940414213489-hih9o1qs80gpk9uhuipddds8ppcg4jn1.apps.googleusercontent.com"

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </GoogleOAuthProvider>
)