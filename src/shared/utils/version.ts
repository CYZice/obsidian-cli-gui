export function compareVersions(v1: string, v2: string): number {
  if (!v1 || !v2) {
    return 0;
  }

  try {
    const left = v1.split(".").map((part) => parseInt(part, 10) || 0);
    const right = v2.split(".").map((part) => parseInt(part, 10) || 0);

    while (left.length < 3) {
      left.push(0);
    }
    while (right.length < 3) {
      right.push(0);
    }

    for (let index = 0; index < 3; index++) {
      if (left[index] < right[index]) {
        return -1;
      }
      if (left[index] > right[index]) {
        return 1;
      }
    }

    return 0;
  } catch {
    return 0;
  }
}
