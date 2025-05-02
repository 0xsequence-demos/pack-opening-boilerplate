import { Clone, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { animated, useSpringValue } from "@react-spring/three";
import { Box3, Group, Vector3 } from "three";

const tempVec3 = new Vector3();
export default function GenericItem(props: {
  gltfUrl: string;
  position: [number, number, number];
  scale: number;
  shaking?: boolean;
}) {
  const { nodes } = useGLTF(props.gltfUrl);
  const { shaking } = props
  const bbox = new Box3();
  if (nodes["Scene"]) {
    bbox.setFromObject(nodes["Scene"]);
  }
  bbox.getSize(tempVec3);
  const largestSize = Math.max(tempVec3.x, Math.max(tempVec3.y, tempVec3.z));
  const size = new Vector3(5, 5, 5).divideScalar(largestSize);

  const scale = useSpringValue(0, {
    config: {
      mass: 0.25,
      friction: 5,
      tension: 100,
    },
  });
  useEffect(() => {
    scale.start(1);
  });

  bbox.getCenter(tempVec3).multiply(size);
  const center = new Vector3(0, 0, 0).sub(tempVec3);
  const myGroup = useRef<Group | null>(null);
  useFrame(({ clock }) => {
    if (!myGroup.current) {
      return;
    }
    const now = clock.getElapsedTime();
    let ry = Math.sin(now) * 0.2;
    let rx = Math.sin(now * 4) * 0.05;
    if (shaking) {
      rx += Math.sin(now * 36 + Math.sin(now * 5) * 3) * 0.1;
      ry += Math.cos(now * 21 + Math.sin(now) * 2) * 0.05;
    }
    myGroup.current.rotation.y = ry;
    myGroup.current.rotation.x = rx;
  });

  const s = props.scale;

  return (
    <animated.group
      rotation={[0.25, 0.65, 0]}
      position={props.position}
      scale={s}
    >
      <animated.group ref={myGroup} scale={scale}>
        <Clone scale={size} position={center} object={nodes["Scene"]} />
      </animated.group>
    </animated.group>
  );
}
