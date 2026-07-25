import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../services/api";
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from "../store/slices/authSlice";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    dispatch(loginStart());

    try {
      const { data } = await api.post("/auth/login", form);

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      dispatch(loginSuccess(data));

      toast.success("Đăng nhập thành công!");

      navigate("/");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Sai email hoặc mật khẩu";

      dispatch(loginFailure(msg));

      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">

      <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-lg">

        <h2 className="text-3xl font-bold text-center mb-6">
          Đăng nhập
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <input
            type="email"
            placeholder="Email"
            className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
          />

          <input
            type="password"
            placeholder="Mật khẩu"
            className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
          />

          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition"
          >
            Đăng nhập
          </button>
        </form>

        <p className="text-center mt-5">
          Chưa có tài khoản?

          <Link
            to="/register"
            className="text-blue-600 ml-2"
          >
            Đăng ký
          </Link>
        </p>

      </div>

    </div>
  );
};

export default Login;