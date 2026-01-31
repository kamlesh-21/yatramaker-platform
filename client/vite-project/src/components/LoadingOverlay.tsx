// // src/components/LoadingOverlay.tsx
// import { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';

// const destinations = [
//   'Kerala Backwaters', 'Jaipur Palaces', 'Varanasi Ghats', 
//   'Himalayan Peaks', 'Goa Beaches', 'Rajasthan Desert', 
//   'Taj Mahal', 'Kerala Houseboats', 'Ladakh Lakes'
// ];

// interface LoadingOverlayProps {
//   minDuration?: number; // milliseconds
//   message?: string;
// }

// export default function LoadingOverlay({
//   minDuration = 45000,
//   message = "Crafting your perfect Indian journey..."
// }: LoadingOverlayProps) {
//   const [progress, setProgress] = useState(0);
//   const [currentTip, setCurrentTip] = useState(0);
//   const [elapsed, setElapsed] = useState(0);

//   useEffect(() => {
//     const start = Date.now();
//     const interval = setInterval(() => {
//       const now = Date.now();
//       const timePassed = now - start;
//       setElapsed(timePassed);

//       const perc = Math.min(100, Math.floor((timePassed / minDuration) * 100));
//       setProgress(perc);

//       // Cycle tips every ~8 seconds
//       setCurrentTip(Math.floor(timePassed / 8000) % 5);

//       if (timePassed >= minDuration) {
//         clearInterval(interval);
//       }
//     }, 200);

//     return () => clearInterval(interval);
//   }, [minDuration]);

//   const tips = [
//     "Warming up the AI explorer...",
//     "Discovering hidden gems across India...",
//     "Matching your budget & preferences...",
//     "Optimizing multi-city routes...",
//     "Almost ready – your adventure awaits! ✨"
//   ];

//   return (
//     <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950/95 via-purple-950/90 to-blue-950/95 backdrop-blur-md">
//       {/* Floating destinations animation */}
//       <div className="relative w-80 h-80 mb-12">
//         {destinations.map((dest, i) => (
//           <motion.div
//             key={dest}
//             className="absolute left-1/2 top-1/2 text-white font-medium text-sm bg-primary/20 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/30 shadow-lg whitespace-nowrap"
//             initial={{ opacity: 0, scale: 0, x: '-50%', y: '-50%' }}
//             animate={{
//               opacity: 1,
//               scale: 1,
//               x: `-50%`,
//               y: `-50%`,
//               rotate: 360 * (i % 2 === 0 ? 1 : -1),
//               translateX: `${Math.cos((i / destinations.length) * Math.PI * 2) * 120}px`,
//               translateY: `${Math.sin((i / destinations.length) * Math.PI * 2) * 120}px`,
//             }}
//             transition={{
//               duration: 12 + i * 0.8,
//               repeat: Infinity,
//               repeatType: "reverse",
//               ease: "easeInOut",
//               delay: i * 0.4,
//             }}
//           >
//             {dest}
//           </motion.div>
//         ))}
//       </div>

//       <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-wide text-center">
//         {message}
//       </h2>

//       <div className="w-72 md:w-96 h-3 bg-white/10 rounded-full overflow-hidden mb-6">
//         <motion.div
//           className="h-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400"
//           initial={{ width: "0%" }}
//           animate={{ width: `${progress}%` }}
//           transition={{ duration: 0.4, ease: "easeOut" }}
//         />
//       </div>

//       <p className="text-indigo-200 text-lg md:text-xl max-w-md text-center px-6">
//         {tips[currentTip % tips.length]}
//       </p>

//       <p className="mt-8 text-sm text-indigo-300/80">
//         This may take 30–90 seconds on first load (Render free tier wake-up)
//       </p>
//     </div>
//   );
// }