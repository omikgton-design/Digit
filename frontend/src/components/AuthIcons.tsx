import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base: IconProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export const UserIcon = (props: IconProps) => (
  <svg {...base} {...props}><circle cx="12" cy="8" r="4" fill="currentColor" stroke="none" /><path d="M4 21c0-4.2 3.6-6.5 8-6.5s8 2.3 8 6.5z" fill="currentColor" stroke="none" /></svg>
);
export const BuildingIcon = (props: IconProps) => (
  <svg {...base} {...props}><path d="M4 21V5.5A1.5 1.5 0 0 1 5.5 4H13a1.5 1.5 0 0 1 1.5 1.5V21z" fill="currentColor" stroke="none" /><path d="M14.5 10H19a1.5 1.5 0 0 1 1.5 1.5V21h-6z" fill="currentColor" stroke="none" opacity=".75" /><path d="M7.5 8h4M7.5 11.5h4M7.5 15h4" stroke="#fff" /></svg>
);
export const MailIcon = (props: IconProps) => (
  <svg {...base} {...props}><rect x="3" y="5" width="18" height="14" rx="2.5" fill="currentColor" stroke="none" /><path d="m4.5 8 7.5 5.2L19.5 8" stroke="#fff" strokeWidth={1.6} /></svg>
);
export const LockIcon = (props: IconProps) => (
  <svg {...base} {...props}><rect x="4.5" y="10.5" width="15" height="10" rx="2.5" fill="currentColor" stroke="none" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /><circle cx="12" cy="15.5" r="1.5" fill="#fff" stroke="none" /></svg>
);
export const EyeIcon = (props: IconProps) => (
  <svg {...base} {...props}><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" /><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" /></svg>
);
export const EyeOffIcon = (props: IconProps) => (
  <svg {...base} {...props}><path d="M2 12s3.6-6.5 10-6.5c2 0 3.7.6 5.2 1.4M22 12s-3.6 6.5-10 6.5c-2 0-3.7-.6-5.2-1.4" /><circle cx="12" cy="12" r="3" /><path d="M4 4l16 16" /></svg>
);
export const ArrowLeftIcon = (props: IconProps) => (
  <svg {...base} width={20} height={20} strokeWidth={2} {...props}><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
);
export const ArrowRightIcon = (props: IconProps) => (
  <svg {...base} width={20} height={20} strokeWidth={2} {...props}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const CheckIcon = (props: IconProps) => (
  <svg {...base} width={16} height={16} strokeWidth={3} {...props}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
);
export const GoogleIcon = (props: IconProps) => (
  <svg width={22} height={22} viewBox="0 0 48 48" aria-hidden="true" {...props}>
    <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z" />
    <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z" />
    <path fill="#FBBC05" d="M12.6 27.7a12 12 0 0 1 0-7.4V15H5.8a20 20 0 0 0 0 18l6.8-5.3Z" />
    <path fill="#EA4335" d="M24 11.9c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 5.9 29.5 4 24 4A20 20 0 0 0 5.8 15l6.8 5.3c1.6-4.8 6.1-8.4 11.4-8.4Z" />
  </svg>
);
