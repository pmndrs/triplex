/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { readFileSync } from "node:fs";
import resolvePkgPath from "resolve-package-path";

const coreReactModules = ["@types/react", "react", "react-dom"];
const threeFiberModules = ["@react-three/fiber", "@types/three", "three"];
const optionalThreeFiberModules = ["@react-three/drei", "@react-three/xr"];

interface VersionRange {
  max?: string;
  min: string;
}

/**
 * Version requirements per @react-three/fiber major version. These are based on
 * the peerDependencies of each package.
 */
const fiberVersionRequirements: Record<number, Record<string, VersionRange>> = {
  // @react-three/fiber v10.x requires React 19, three >=0.181
  // Compatible with @react-three/drei v10.x/v11.x and @react-three/xr v6.x
  10: {
    "@react-three/drei": { min: "10.0.0" },
    "@react-three/xr": { min: "6.0.0" },
    react: { min: "19.0.0" },
    "react-dom": { min: "19.0.0" },
    three: { min: "0.181.0" },
  },
  // @react-three/fiber v8.x requires React 18, three >=0.133
  // Compatible with @react-three/drei v9.x and @react-three/xr v5.x/v6.x
  8: {
    "@react-three/drei": { min: "9.0.0" },
    "@react-three/xr": { min: "5.0.0" },
    react: { max: "19.0.0", min: "18.0.0" },
    "react-dom": { max: "19.0.0", min: "18.0.0" },
    three: { min: "0.133.0" },
  },
  // @react-three/fiber v9.x requires React 19, three >=0.156
  // Compatible with @react-three/drei v10.x and @react-three/xr v6.x
  9: {
    "@react-three/drei": { min: "10.0.0" },
    "@react-three/xr": { min: "6.0.0" },
    react: { min: "19.0.0" },
    "react-dom": { min: "19.0.0" },
    three: { min: "0.156.0" },
  },
};

// Minimum supported fiber version
const minFiberVersion = "8.0.0";

export interface InvalidVersion {
  installedVersion: string;
  name: string;
  requiredVersion: string;
}

function parseVersion(version: string): number[] {
  // Strip leading 'v' if present (e.g., "v1.0.0" -> "1.0.0")
  const cleaned = version.replace(/^v/, "");
  // Handle pre-release versions (e.g., "10.0.0-alpha.1")
  const [mainVersion] = cleaned.split("-");
  return mainVersion.split(".").map((part) => Number.parseInt(part, 10) || 0);
}

function getMajorVersion(version: string): number {
  const parts = parseVersion(version);
  return parts[0] || 0;
}

function compareVersions(a: string, b: string): number {
  const partsA = parseVersion(a);
  const partsB = parseVersion(b);

  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const partA = partsA[i] || 0;
    const partB = partsB[i] || 0;

    if (partA > partB) {
      return 1;
    }
    if (partA < partB) {
      return -1;
    }
  }

  return 0;
}

function isVersionInRange(
  installed: string,
  range: VersionRange,
): { reason: "too_high" | "too_low"; valid: boolean } {
  const minCompare = compareVersions(installed, range.min);

  if (minCompare < 0) {
    return { reason: "too_low", valid: false };
  }

  if (range.max) {
    const maxCompare = compareVersions(installed, range.max);
    if (maxCompare >= 0) {
      return { reason: "too_high", valid: false };
    }
  }

  return { reason: "too_low", valid: true };
}

function formatVersionRange(range: VersionRange): string {
  if (range.max) {
    return `>=${range.min} <${range.max}`;
  }
  return `>=${range.min}`;
}

function getInstalledVersion(packageName: string, cwd: string): string | null {
  const pkgPath = resolvePkgPath(packageName, cwd);
  if (!pkgPath) {
    return null;
  }

  try {
    const pkgJson = JSON.parse(readFileSync(pkgPath, "utf8"));
    return pkgJson.version || null;
  } catch {
    return null;
  }
}

