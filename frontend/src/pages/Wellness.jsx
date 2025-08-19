import { useState, useEffect } from 'react';

const Wellness = () => {
  const [inhaleTime, setInhaleTime] = useState(4);
  const [exhaleTime, setExhaleTime] = useState(6);
  const [timer, setTimer] = useState(null);
  const [phase, setPhase] = useState('inhale');
  const [timeLeft, setTimeLeft] = useState(inhaleTime);
  const [customInhale, setCustomInhale] = useState('');
  const [customExhale, setCustomExhale] = useState('');

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
    <div className="p-6">
      <div className="w-full max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-primary mb-8 text-center">ZEN SECTION</h2>
        {/* Breathwork Section */}
        <section className="bg-base-200 rounded-xl shadow-md p-8 mb-12">
          <h3 className="text-2xl font-bold text-primary mb-4">Breathwork Assistance & Guide</h3>
          <p className="mb-4 text-base-content/80">Practice mindful breathing. Set your inhale and exhale times, then start the timer to follow along.</p>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div>
              <label className="block mb-1">Inhale Time (seconds):</label>
              <input type="number" min="1" value={customInhale} onChange={e => setCustomInhale(e.target.value)} className="input input-bordered w-24" />
            </div>
            <div>
              <label className="block mb-1">Exhale Time (seconds):</label>
              <input type="number" min="1" value={customExhale} onChange={e => setCustomExhale(e.target.value)} className="input input-bordered w-24" />
            </div>
            <button className="btn btn-primary self-end" onClick={updateTimes}>Set Times</button>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="text-xl font-semibold text-primary">{phase === 'inhale' ? 'Inhale' : 'Exhale'}</div>
            <div className="text-5xl font-bold text-base-content">{timeLeft}s</div>
            <div className="flex gap-4 mt-2">
              <button className="btn btn-success" onClick={startBreathwork}>Start</button>
              <button className="btn btn-error" onClick={stopBreathwork}>Stop</button>
            </div>
          </div>
        </section>
        {/* Guided Meditation Section */}
        <section className="bg-base-200 rounded-xl shadow-md p-8">
          <h3 className="text-2xl font-bold text-primary mb-4">Guided Meditation</h3>
          <p className="mb-4 text-base-content/80">Find peace and calm with guided meditation. Here are some tips to get started:</p>
          <ul className="list-disc pl-6 mb-6 text-base-content/80">
            <li>Find a quiet and comfortable place to sit.</li>
            <li>Close your eyes and focus on your breath.</li>
            <li>Let thoughts pass without judgment.</li>
            <li>Start with short sessions and gradually increase duration.</li>
            <li>Use calming music or guided videos for support.</li>
          </ul>
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-2">YouTube Videos</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
