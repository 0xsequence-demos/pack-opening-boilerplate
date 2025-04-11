import { Clone, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Group } from "three";

export type MintStatus = "notStarted" | "pending" | "success" | "failed";

function PickAxe3D() {
  const { nodes } = useGLTF(
    "https://demo-adventure-assets.pages.dev/pickaxe-iron.glb",
  );
  const myGroup = useRef<Group | null>(null);
  useFrame(({ clock }) => {
    if (!myGroup.current) {
      return;
    }
    const now = clock.getElapsedTime();
    myGroup.current.rotation.y = now;
    myGroup.current.rotation.x = Math.sin(now * 4) * 0.1;
  });

  return (
    <group rotation={[0.5, 0, -0.25]}>
      <group ref={myGroup}>
        <Clone
          scale={[5, 5, 5]}
          position={[0, -1.75, 0]}
          object={nodes["iron-pickaxe"]}
        />
      </group>
    </group>
  );
}

useGLTF.preload("https://demo-adventure-assets.pages.dev/pickaxe-iron.glb");

export default PickAxe3D;
