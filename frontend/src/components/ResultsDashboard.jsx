import React from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  TrendingUp, 
  Award,
  Zap,
  Briefcase
} from 'lucide-react';

const ResultsDashboard = ({ result }) => {
  if (!result) return null;

  const {
    ATS_score = 0,
    match_percentage = 0,
    missing_skills = [],
    strengths = [],
    weaknesses = [],
    improvements = [],
    rewritten_points = [],
    final_verdict = "No verdict available."
  } = result;

  const getScoreGradient = (score) => {
    if (score >= 80) return 'text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]';
    if (score >= 60) return 'text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]';
    return 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]';
  };

  const getScoreBgGradient = (score) => {
    if (score >= 80) return 'bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg shadow-green-500/30';
    if (score >= 60) return 'bg-gradient-to-r from-yellow-400 to-amber-500 shadow-lg shadow-yellow-500/30';
    return 'bg-gradient-to-r from-red-400 to-rose-500 shadow-lg shadow-red-500/30';
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ATS Score */}
        <div className="glass-card p-6 rounded-3xl shadow-lg flex flex-col items-center justify-center relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
          <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-widest">ATS Score</h3>
          <div className="relative flex items-center justify-center w-36 h-36">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-200 dark:text-gray-700/50"
                strokeWidth="2.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${getScoreGradient(ATS_score)} transition-all duration-1000 ease-out`}
                strokeWidth="2.5"
                strokeDasharray={`${ATS_score}, 100`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-black ${getScoreGradient(ATS_score)}`}>{ATS_score}</span>
            </div>
          </div>
        </div>

        {/* Match Percentage */}
        <div className="glass-card p-6 rounded-3xl shadow-lg flex flex-col justify-center relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent-500/10 rounded-full blur-3xl -ml-10 -mb-10 transition-transform group-hover:scale-150"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Job Match</h3>
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Briefcase className="w-5 h-5 text-gray-500" />
            </div>
          </div>
          <div className="flex items-end space-x-2 mb-4 relative z-10">
            <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
              {match_percentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200/50 dark:bg-gray-700/50 rounded-full h-3 relative z-10 backdrop-blur-sm overflow-hidden p-0.5">
            <div 
              className={`h-full rounded-full ${getScoreBgGradient(match_percentage)} transition-all duration-1000 ease-out`} 
              style={{ width: `${match_percentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Final Verdict */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
        <div className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-primary-500/30 p-6 rounded-3xl shadow-lg flex items-start space-x-4">
          <div className="p-3 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl shrink-0 shadow-lg shadow-primary-500/30">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-lg text-gray-900 dark:text-white">Overall Verdict</h4>
            <p className="text-base text-gray-700 dark:text-gray-300 mt-2 leading-relaxed font-medium">
              {final_verdict}
            </p>
          </div>
        </div>
      </div>

      {/* Skills Gap */}
      {missing_skills && missing_skills.length > 0 && (
        <div className="glass-card p-6 rounded-3xl shadow-lg hover:-translate-y-1 transition-all duration-300">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center mb-4">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl mr-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
            </div>
            Missing Skills (Skill Gap)
          </h3>
          <div className="flex flex-wrap gap-2">
            {missing_skills.map((skill, idx) => (
              <span key={idx} className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-bold rounded-xl border border-red-200 dark:border-red-800 shadow-sm transition-transform hover:scale-105">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-3xl shadow-lg hover:-translate-y-1 transition-all duration-300">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center mb-5">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl mr-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500" />
            </div>
            Strengths
          </h3>
          <ul className="space-y-4">
            {strengths.map((item, idx) => (
              <li key={idx} className="flex items-start text-sm font-medium text-gray-700 dark:text-gray-300 bg-white/40 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-100 dark:border-gray-700/50">
                <span className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mt-1.5 mr-3 shrink-0 shadow-[0_0_5px_rgba(52,211,153,0.5)]"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card p-6 rounded-3xl shadow-lg hover:-translate-y-1 transition-all duration-300">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center mb-5">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl mr-3">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-500" />
            </div>
            Weaknesses
          </h3>
          <ul className="space-y-4">
            {weaknesses.map((item, idx) => (
              <li key={idx} className="flex items-start text-sm font-medium text-gray-700 dark:text-gray-300 bg-white/40 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-100 dark:border-gray-700/50">
                <span className="w-2 h-2 bg-gradient-to-r from-red-400 to-rose-500 rounded-full mt-1.5 mr-3 shrink-0 shadow-[0_0_5px_rgba(244,63,94,0.5)]"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Improvements */}
      <div className="glass-card p-6 rounded-3xl shadow-lg hover:-translate-y-1 transition-all duration-300">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center mb-5">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl mr-3">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-500" />
          </div>
          Improvement Suggestions
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {improvements.map((item, idx) => (
            <li key={idx} className="flex items-start text-sm font-medium text-gray-700 dark:text-gray-300 bg-white/40 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50">
              <span className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full mt-1.5 mr-3 shrink-0 shadow-[0_0_5px_rgba(56,189,248,0.5)]"></span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Rewritten Points */}
      {rewritten_points && rewritten_points.length > 0 && (
        <div className="glass-card p-6 rounded-3xl shadow-lg hover:-translate-y-1 transition-all duration-300">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center mb-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl mr-3">
              <Zap className="w-5 h-5 text-purple-600 dark:text-purple-500" />
            </div>
            Suggested Bullet Points
          </h3>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6 pl-14">
            Consider replacing some of your weak bullet points with these optimized versions:
          </p>
          <div className="space-y-4">
            {rewritten_points.map((point, idx) => (
              <div key={idx} className="group relative p-5 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800 rounded-2xl text-sm font-medium text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 shadow-sm transition-all hover:shadow-md hover:border-purple-300 dark:hover:border-purple-500/50">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 to-accent-500 rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                "{point}"
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default ResultsDashboard;
