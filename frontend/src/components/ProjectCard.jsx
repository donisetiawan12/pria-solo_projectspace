import React from 'react';

const ProjectCard = ({ project }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600">
          {project.authorAvatar}
        </div>
        <div>
          <h3 className="font-bold text-slate-900">{project.title}</h3>
          <p className="text-xs text-slate-500">{project.authorName}</p>
        </div>
      </div>
      
      <p className="text-sm text-slate-600 mb-4">{project.description}</p>
      
      <div className="flex flex-wrap gap-2">
        {project.techStack.map((tech, index) => (
          <span key={index} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-1 rounded">
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ProjectCard;