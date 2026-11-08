export function BrandMark({ className = "" }) {
  return (
    <img
      src="/Full_logo1.png"
      alt=""
      className={className}
      loading="lazy"
    />
  );
}

export function BrandText({ compact = false }) {
  return (
    <span className="brand-text">
      <strong className={compact ? "brand-name brand-name-compact" : "brand-name"}>
        Shakhawat H. Shuvo
      </strong>
      <span className="brand-role">SOFTWARE DEVELOPER</span>
    </span>
  );
}
