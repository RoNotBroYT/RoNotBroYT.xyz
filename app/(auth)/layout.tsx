import React from "react";
import styles from "../bg.module.css";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className={styles.backgroundImage}>
      <main className="auth">{children}</main>
    </div>
  );
};

export default Layout;
