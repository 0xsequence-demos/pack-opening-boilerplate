import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { Color } from "three";

const MyShaderMaterial = shaderMaterial(
  { uTime: 0, color: new Color(2, 4, 5) }, // uniforms
  // Vertex Shader
  `
    uniform float uTime;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vec3 pos = position;
      float a = pos.x * 0.5 * (sin(uTime * 4.0) * 2.5 + 3.0);
      float h = pos.y * 0.1 - 0.9;
      pos.x = cos(a) * h;
      pos.y = sin(a) * h;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform vec3 color;
    varying vec2 vUv;
    void main() {
      gl_FragColor = vec4(color, 1.0);
    }
  `,
);

extend({ MyShaderMaterial }); // Register as JSX component

export default MyShaderMaterial;

export interface IMyShaderMaterial {
  uTime: number;
  color: Color;
}
