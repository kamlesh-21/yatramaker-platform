// import React, { useState } from 'react';
// import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
// import axios from 'axios';

// const ForgotPassword = () => {
//   const [email, setEmail] = useState('');
//   const [message, setMessage] = useState('');
//   const [error, setError] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/forgot-password`, { email });
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
//             <Form.Group controlId="formEmail" className="mb-3">
//               <Form.Control
//                 type="email"
//                 placeholder="Enter email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="input-field"
//               />
//             </Form.Group>
//             <Button variant="primary" type="submit" className="btn-primary w-100">Send Reset Link</Button>
//           </Form>
//         </Col>
//       </Row>
//     </Container>
//   );
// };

// export default ForgotPassword;

// client/vite-project/src/auth/ForgotPassword.tsx
import React, { useState, FormEvent } from "react";
import axios from "axios";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/forgot-password`,
        { email }
      );

      setMessage(response.data?.msg || "Reset link sent successfully.");
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
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-md transition"
          >
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
