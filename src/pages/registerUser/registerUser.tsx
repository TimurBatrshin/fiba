import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./registerUser.css";

const RegisterUser = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/auth/register", formData);
      navigate("/login");
    } catch (err) {
      setError("Ошибка при регистрации. Попробуйте снова.");
    }
  };

  return (
    <div className="register-container">
      <h1>Регистрация пользователя</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Имя</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Пароль</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit">Зарегистрироваться</button>
      </form>
    </div>
  );
};

export default RegisterUser;