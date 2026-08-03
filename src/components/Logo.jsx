export default function Logo({ size = 26, color = '#4f46e5' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2 L22 20 H2 Z" stroke={color} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M13 7 L8 13 H11.5 L11 17 L16 11 H12.5 Z" fill={color} />
    </svg>
  );
}
