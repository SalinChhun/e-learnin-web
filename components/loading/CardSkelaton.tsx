import { NextPage } from 'next';

interface Props {
    number?: number;
}

const CardSkeleton: NextPage<Props> = ({
    number = 3
}) => {
  // Create an array with the specified number of elements
  const skeletonArray = Array.from({ length: number }, (_, index) => index);
  
  return (
    <div className="stats-grid">
      {skeletonArray.map((index) => (
        <div key={`skeleton-card-${index}`} className="stat-card">
          <div className="skeleton-stat-title"></div>
          <div className="skeleton-stat-value"></div>
        </div>
      ))}
    </div>
  );
};

export default CardSkeleton;