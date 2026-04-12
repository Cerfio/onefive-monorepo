import React from "react";

const FeatureCard = ({
  title,
  subtitle,
  description,
  animation,
}: {
  title: string;
  subtitle: string;
  description: string;
  animation: React.ReactNode;
}) => {
  return (
    <div className="pt-16 w-full max-w-7xl flex flex-col justify-center items-center">
      <h2 className="text-3xl font-bold text-center">{title}</h2>
      <div className="text-muted-foreground rounded-2xl text-xs font-medium text-center">
        {subtitle}
      </div>
      <p className="text-lg text-muted-foreground mb-6 mt-4 text-center ">
        {description}
      </p>
      {/* <div className="relative mt-5 p-4 border-2 border-border rounded-2xl w-[800px] h-[320px]">
        {animation}
      </div> */}
    </div>
  );
};

export default FeatureCard;
