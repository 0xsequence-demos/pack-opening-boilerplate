import { Environment } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { ReactNode, Suspense } from "react";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

import Loader3D from "./Loader";

function View3D(props: { children: ReactNode }) {
  return (
    <Canvas style={{ aspectRatio: 1, borderRadius: "20px" }}>
      <Suspense fallback={<Loader3D />}>
        <Environment
          files={`/env-item.hdr`}
          background
          backgroundIntensity={0.5}
        />
        {props.children}
        <EffectComposer>
          <Bloom
            mipmapBlur={true}
            luminanceThreshold={0}
            luminanceSmoothing={1.5}
            intensity={2}
          />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}

export default View3D;
