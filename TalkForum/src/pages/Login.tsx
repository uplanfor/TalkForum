import "../assets/normalise.css"
import React from "react";
import "./styles/style_login.css";

const Login = () => {
  const [isLogin, setIsLogin] = React.useState(true);

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>{isLogin ? "Sign in to TalkForum" : "Sign up to TalkForum"}</h2>
        <form>
          <div className="form-group">
            <label htmlFor="username">Username or Email</label>
            <input type="text" id="username" name="username" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" />
          </div>
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input type="password" id="confirm-password" name="confirm-password" />
            </div>
          )}
          <button type="submit" className="submit-btn">
            {isLogin ? "Sign in" : "Sign up"}
          </button>
        </form>
        <p className="toggle-form">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            onClick={() => setIsLogin(!isLogin)}
            className="toggle-btn"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
