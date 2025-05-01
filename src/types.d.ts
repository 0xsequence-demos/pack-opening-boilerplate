import MyShaderMaterial, {
  IMyShaderMaterial,
} from "./components/3d/MyShaderMaterial";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      myShaderMaterial: ReactThreeFiber.MaterialNode<
        MyShaderMaterial,
        IMyShaderMaterial
      >;
    }
  }
}
