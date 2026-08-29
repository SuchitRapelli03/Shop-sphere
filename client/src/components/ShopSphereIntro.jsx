import React, { useEffect, useState } from "react";

const products = [
  { icon: "👜", x: -30, y: -38, z: 0, size: "text-4xl" },
  { icon: "🎧", x: 0, y: -45, z: 0, size: "text-4xl" },
  { icon: "👟", x: 32, y: -34, z: 0, size: "text-4xl" },
  { icon: "📱", x: -48, y: -8, z: 0, size: "text-4xl" },
  { icon: "⌚", x: 48, y: -5, z: 0, size: "text-3xl" },

  { icon: "💄", x: -45, y: 22, z: 0, size: "text-4xl" },
  { icon: "🍅", x: 43, y: 22, z: 0, size: "text-4xl" },

  { icon: "👕", x: -25, y: 43, z: 0, size: "text-4xl" },
  { icon: "🎮", x: 4, y: 45, z: 0, size: "text-4xl" },
  { icon: "💻", x: 32, y: 40, z: 0, size: "text-4xl" },

  { icon: "🧴", x: -12, y: -25, z: 0, size: "text-3xl" },
  { icon: "🎒", x: 18, y: -20, z: 0, size: "text-3xl" },
  { icon: "👓", x: -18, y: 18, z: 0, size: "text-3xl" },
  { icon: "🍎", x: 18, y: 24, z: 0, size: "text-3xl" },
];

