import React from "react";
import "./Ad.css";

interface AdProps {
  title: string;
  imageUrl: string;
}

const Ad: React.FC<AdProps> = ({ title, imageUrl }) => {
  return (
    <div className="ad-container">
      <h3>{title}</h3>
      <img src={imageUrl} alt={title} />
    </div>
  );
};

export default Ad;