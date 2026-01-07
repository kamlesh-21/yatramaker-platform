// import React, { useState } from 'react';
// import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
// import { useParams } from 'react-router-dom';
// import axios from 'axios';

// const ResetPassword = () => {
//   const { token } = useParams();
//   const [password, setPassword] = useState('');
//   const [message, setMessage] = useState('');
//   const [error, setError] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/reset-password`, { token, password });
//       setMessage(response.data.msg);
//     } catch (err) {
//       setError(err.response.data.msg);
//     }
//   };

//   return (
//     <Container className="my-5">
//       <Row className="justify-content-center">
//         <Col xs={12} md={6} className="login-container">
//           {message && <Alert variant="success">{message}</Alert>}
//           {error && <Alert variant="danger">{error}</Alert>}
//           <Form onSubmit={handleSubmit}>
//             <Form.Group controlId="formPassword" className="mb-3">
//               <Form.Control
//                 type="password"
//                 placeholder="Enter new password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="input-field"
//               />
//             </Form.Group>
//             <Button variant="primary" type="submit" className="btn-primary w-100">Reset Password</Button>
//           </Form>
//         </Col>
//       </Row>
//     </Container>
//   );
// };

// export default ResetPassword;

// src/components/ResetPassword.tsx
import React, { useState, FormEvent } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ResetPassword: React.FC = () => {
  const { token } = useParams();
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/reset-password`,
        { token, password }
      );

      setMessage(response.data?.msg || "Password reset successful.");
    } catch (err: any) {
      setError(err?.response?.data?.msg || "Something went wrong.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[60vh] px-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg">
        {message && (
          <div className="mb-4 text-sm bg-green-600 text-white p-2 rounded-md">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 text-sm bg-red-600 text-white p-2 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-md transition"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
