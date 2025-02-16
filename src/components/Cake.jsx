import { useEffect, useState } from "react";
import "../assets/css/cake.css";
import { CakeSVG, confetti } from "../assets";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function Cake() {
  const [candlesBlownOut, setCandlesBlownOut] = useState(false);
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);

  useEffect(() => {
    let audioContext;
    let analyser;
    let dataArray;
    let blowStartTime = null;

    async function initBlowDetection() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);

        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        source.connect(analyser);

        detectBlow();
      } catch (error) {
        console.error("Microphone access denied:", error);
      }
    }

    function detectBlow() {
      if (!analyser || !dataArray) return;
      analyser.getByteFrequencyData(dataArray);
      const lowFreqValues = dataArray.slice(0, 10);
      const avgLowFreq =
        lowFreqValues.reduce((sum, value) => sum + value, 0) / lowFreqValues.length;

      const blowThreshold = 50; 
      const requiredDuration = 1000; 

      if (avgLowFreq > blowThreshold) {
        if (!blowStartTime) {
          blowStartTime = performance.now();
        } else if (performance.now() - blowStartTime > requiredDuration) {
          setCandlesBlownOut(true);
        }
      } else {
        blowStartTime = null;
      }

      requestAnimationFrame(detectBlow);
    }

    setTimeout(() => {
      initBlowDetection();
      setMicPermissionGranted(true);
    }, 10000); 

    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);

  return (
    <div className="bg-black/80 h-screen w-screen flex items-center justify-center overflow-hidden relative">
      {candlesBlownOut && (
        <div
          className="absolute inset-0 bg-cover bg-center z-50"
          style={{ backgroundImage: `url(${confetti})` }}
        />
      )}
      {candlesBlownOut && (
        <motion.div
          className="absolute top-20 text-white text-3xl font-bold z-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <svg width="800" height="200" viewBox="0 0 400 200">
            <defs>
              <path id="curve" d="M50,150 Q200,50 350,150" fill="transparent" stroke="white" />
            </defs>
            <text fontSize="40" fill="white" textAnchor="middle">
              <textPath href="#curve" startOffset="50%">Happy Birthday!</textPath>
            </text>
          </svg>
        </motion.div>
      )}
      <div className="relative z-10">
        <div className="absolute -top-48 left-1/2 transform -translate-x-1/2">
          <div className="candle">
            {!candlesBlownOut && (
              <div>
                <div className="absolute -top-[200px] text-gray-200 text-3xl">
                  <motion.div
                    animate={{ opacity: [0, 0.25, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 8 }}
                    className="block -translate-x-[60px] translate-y-[105px] -rotate-[30deg] text-gray-200 text-xl"
                  >
                    blow
                  </motion.div>
                  <motion.div
                    animate={{ opacity: [0, 0.25, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 9 }}
                    className="block translate-x-10 translate-y-[80px] rotate-[30deg] text-gray-200 text-xl"
                  >
                    blow
                  </motion.div>
                </div>
                <div>
                  <div className="flame"></div>
                  <div className="flame"></div>
                  <div className="flame"></div>
                  <div className="flame"></div>
                  <div className="flame"></div>
                </div>
              </div>
            )}
          </div>
        </div>
        <CakeSVG />
      </div>
    </div>
  );
}

export default Cake;
