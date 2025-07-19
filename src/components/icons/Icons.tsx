import React from 'react';

type IconProps = {
  className?: string;
};

export const LeafIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66C7.32 16.5 10 12 17 12V8z" />
    <path d="M17 8a5.22 5.22 0 00-4.63 2.5L11 12l.37-1.5A5.22 5.22 0 0017 8z" />
  </svg>
);

export const PlanetIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h1a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.894 15.106l-1.442 1.442a2 2 0 01-2.828 0l-1.414-1.414a2 2 0 010-2.828l1.442-1.442M16.106 8.894l1.442-1.442a2 2 0 012.828 0l1.414 1.414a2 2 0 010 2.828l-1.442 1.442" />
        <circle cx="12" cy="12" r="10" />
    </svg>
);

export const RecycleIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <polyline points="1 4 1 10 7 10"></polyline>
        <polyline points="23 20 23 14 17 14"></polyline>
        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
    </svg>
);

export const WaterDropIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.69l5.66 5.66a8 8 0 11-11.32 0L12 2.69z" />
    </svg>
);

export const WormIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10c2-3 5-3 7 0s5 3 7 0" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 14c2 3 5 3 7 0s5-3 7 0" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 18c2-3 5-3 7 0s5 3 7 0" />
    </svg>
);

export const SproutIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12c.5-5 5-9 9-9s8.5 4 9 9-4 9-9 9-8.5-4-9-9zM12 12a5 5 0 00-5 5h10a5 5 0 00-5-5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1" />
    </svg>
);

export const PlantIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-3 0-6 2.5-6 6v4h12v-4c0-3.5-3-6-6-6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8V4m0 4c-1.5 0-3-.5-3-2s1.5-2 3-2 3 .5 3 2-1.5 2-3 2z" />
    </svg>
);

export const TomatoIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="14" r="7" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7s-1 2-3 2-3-2-3-2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7V4" />
    </svg>
);

export const ShieldCheckIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.417l5.318-2.659A12.003 12.003 0 0012 21.056a12.003 12.003 0 003.682-7.299l5.318 2.66A12.02 12.02 0 0021 8.382a11.955 11.955 0 01-2.382-3.416z" />
    </svg>
);

export const CheckCircleIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const AtomIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
);

export const CalendarIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

export const SpoonIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 21v-6m0 0a4 4 0 100-8 4 4 0 000 8z" />
    </svg>
);

export const BeakerIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5v-3c0-1.036.84-1.875 1.875-1.875h14.25c1.035 0 1.875.84 1.875 1.875v3c0 1.036-.84 1.875-1.875 1.875H4.875A1.875 1.875 0 013 13.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.038-.502.069-.75.088v5.714c0 .552-.448 1-1 1s-1-.448-1-1V3.192c-.249-.02-.499-.05-.75-.088m11.25 0c.251.038.502.069.75.088v5.714c0 .552.448 1 1 1s1-.448 1-1V3.192c.249-.02.499-.05.75-.088m-3.75 0a2.25 2.25 0 00-4.5 0" />
    </svg>
);

export const WateringCanIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 5H5v9h8V5zm0 9l5 2V7l-5-2zM5 5l-3-1v11l3 1" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 7v.01M18 10v.01M18 13v.01" />
    </svg>
);

export const UniversityIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);
