import React, { useEffect, useState } from "react";
import { FaEye } from "react-icons/fa";
import styles from "../styles/components.module.css";

export default function LiveViewers() {
  const [viewers, setViewers] = useState(0);

  const generateRandom = () => {
    return Math.floor(Math.random() * 75) + 12;
  };

  useEffect(() => {
    setViewers(generateRandom());

    const interval = setInterval(
      () => {
        setViewers(generateRandom());
      },
      Math.floor(Math.random() * 5000) + 7000,
    );

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.liveViewers}>
      <FaEye size={18} />
      <span>{viewers} people are viewing this right now</span>
    </div>
  );
}