function getVersionRequirements(
  fiberVersion: string | null,
): Record<string, VersionRange> {
  if (!fiberVersion) {
    // Fiber is optional, so don't enforce version requirements if it's not installed
    return {};
  }

  const majorVersion = getMajorVersion(fiberVersion);

  // Use the requirements for the detected major version, or fall back to v8
  return fiberVersionRequirements[majorVersion] || fiberVersionRequirements[8];
}

function checkVersionRequirement(
  packageName: string,
  cwd: string,
  requirements: Record<string, VersionRange>,
): InvalidVersion | null {
  const range = requirements[packageName];
  if (!range) {
    return null;
  }

  const installedVersion = getInstalledVersion(packageName, cwd);
  if (!installedVersion) {
    return null; // Package not installed, will be caught by missing check
  }

  const result = isVersionInRange(installedVersion, range);
  if (!result.valid) {
    return {
      installedVersion,
      name: packageName,
      requiredVersion: formatVersionRange(range),
    };
  }

  return null;
}

function checkFiberVersion(cwd: string): InvalidVersion | null {
  const installedVersion = getInstalledVersion("@react-three/fiber", cwd);
  if (!installedVersion) {
    return null;
  }

  // Check if fiber version is at least the minimum supported
  if (compareVersions(installedVersion, minFiberVersion) < 0) {
    return {
      installedVersion,
      name: "@react-three/fiber",
      requiredVersion: `>=${minFiberVersion}`,
    };
  }

  return null;
}

export function checkMissingDependencies(cwd: string) {
  const missingCore: string[] = [];
  const missingThreeFiberDependencies: string[] = [];
  const missingOptionalThreeFiberDependencies: string[] = [];
  const invalidVersions: InvalidVersion[] = [];

  // First, detect the installed @react-three/fiber version to determine requirements
  const fiberVersion = getInstalledVersion("@react-three/fiber", cwd);
  const requirements = getVersionRequirements(fiberVersion);

  // Check fiber version itself
  const fiberInvalid = checkFiberVersion(cwd);
  if (fiberInvalid) {
    invalidVersions.push(fiberInvalid);
  }

  for (const name of coreReactModules) {
    if (!resolvePkgPath(name, cwd)) {
      missingCore.push(name);
    } else {
      const invalidVersion = checkVersionRequirement(name, cwd, requirements);
      if (invalidVersion) {
        invalidVersions.push(invalidVersion);
      }
    }
  }

  for (const name of threeFiberModules) {
    if (!resolvePkgPath(name, cwd)) {
      missingThreeFiberDependencies.push(name);
    } else if (name !== "@react-three/fiber") {
      // Fiber is checked separately above
      const invalidVersion = checkVersionRequirement(name, cwd, requirements);
      if (invalidVersion) {
        invalidVersions.push(invalidVersion);
      }
    }
  }

  for (const name of optionalThreeFiberModules) {
    if (!resolvePkgPath(name, cwd)) {
      missingOptionalThreeFiberDependencies.push(name);
    } else {
      const invalidVersion = checkVersionRequirement(name, cwd, requirements);
      if (invalidVersion) {
        invalidVersions.push(invalidVersion);
      }
    }
  }

  if (missingThreeFiberDependencies.length === threeFiberModules.length) {
    // All optional dependencies are missing so we ignore them and continue on.
    return {
      category: "react",
      fiberMajorVersion: fiberVersion ? getMajorVersion(fiberVersion) : null,
      invalidVersions,
      optional: [],
      required: missingCore.sort(),
    } as const;
  } else {
    return {
      category: "react-three-fiber",
      fiberMajorVersion: fiberVersion ? getMajorVersion(fiberVersion) : null,
      invalidVersions,
      optional: missingOptionalThreeFiberDependencies,
      required: missingCore.concat(missingThreeFiberDependencies).sort(),
    } as const;
  }
}
