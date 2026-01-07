// // // src/components/DayCard.tsx
// import React from "react";

// export default function DayCard({ day }: { day: any }) {
//   const travelDesc = day.travelLeg?.journeyDescription ?? day.travelLeg?.description ?? (day.travelLeg ? JSON.stringify(day.travelLeg).slice(0, 200) : null);

//   return (
//     <div className="border rounded p-4 bg-white/60">
//       <div className="flex justify-between items-start">
//         <div>
//           <div className="text-sm text-muted-foreground">Day {day.day}{day.date ? ` • ${day.date}` : ""}</div>
//           <h4 className="font-semibold">{day.location} {day.title ? `• ${day.title}` : ""}</h4>
//           <div className="text-sm text-muted-foreground">{day.summary}</div>
//         </div>
//         <div className="text-right">
//           <div className="text-sm">Cost: {day.daySummary?.totalCost ? `₹${day.daySummary.totalCost}` : "—"}</div>
//         </div>
//       </div>

//       {travelDesc && (
//         <div className="mt-3 text-sm">
//           <div className="font-medium">Travel</div>
//           <div className="text-muted-foreground">{travelDesc}</div>
//         </div>
//       )}

//       {Array.isArray(day.activities) && day.activities.length > 0 && (
//         <div className="mt-3">
//           <div className="font-medium text-sm">Activities</div>
//           <ul className="list-disc list-inside text-sm text-muted-foreground">
//             {day.activities.map((a: any, i: number) => <li key={i}>{a.name} — ₹{a.cost ?? "—"}</li>)}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// }
