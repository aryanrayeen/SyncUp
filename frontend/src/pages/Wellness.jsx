import { useState, useEffect } from 'react';
import { useFitnessStore } from '../store/fitnessStore';

const Wellness = () => {
  const [inhaleTime, setInhaleTime] = useState(4);
  const [exhaleTime, setExhaleTime] = useState(6);
  const [timer, setTimer] = useState(null);
  const [phase, setPhase] = useState('inhale');
  const [timeLeft, setTimeLeft] = useState(inhaleTime);
  const [customInhale, setCustomInhale] = useState('');
  const [customExhale, setCustomExhale] = useState('');

  const { userInfo, weightHistory } = useFitnessStore();

  // Calculate current and previous weight
  const currentWeight = userInfo?.weight || 0;
  const lastWeight = weightHistory?.length > 1 ? weightHistory[weightHistory.length - 2]?.weight : currentWeight;
  const weightChange = currentWeight - lastWeight;
  const weightChangeColor = weightChange > 0 ? 'text-success' : weightChange < 0 ? 'text-error' : 'text-base-content';

  // Initialize timeLeft when inhaleTime changes
  useEffect(() => {
    setTimeLeft(inhaleTime);
  }, [inhaleTime]);

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [timer]);

  // Timer logic
  const startBreathwork = () => {
    setPhase('inhale');
    setTimeLeft(inhaleTime);
    if (timer) clearInterval(timer);
    let currentPhase = 'inhale';
    let currentTime = inhaleTime;
    const interval = setInterval(() => {
      if (currentTime > 1) {
        currentTime -= 1;
        setTimeLeft(currentTime);
      } else {
        if (currentPhase === 'inhale') {
          currentPhase = 'exhale';
          currentTime = exhaleTime;
        } else {
          currentPhase = 'inhale';
          currentTime = inhaleTime;
        }
        setPhase(currentPhase);
        setTimeLeft(currentTime);
      }
    }, 1000);
    setTimer(interval);
  };

  const stopBreathwork = () => {
    if (timer) clearInterval(timer);
    setTimer(null);
    setPhase('inhale');
    setTimeLeft(inhaleTime);
  };

  const updateTimes = () => {
    const inhale = parseInt(customInhale) || inhaleTime;
    const exhale = parseInt(customExhale) || exhaleTime;
    setInhaleTime(inhale);
    setExhaleTime(exhale);
    setTimeLeft(inhale);
    setPhase('inhale');
    stopBreathwork();
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      <div className="w-full max-w-full lg:max-w-3xl mx-auto">
        {/* Fitness Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-base-200 rounded-xl shadow-md p-4 flex flex-col justify-center items-start">
            <div className="font-semibold text-base-content mb-1">Current Weight</div>
            <div className="text-2xl font-bold mb-1">{currentWeight} kg</div>
            <div className={`text-sm font-semibold ${weightChangeColor}`}>{weightChange > 0 ? '+' : ''}{weightChange} kg {weightChange > 0 ? 'gained' : weightChange < 0 ? 'lost' : ''}</div>
          </div>
          {/* ...existing boxes... */}
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary mb-4 sm:mb-6 lg:mb-8 text-center">ZEN SECTION</h2>
        {/* Breathwork Section */}
        <section className="bg-base-200 rounded-xl shadow-md p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 lg:mb-12">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-primary mb-3 sm:mb-4">Breathwork Assistance & Guide</h3>
          <p className="mb-4 text-sm sm:text-base text-base-content/80">Practice mindful breathing. Set your inhale and exhale times, then start the timer to follow along.</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
            <div className="flex-1 sm:flex-none">
              <label className="block mb-1 text-sm sm:text-base">Inhale Time (seconds):</label>
              <input type="number" min="1" value={customInhale} onChange={e => setCustomInhale(e.target.value)} className="input input-bordered input-sm sm:input-md w-full sm:w-24" />
            </div>
            <div className="flex-1 sm:flex-none">
              <label className="block mb-1 text-sm sm:text-base">Exhale Time (seconds):</label>
              <input type="number" min="1" value={customExhale} onChange={e => setCustomExhale(e.target.value)} className="input input-bordered input-sm sm:input-md w-full sm:w-24" />
            </div>
            <button className="btn btn-primary btn-sm sm:btn-md self-end w-full sm:w-auto" onClick={updateTimes}>Set Times</button>
          </div>
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <div className="text-lg sm:text-xl font-semibold text-primary">{phase === 'inhale' ? 'Inhale' : 'Exhale'}</div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-base-content">{timeLeft}s</div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2 w-full sm:w-auto">
              <button className="btn btn-success btn-sm sm:btn-md" onClick={startBreathwork}>Start</button>
              <button className="btn btn-error btn-sm sm:btn-md" onClick={stopBreathwork}>Stop</button>
            </div>
          </div>
        </section>
        {/* Guided Meditation Section */}
        <section className="bg-base-200 rounded-xl shadow-md p-4 sm:p-6 lg:p-8">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-primary mb-3 sm:mb-4">Guided Meditation</h3>
          <p className="mb-4 text-sm sm:text-base text-base-content/80">Find peace and calm with guided meditation. Here are some tips to get started:</p>
          <ul className="list-disc pl-4 sm:pl-6 mb-4 sm:mb-6 text-sm sm:text-base text-base-content/80 space-y-1">
            <li>Find a quiet and comfortable place to sit.</li>
            <li>Close your eyes and focus on your breath.</li>
            <li>Let thoughts pass without judgment.</li>
            <li>Start with short sessions and gradually increase duration.</li>
            <li>Use calming music or guided videos for support.</li>
          </ul>
          <div className="mb-4 sm:mb-6">
            <h4 className="text-base sm:text-lg font-semibold mb-2">YouTube Videos</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="aspect-video">
                <iframe
                  className="w-full h-full rounded-lg"
                  src="https://www.youtube.com/embed/cyMxWXlX9sU"
                  title="Meditation Video 1"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="aspect-video">
                <iframe
                  className="w-full h-full rounded-lg"
                  src="https://www.youtube.com/embed/aIIEI33EUqI"
                  title="Meditation Video 2"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Wellness;
