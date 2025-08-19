import { useState } from 'react';
import { Link } from 'react-router-dom';

const categories = [
  { name: 'ABS', path: '/tutorials/abs' },
  { name: 'CHEST', path: '/tutorials/chest' },
  { name: 'BACK', path: '/tutorials/back' },
  { name: 'SHOULDERS', path: '/tutorials/shoulders' },
  { name: 'BICEPS', path: '/tutorials/biceps' },
  { name: 'TRICEPS', path: '/tutorials/triceps' },
  { name: 'LEGS', path: '/tutorials/legs' },
  { name: 'HOME WORKOUT', path: '/tutorials/home-workout' },
  { name: 'WARM UP', path: '/tutorials/warm-up' },
];

const Tutorials = () => {
  return (
    <div className="p-6">
      <div className="w-full max-w-7xl mx-auto"> 
        <h2 className="text-3xl font-bold text-primary mb-2 text-center">TUTORIALS</h2>
        <p className="text-center text-base-content/70 mb-8">Explore exercise tutorials by muscle groups. Click a category to get started!</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-base-100/60 rounded-xl p-2">
          {categories.map((cat) => (
            <a
              key={cat.name}
              href={`#${cat.name.replace(/\s+/g, '-').toLowerCase()}`}
              className="bg-base-200 rounded-xl shadow-md flex items-center justify-center h-24 text-lg font-semibold text-primary hover:bg-primary hover:text-base-200 transition-colors duration-200 cursor-pointer"
            >
              {cat.name}
            </a>
          ))}
        </div>
        {/* Category Sections */}
        <div className="mt-12 space-y-16">
          {categories.map((cat) => (
            <section
              key={cat.name}
              id={cat.name.replace(/\s+/g, '-').toLowerCase()}
              className="bg-base-200 rounded-xl shadow-md p-8"
            >
              <h3 className="text-2xl font-bold text-primary mb-4">{cat.name}</h3>
              {cat.name === 'CHEST' ? (
                <div className="space-y-6">
                  <p className="text-base-content/80 mb-6">Learn effective chest exercises with these video tutorials:</p>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="aspect-video">
                      <iframe
                        className="w-full h-full rounded-lg"
                        src="https://www.youtube.com/embed/fGm-ef-4PVk?start=2"
                        title="Chest Exercise Tutorial 1"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                    <div className="aspect-video">
                      <iframe
                        className="w-full h-full rounded-lg"
                        src="https://www.youtube.com/embed/ZyjQar-XgBc"
                        title="Chest Exercise Tutorial 2"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                </div>
              ) : cat.name === 'BACK' ? (
                <div className="space-y-6">
                  <p className="text-base-content/80 mb-6">Learn effective back exercises with these video tutorials:</p>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="aspect-video">
                      <iframe
                        className="w-full h-full rounded-lg"
                        src="https://www.youtube.com/embed/b_eislFFVhk"
                        title="Back Exercise Tutorial 1"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                    <div className="aspect-video">
                      <iframe
                        className="w-full h-full rounded-lg"
                        src="https://www.youtube.com/embed/jLvqKgW-_G8?start=3"
                        title="Back Exercise Tutorial 2"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                </div>
              ) : cat.name === 'SHOULDERS' ? (
                <div className="space-y-6">
                  <p className="text-base-content/80 mb-6">Learn effective shoulder exercises with these video tutorials:</p>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="aspect-video">
                      <iframe
                        className="w-full h-full rounded-lg"
                        src="https://www.youtube.com/embed/SgyUoY0IZ7A"
                        title="Shoulder Exercise Tutorial 1"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                    <div className="aspect-video">
                      <iframe
                        className="w-full h-full rounded-lg"
                        src="https://www.youtube.com/embed/ozpcrgmwyto"
                        title="Shoulder Exercise Tutorial 2"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                </div>
              ) : cat.name === 'BICEPS' ? (
                <div className="space-y-6">
                  <p className="text-base-content/80 mb-6">Learn effective biceps exercises with these video tutorials:</p>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="aspect-video">
                      <iframe
                        className="w-full h-full rounded-lg"
                        src="https://www.youtube.com/embed/GNO4OtYoCYk"
                        title="Biceps Exercise Tutorial 1"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                    <div className="aspect-video">
                      <iframe
                        className="w-full h-full rounded-lg"
                        src="https://www.youtube.com/embed/WvlDMlMx1Ok"
                        title="Biceps Exercise Tutorial 2"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                </div>
              ) : cat.name === 'ABS' ? (
                <div className="space-y-6">
                  <p className="text-base-content/80 mb-6">Learn effective abs exercises with these video tutorials:</p>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="aspect-video">
                      <iframe
                        className="w-full h-full rounded-lg"
                        src="https://www.youtube.com/embed/Y0nXmTZ1Ibs"
                        title="Abs Exercise Tutorial 1"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                    <div className="aspect-video">
                      <iframe
                        className="w-full h-full rounded-lg"
                        src="https://www.youtube.com/embed/Tn-XvYG9x7w?start=402"
                        title="Abs Exercise Tutorial 2"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                </div>
              ) : cat.name === 'LEGS' ? (
                <div className="space-y-6">
                  <p className="text-base-content/80 mb-6">Learn effective legs exercises with these video tutorials:</p>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="aspect-video">
                      <iframe
                        className="w-full h-full rounded-lg"
                        src="https://www.youtube.com/embed/Xg9B6pqHUQE"
                        title="Legs Exercise Tutorial 1"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                    <div className="aspect-video">
                      <iframe
                        className="w-full h-full rounded-lg"
                        src="https://www.youtube.com/embed/kIXcoivzGf8"
                        title="Legs Exercise Tutorial 2"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                </div>
              ) : cat.name === 'HOME WORKOUT' ? (
                <div className="space-y-6">
                  <p className="text-base-content/80 mb-6">Learn effective home workouts with this video tutorial:</p>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="aspect-video">
                      <iframe
                        className="w-full h-full rounded-lg"
                        src="https://www.youtube.com/embed/Yu20j5jGHTc"
                        title="Home Workout Exercise Tutorial"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                </div>
              ) : cat.name === 'TRICEPS' ? (
                <div className="space-y-6">
                  <p className="text-base-content/80 mb-6">Learn effective triceps exercises with these video tutorials:</p>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="aspect-video">
                      <iframe
                        className="w-full h-full rounded-lg"
                        src="https://www.youtube.com/embed/OpRMRhr0Ycc"
                        title="Triceps Exercise Tutorial 1"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                    <div className="aspect-video">
                      <iframe
                        className="w-full h-full rounded-lg"
                        src="https://www.youtube.com/embed/z8_fSUc7MTw?start=1"
                        title="Triceps Exercise Tutorial 2"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                </div>
              ) : cat.name === 'WARM UP' ? (
                <div className="space-y-6">
                  <p className="text-base-content/80 mb-6">Start your workout with this warm up routine:</p>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="aspect-video">
                      <iframe
                        className="w-full h-full rounded-lg"
                        src="https://www.youtube.com/embed/UIPvIYsjfpo"
                        title="Warm Up Routine"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-base-content/80">This is the section for <span className="font-semibold">{cat.name}</span> tutorials. Add your content here.</p>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tutorials;