export default function ShopSphere() {
  const [phase, setPhase] = useState("orbit");

  useEffect(() => {
    const scatterTimer = setTimeout(() => {
      setPhase("scatter");
    }, 3600);

    const logoTimer = setTimeout(() => {
      setPhase("logo");
    }, 6000);

    const finishTimer = setTimeout(() => {
      setPhase("finished");
    }, 8000);

    return () => {
      clearTimeout(scatterTimer);
      clearTimeout(logoTimer);
      clearTimeout(finishTimer);
    };
  }, []);

  if (phase === "finished") {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden transition-all duration-1000 ${
        phase === "logo"
          ? "bg-[#f4efe5]"
          : "bg-[#061814]"
      }`}
    >
      {/* =====================================================
          AMBIENT SPHERE GLOW
      ====================================================== */}

      <div
        className={`absolute h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[100px] transition-all duration-1500 ${
          phase === "scatter"
            ? "scale-[1.8] opacity-0"
            : ""
        }`}
      />

      {/* =====================================================
          3D SCENE
      ====================================================== */}

      <div
        className={`relative h-[560px] w-[560px] max-h-[90vw] max-w-[90vw] transition-all duration-1000 ${
          phase === "scatter"
            ? "scale-[1.08]"
            : phase === "logo"
            ? "scale-75 opacity-0"
            : ""
        }`}
        style={{
          perspective: "1100px",
          perspectiveOrigin: "center",
        }}
      >

        {/* ===================================================
            THE ACTUAL 3D SPHERE
        ==================================================== */}

        <div
          className={`absolute inset-0 ${
            phase === "orbit"
              ? "animate-shop-sphere"
              : ""
          }`}
          style={{
            transformStyle: "preserve-3d",
          }}
        >

          {/* Orbital rings */}

          <div
            className="absolute inset-[8%] rounded-full border border-emerald-300/10"
            style={{
              transform: "rotateX(68deg)",
              transformStyle: "preserve-3d",
            }}
          />

          <div
            className="absolute inset-[8%] rounded-full border border-emerald-300/10"
            style={{
              transform: "rotateY(68deg)",
              transformStyle: "preserve-3d",
            }}
          />

          {/* =================================================
              PRODUCTS
          ================================================== */}

          {products.map((product, index) => {

            /*
              Each item receives a different position on
              the imaginary sphere.
            */

            const angle =
              (index / products.length) * Math.PI * 2;

            const radius = 215;

            const sphereX =
              Math.cos(angle) * radius;

            const sphereY =
              Math.sin(angle) * radius * 0.72;

            const sphereZ =
              Math.sin(angle) * radius;

            const scale =
              0.72 +
              ((sphereZ + radius) / (radius * 2)) * 0.45;

            const opacity =
              0.42 +
              ((sphereZ + radius) / (radius * 2)) * 0.58;

            const scatterTransforms = [
              "translate3d(-360px,-260px,120px) rotate(-30deg)",
              "translate3d(-80px,-390px,100px) rotate(25deg)",
              "translate3d(320px,-300px,80px) rotate(40deg)",
              "translate3d(-410px,-70px,100px) rotate(-45deg)",
              "translate3d(410px,-40px,80px) rotate(50deg)",
              "translate3d(-390px,160px,120px) rotate(-30deg)",
              "translate3d(400px,170px,100px) rotate(35deg)",
              "translate3d(-260px,350px,100px) rotate(-40deg)",
              "translate3d(40px,380px,130px) rotate(25deg)",
              "translate3d(310px,330px,100px) rotate(45deg)",
              "translate3d(-250px,-350px,80px) rotate(-35deg)",
              "translate3d(220px,-360px,100px) rotate(30deg)",
              "translate3d(-330px,280px,100px) rotate(-30deg)",
              "translate3d(350px,280px,120px) rotate(40deg)",
            ];

            return (
              <div
                key={index}
                className={`absolute left-1/2 top-1/2 ${
                  phase === "scatter"
                    ? "opacity-0 duration-[1300ms]"
                    : "duration-500"
                }`}
                style={{
                  transform:
                    phase === "scatter"
                      ? scatterTransforms[index]
                      : `
                        translate3d(
                          ${sphereX}px,
                          ${sphereY}px,
                          ${sphereZ}px
                        )
                        scale(${scale})
                      `,
                  opacity:
                    phase === "scatter"
                      ? 0
                      : opacity,
                  transformStyle: "preserve-3d",
                  transitionProperty:
                    "transform, opacity",
                  transitionTimingFunction:
                    "cubic-bezier(0.22,1,0.36,1)",
                }}
              >

                <div
                  className={`flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.25)] backdrop-blur-md ${product.size}`}
                >
                  {product.icon}
                </div>

              </div>
            );
          })}

        </div>

        {/* ===================================================
            CENTRAL CART
        ==================================================== */}

        <div
          className={`absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ${
            phase === "scatter"
              ? "scale-110"
              : phase === "logo"
              ? "scale-125 opacity-0"
              : ""
          }`}
          style={{
            transformStyle: "preserve-3d",
          }}
        >

          <div className="absolute -inset-12 rounded-full bg-emerald-400/10 blur-3xl" />

          <div className="relative flex h-36 w-36 items-center justify-center rounded-full border border-emerald-200/20 bg-gradient-to-br from-emerald-400/20 via-emerald-500/10 to-transparent shadow-[0_0_80px_rgba(16,185,129,0.2)] backdrop-blur-xl">

            <span className="text-7xl drop-shadow-[0_8px_20px_rgba(0,0,0,0.3)]">
              🛒
            </span>

          </div>

        </div>

      </div>

      {/* =====================================================
          SHOPSPHERE LOGO
      ====================================================== */}

      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-[1200ms] ${
          phase === "logo"
            ? "scale-100 opacity-100"
            : "pointer-events-none scale-75 opacity-0"
        }`}
      >

        <div className="text-center">

          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-emerald-500 via-green-600 to-[#123c35] text-5xl shadow-2xl">
            🛒
          </div>

          <h1 className="mt-7 text-5xl font-black tracking-[-0.05em] text-[#123c35] sm:text-6xl">
            Shop<span className="text-emerald-600">Sphere</span>
          </h1>

          <p className="mt-3 text-sm font-semibold uppercase tracking-[0.35em] text-[#6b6254]">
            Everything you need, all in one sphere.
          </p>

        </div>

      </div>

      {/* =====================================================
          3D ROTATION
      ====================================================== */}

      <style>{`

        @keyframes shop-sphere {

          0% {
            transform:
              rotateY(0deg)
              rotateX(8deg);
          }

          25% {
            transform:
              rotateY(90deg)
              rotateX(-4deg);
          }

          50% {
            transform:
              rotateY(180deg)
              rotateX(8deg);
          }

          75% {
            transform:
              rotateY(270deg)
              rotateX(-4deg);
          }

          100% {
            transform:
              rotateY(360deg)
              rotateX(8deg);
          }

        }

        .animate-shop-sphere {
          animation:
            shop-sphere 4.2s
            cubic-bezier(0.65,0,0.35,1)
            infinite;

          transform-origin: center;
          transform-style: preserve-3d;
        }

        @media (prefers-reduced-motion: reduce) {

          .animate-shop-sphere {
            animation: none;
          }

        }

      `}</style>

    </div>
  );
}
