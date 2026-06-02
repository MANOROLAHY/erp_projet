import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      const response = await axios.post(
        "http://127.0.0.1:8000/api/token/",
        {
          username,
          password,
        }
      );

      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);

      alert("Connexion réussie");

      navigate("/dashboard");

    } catch (error) {

      console.log(error);

      alert("Login incorrect");

    }
  };

  return (

    <div className="flex justify-center items-center h-screen bg-gray-200">

      <form
        onSubmit={handleLogin}
        className="bg-white p-10 rounded-3xl shadow-xl w-[350px]"
      >

        <h1 className="text-5xl font-bold text-blue-600 text-center mb-8">
          Login ERP
        </h1>

        <input
          type="text"
          placeholder="Username"
          className="w-full p-4 mb-5 rounded-xl border"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-4 mb-5 rounded-xl border"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-4 rounded-xl hover:bg-blue-700"
        >
          Connexion
        </button>

      </form>

    </div>
  );
}

export default Login;