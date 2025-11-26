import { useEffect, useState } from "react";
import { WebContainer } from "@webcontainer/api";

export function useWebContainer() {
  const [webContainer, setWebContainer] = useState<WebContainer | null>(null);

  useEffect(() => {
    let mounted = true;

    WebContainer.boot().then((wc) => {
      if (mounted) {
        console.log("✅ WebContainer Booted");
        setWebContainer(wc);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return webContainer;
}
