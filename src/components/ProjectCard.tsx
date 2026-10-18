import React from 'react';
import { Play, Image as ImageIcon, Layers, Tag, ExternalLink } from 'lucide-react';
import type { Project } from '../types/portfolio.ts';

interface ProjectCardProps {
  project: Project;
  categoryName: string;
  onClick: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  categoryName,
  onClick,
}) => {
  const hasVideo = Boolean(project.videoUrl && project.videoUrl.trim());
  const hasMultipleImages = project.galleryImages && project.galleryImages.length > 1;

  return (
    <article
      onClick={() => onClick(project)}
      className="group cursor-pointer rounded-2xl bg-[#0f172a] border border-slate-800/90 hover:border-cyan-500/50 shadow-lg hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
      tabIndex={0}
      role="button"
      aria-label={`View project details for ${project.title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(project);
        }
      }}
    >
      {/* Cover Media Container */}
      <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden">
        <img
          src={project.coverImage}
          alt={project.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Category Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-900/90 backdrop-blur-md text-cyan-400 border border-slate-700/80 shadow-sm">
            {categoryName}
          </span>
        </div>

        {/* Badges on Top Right: Video / Gallery / Demo */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          {project.isDemo && (
            <span 
              className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-950/80 text-amber-300 border border-amber-800/60"
              title="Demo artwork — you can replace or remove this in the Admin dashboard"
            >
              Demo Content
            </span>
          )}

          {hasVideo && (
            <span className="p-1.5 rounded-md bg-rose-600/90 text-white shadow" title="Includes video">
              <Play className="w-3.5 h-3.5 fill-current" />
            </span>
          )}

          {hasMultipleImages && (
            <span className="p-1.5 rounded-md bg-slate-900/90 text-slate-300 border border-slate-700 shadow" title="Multiple images">
              <Layers className="w-3.5 h-3.5" />
            </span>
          )}
        </div>

        {/* Center Hover Action Cue */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/30 backdrop-blur-[2px]">
          <span className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold shadow-lg flex items-center gap-1.5 transform scale-95 group-hover:scale-100 transition-transform">
            {hasVideo ? <Play className="w-3.5 h-3.5 fill-current" /> : <ImageIcon className="w-3.5 h-3.5" />}
            <span>View Artwork & Details</span>
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-400 transition-colors line-clamp-1">
            {project.title}
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm line-clamp-2 leading-relaxed">
            {project.shortDescription}
          </p>
        </div>

        {/* Software / Tools Tags */}
        <div className="pt-4 flex flex-wrap items-center gap-1.5 mt-auto">
          {project.softwareUsed && project.softwareUsed.slice(0, 3).map((tool, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60"
            >
              {tool}
            </span>
          ))}
          {project.softwareUsed && project.softwareUsed.length > 3 && (
            <span className="text-[11px] text-slate-500">
              +{project.softwareUsed.length - 3}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};
