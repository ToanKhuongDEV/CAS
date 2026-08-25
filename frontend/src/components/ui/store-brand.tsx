"use client";

import { useEffect, useState } from "react";
import { loadPublicStore } from "../../lib/api/store/public-store.api";

export function StoreBrand() {
  const [name, setName] = useState("CAS");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  useEffect(() => {
    void loadPublicStore()
      .then((store) => {
        setName(store.name);
        setLogoUrl(store.logoUrl);
      })
      .catch(() => undefined);
  }, []);
  return (
    <>
      <span className="grid size-10 place-items-center overflow-hidden rounded-xl shadow-[0_8px_20px_var(--cas-shadow-color)]">
        <img
          alt="Logo cửa hàng"
          className="size-full object-cover"
          src={
            logoUrl ??
            "https://www.clipartmax.com/png/middle/9-92296_red-restaurant-3-icon-restaurant.png"
          }
        />
      </span>
      <span className="text-xl font-black tracking-tight text-cas-primary">{name}</span>
    </>
  );
}

export function StoreLogo() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  useEffect(() => {
    void loadPublicStore()
      .then((store) => setLogoUrl(store.logoUrl))
      .catch(() => undefined);
  }, []);
  return (
    <img
      alt="Logo cửa hàng"
      className="size-full object-cover"
      src={
        logoUrl ??
        "https://www.clipartmax.com/png/middle/9-92296_red-restaurant-3-icon-restaurant.png"
      }
    />
  );
}
