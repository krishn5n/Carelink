// src/hooks/useModel.ts
import { classifyReading } from "../services/model";

export function useModel() {
  return {
    classify: classifyReading,
  };
}


