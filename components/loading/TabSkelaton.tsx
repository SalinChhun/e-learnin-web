import { NextPage } from 'next';

interface Props {
    number?: number;
}

const TabSkeleton: NextPage<Props> = ({
    number = 3
}) => {
  // Create an array with the specified number of elements
  const skeletonArray = Array.from({ length: number }, (_, index) => index);
  
  return (
    <div className="tabs flex gap-2">
      {skeletonArray.map((index) => (
        <div key={`skeleton-card-${index}`} className="skeleton-tabs">
          <div className="skeleton-tab"></div>
        </div>
      ))}
    </div>
  );
};

export default TabSkeleton;