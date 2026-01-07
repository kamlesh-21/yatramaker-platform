// client/src/components/Subscribe.tsx
// client/src/components/Subscribe.tsx
import React, { useState, FormEvent } from "react";
import axios from "axios";
import { backendURL } from "../utils/env";

const API_URL = `${backendURL}/api`;

const Subscribe: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/subscribe`, { email });
      setMessage(response.data?.message || "Subscribed successfully");
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message || "Something went wrong"
      );
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          className="w-full bg-primary hover:bg-blue-700 text-white text-sm py-2 rounded-md transition"
        >
          Subscribe
        </button>
      </form>

      {message && (
        <p className="text-sm text-gray-300 mt-2">
          {message}
        </p>
      )}
    </div>
  );
};

export default Subscribe;
