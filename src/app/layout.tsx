import React from "react";
import "../styles/app.scss";
type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
};

export default Layout;
