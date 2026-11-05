import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";

// Skiper 30 Parallax_002 (skiper-ui.com), adapted: takes the resort's photos and a centre slot
// for a headline, uses the site-wide Lenis instead of starting its own, 3 columns on phones.
// Four columns drift at different speeds as the section passes, like ridges at different distances.
export default function Parallax({ images, children }) {
  const gallery = useRef(null);
  const [h, setH] = useState(800);
  const { scrollYProgress } = useScroll({ target: gallery, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, h * 2]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, h * 3.3]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, h * 1.25]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, h * 3]);

  useEffect(() => {
    const resize = () => setH(innerHeight);
    resize();
    addEventListener("resize", resize);
    return () => removeEventListener("resize", resize);
  }, []);

  const cols = [y, y2, y3, y4];
  return (
    <div ref={gallery} className="relative box-border flex h-[175vh] gap-[2vw] overflow-clip bg-night p-[2vw]">
      {cols.map((yy, c) => (
        <motion.div
          key={c}
          style={{ y: yy }}
          className={`relative flex h-full w-1/3 flex-col gap-[2vw] md:w-1/4 ${["top-[-45%]", "top-[-95%]", "top-[-45%]", "top-[-75%] hidden md:flex"][c]}`}
        >
          {images.slice(c * 3, c * 3 + 3).map((img) => (
            <div key={img.src} className="relative h-full w-full overflow-hidden rounded-[1.25vw]">
              <img src={img.src} alt={img.alt} loading="lazy" className="pointer-events-none h-full w-full object-cover" />
            </div>
          ))}
        </motion.div>
      ))}
      {children}
    </div>
  );
}

/**
 * Skiper 30 Parallax_002 — React + framer motion + lenis
 * Free to use; attribution to Skiper UI (skiper-ui.com) is required for the free version.
 * Author: @gurvinder-singh02 — https://gxuri.me
 */
