// //client/vite-project/src/components/BudgetVisualization.jsx
// import React, { useState } from 'react';
// import { Container, Row, Col, Form } from 'react-bootstrap';
// import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

// const BudgetVisualization = () => {
//   const [budget, setBudget] = useState(1000);

//   const data = [
//     { name: 'Accommodation', value: budget * 0.4 },
//     { name: 'Transportation', value: budget * 0.3 },
//     { name: 'Activities', value: budget * 0.2 },
//     { name: 'Food & Drinks', value: budget * 0.1 },
//   ];

//   const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

//   return (
//     <Container className="my-5">
//       <h2 className="text-center mb-4">Visualize Your Travel Budget</h2>
//       <Row className="align-items-center">
//         <Col md={6}>
//           <Form.Group className="mb-3">
//             <Form.Label>Adjust your budget</Form.Label>
//             <Form.Range
//               min={500}
//               max={10000}
//               step={100}
//               value={budget}
//               onChange={(e) => setBudget(Number(e.target.value))}
//             />
//             <p className="text-center mt-2">Budget: ${budget}</p>
//           </Form.Group>
//         </Col>
//         <Col md={6}>
//           <ResponsiveContainer width="100%" height={300}>
//             <PieChart>
//               <Pie
//                 data={data}
//                 cx="50%"
//                 cy="50%"
//                 labelLine={false}
//                 outerRadius={80}
//                 fill="#8884d8"
//                 dataKey="value"
//               >
//                 {data.map((entry, index) => (
//                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                 ))}
//               </Pie>
//               <Legend />
//             </PieChart>
//           </ResponsiveContainer>
//         </Col>
//       </Row>
//       <p className="text-center mt-3">
//         Drag the slider to see how your budget could be allocated across different travel expenses. 
//         Your actual trip may vary based on your preferences and chosen destination.
//       </p>
//     </Container>
//   );
// };

// export default BudgetVisualization;