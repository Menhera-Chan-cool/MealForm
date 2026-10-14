export default function ContentSkeleton({label,kind='cards'}) {
  return <div className={`content-skeleton skeleton-${kind}`} role="status" aria-label={label} aria-busy="true"><p aria-hidden="true">{label}</p><div className="skeleton-shapes" aria-hidden="true">{[0,1,2].map(index=><div className="skeleton-block" key={index}><span/><span/><span/></div>)}</div></div>;
}
