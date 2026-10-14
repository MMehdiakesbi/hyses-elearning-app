// Logo officiel HYSES (public/hyses-logo.png, triangle blanc sur fond ardoise).
// Le parametre `color` est conserve pour compatibilite avec les appels existants
// mais n'a plus d'effet : le logo officiel ne se recolore pas.
// eslint-disable-next-line no-unused-vars
export default function Logo({ size = 32, color }) {
  return (
    <img
      src="/hyses-logo.png"
      width={size}
      height={size}
      alt="HYSES"
      style={{ display: 'inline-block', verticalAlign: 'middle', borderRadius: Math.round(size * 0.18), flexShrink: 0 }}
    />
  );
}
