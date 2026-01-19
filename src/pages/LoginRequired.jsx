import React, { useEffect } from "react";
import AuthModal from "../components/AuthModal";

export default function LoginRequired() {
  const [open, setOpen] = React.useState(true);

  useEffect(() => {
    setOpen(true);
  }, []);

  return (
    <>
      {open && <AuthModal onClose={() => setOpen(false)} />}
      <div></div>
    </>
  );
}
