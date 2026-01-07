// // // client/vite-project/src/auth/Register.jsx
// import React, { useState, useContext, useEffect } from 'react';
// import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
// import { AuthContext } from '../context/AuthContext';
// import { useNavigate } from 'react-router-dom';
// import { Eye, EyeOff } from 'lucide-react';
// import './Register.css';

// const RegisterComponent = () => {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     subscribed: true,
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const navigate = useNavigate();
//   const { register, error, successMsg } = useContext(AuthContext);

//   useEffect(() => {
//     if (successMsg) {
//       const timeoutId = setTimeout(() => {
//         navigate('/onboarding');
//       }, 3000);
//       return () => clearTimeout(timeoutId);
//     }
//   }, [successMsg, navigate]);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData({
//       ...formData,
//       [name]: type === 'checkbox' ? checked : value,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (formData.password !== formData.confirmPassword) {
//       setError('Passwords do not match');
//       return;
//     }
//     try {
//       await register({ ...formData, confirmPassword: undefined });
//     } catch (err) {
//       setError(err.response?.data?.msg || 'An error occurred');
//     }
//   };

//   const togglePasswordVisibility = (field) => {
//     if (field === 'password') {
//       setShowPassword(!showPassword);
//     } else if (field === 'confirmPassword') {
//       setShowConfirmPassword(!showConfirmPassword);
//     }
//   };

//   return (
//     <Container className="my-5">
//       <Row className="justify-content-center">
//         <Col xs={12} md={10}>
//           {successMsg && <Alert variant="success">{successMsg}</Alert>}
//           {error && <Alert variant="danger">{error}</Alert>}
//           <Form onSubmit={handleSubmit}>
//             <Form.Group controlId="formName" className="mb-3">
//               <Form.Control
//                 type="text"
//                 placeholder="Enter your name"
//                 name="name"
//                 value={formData.name}
//                 onChange={handleChange}
//               />
//             </Form.Group>

//             <Form.Group controlId="formEmail" className="mb-3">
//               <Form.Control
//                 type="email"
//                 placeholder="Enter email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//               />
//             </Form.Group>

//             <Form.Group controlId="formPassword" className="mb-3">
//               <div className="password-input-wrapper">
//                 <Form.Control
//                   type={showPassword ? "text" : "password"}
//                   placeholder="Password"
//                   name="password"
//                   value={formData.password}
//                   onChange={handleChange}
//                 />
//                 <button 
//                   type="button"
//                   onClick={() => togglePasswordVisibility('password')}
//                   className="password-toggle"
//                 >
//                   {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                 </button>
//               </div>
//             </Form.Group>

//             <Form.Group controlId="formConfirmPassword" className="mb-3">
//               <div className="password-input-wrapper">
//                 <Form.Control
//                   type={showConfirmPassword ? "text" : "password"}
//                   placeholder="Confirm Password"
//                   name="confirmPassword"
//                   value={formData.confirmPassword}
//                   onChange={handleChange}
//                 />
//                 <button 
//                   type="button"
//                   onClick={() => togglePasswordVisibility('confirmPassword')}
//                   className="password-toggle"
//                 >
//                   {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                 </button>
//               </div>
//             </Form.Group>

//             <Form.Group controlId="formSubscribed" className="mb-3 checkbox-spacing">
//               <div className="custom-checkbox-wrapper">
//                 <Form.Check
//                   type="checkbox"
//                   name="subscribed"
//                   checked={formData.subscribed}
//                   onChange={handleChange}
//                   className="mr-2"
//                 />
//                 <span className="custom-checkbox-label">
//                   receive travel deals, exciting new destinations & more
//                 </span>
//               </div>
//             </Form.Group>

//             <Button variant="primary" type="submit" className="custom-form-button w-100">
//               Register
//             </Button>
//           </Form>
//         </Col>
//       </Row>
//     </Container>
//   );
// };

// export default RegisterComponent;

// client/vite-project/src/auth/RegisterComponent.tsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, User, Mail, Lock } from 'lucide-react';

const RegisterComponent = () => {
  const { register, error, successMsg } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setValidationError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {successMsg && (
        <Alert>
          <AlertDescription>{successMsg}</AlertDescription>
        </Alert>
      )}

      {validationError && (
        <Alert variant="destructive">
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="register-email"
            name="email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={handleChange}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="register-password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            className="pl-10"
            required
            minLength={6}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="pl-10"
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </Button>
    </form>
  );
};

export default RegisterComponent;