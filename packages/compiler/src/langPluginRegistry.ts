import { pythonPluginSource } from "./templates";

const defaultPlugins: { [unit: string]: string } = {
  python: pythonPluginSource as string,
};

export default defaultPlugins;
