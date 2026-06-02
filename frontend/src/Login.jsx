import { useState } from "react";
import axios from "axios";

function Login({ setToken }) {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = () => {

    axios.post("http://127.0.0.1:8000/api/token/", {
      username: username,
      password: password
    })

    .then(response => {

      const access = response.data.access;

      localStorage.setItem("token", access);

      setToken(access);

    })

    .catch(error => {
      console.log(error);
      alert("Login incorrect");
    });
  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-10 rounded-xl shadow-lg w-96">

        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
          Login ERP
        </h1>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border p-3 rounded mb-4"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-3 rounded mb-6"
        />

        <button
          onClick={login}
          className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
        >
          Se connecter
        </button>

      </div>

    </div>
  );
}

export default Login;