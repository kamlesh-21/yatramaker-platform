// // src/components/ItineraryDetailsPage.jsx
// import React from 'react';
// import { useLocation } from 'react-router-dom';
// import { Container, Row, Col, Card } from 'react-bootstrap';

// const ItineraryDetailsPage = () => {
//   const location = useLocation();
//   const itinerary = location.state;

//   return (
//     <Container className="my-5">
//       <h2 className="text-center mb-4">Itinerary Details</h2>
//       <Row>
//         <Col xs={12} md={8} className="mx-auto">
//           <Card>
//             <Card.Body>
//               <Card.Title>{itinerary.destination}</Card.Title>
//               <Card.Subtitle className="mb-2 text-muted">
//                 Travel Month: {itinerary.travelMonth}
//               </Card.Subtitle>
//               <Card.Text>
//                 <p>Budget: ${itinerary.budget}</p>
//                 <p>Preferences: {itinerary.preferences}</p>
//                 <p>Nights: {itinerary.nights}</p>
//                 <h5>Travel Options:</h5>
//                 {itinerary.travelOptions.map((option, index) => (
//                   <div key={index} className="mb-3">
//                     <h6>{option.transportation}</h6>
//                     <p>Total Cost: ${option.totalCost}</p>
//                     <p>Travel Budget: ${option.travelBudget}</p>
//                     <p>Accommodation Budget: ${option.accommodationBudget}</p>
//                     <p>Local Expenses Budget: ${option.localExpensesBudget}</p>
//                     <p>Local Experiences:</p>
//                     <ul>
//                       {option.localExperiences.map((experience, expIndex) => (
//                         <li key={expIndex}>{experience}</li>
//                       ))}
//                     </ul>
//                   </div>
//                 ))}
//               </Card.Text>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>
//     </Container>
//   );
// };

// export default ItineraryDetailsPage;