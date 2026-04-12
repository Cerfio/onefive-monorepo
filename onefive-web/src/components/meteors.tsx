import clsx from 'clsx';
import styles from './meteors.module.css';

export const Meteors = ({ number }: { number: number }) => {
  const getParentWidth = () => {
    return (
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth
    );
  };
  function getRandomLeftPosition() {
    const minLeft = -parentWidth;
    const maxLeft = parentWidth - 0;
    return Math.floor(Math.random() * (maxLeft - minLeft) + minLeft);
  }
  
  const parentWidth = getParentWidth() / 2;
  return [...new Array(number || 20).fill(true)].map((el, idx) => (
    <span
      key={idx}
      className={clsx(
        'animate-meteor-effect absolute rounded-[9999px] bg-slate-500 shadow-[0_0_0_1px_#ffffff10] rotate-[200deg]',
        styles.meteor,
      )}
      style={{
        top: 0,
        left: getRandomLeftPosition() * -1 + 'px',
        animationDelay: Math.random() * (0.8 - 0.2) + 0.2 + 's',
        animationDuration: Math.floor(Math.random() * (10 - 5) + 5) + 's',
      }}
    ></span>
  ));
};
