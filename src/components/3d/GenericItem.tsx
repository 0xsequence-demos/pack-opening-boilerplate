import { Clone, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Box3, Group, Vector3 } from "three";

const tempVec3 = new Vector3();
export default function GenericItem(props: { gltfUrl: string }) {
  const { nodes } = useGLTF(props.gltfUrl);
  const bbox = new Box3();
  if (nodes["Scene"]) {
    bbox.setFromObject(nodes["Scene"]);
  }
  bbox.getSize(tempVec3);
  const largestSize = Math.max(tempVec3.x, Math.max(tempVec3.y, tempVec3.z));
  const size = new Vector3(5, 5, 5).divideScalar(largestSize);
  bbox.getCenter(tempVec3).multiply(size);
  const center = new Vector3(0, 0, 0).sub(tempVec3);
  const myGroup = useRef<Group | null>(null);
  useFrame(({ clock }) => {
    if (!myGroup.current) {
      return;
    }
    const now = clock.getElapsedTime();
    myGroup.current.rotation.y = Math.sin(now) * 0.2;
    myGroup.current.rotation.x = Math.sin(now * 4) * 0.05;
  });

  return (
    <group rotation={[0.25, 0.65, 0]} position={[0, 0, -2]}>
      <group ref={myGroup}>
        <Clone scale={size} position={center} object={nodes["Scene"]} />
      </group>
    </group>
  );
}
