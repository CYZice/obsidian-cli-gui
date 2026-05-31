import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import type { WorkflowDefinition, ImportedWorkflowFile } from "../src/types";

// Validation logic from import.ts
function isValidWorkflow(w: unknown): w is WorkflowDefinition {
  return typeof w === "object" && w !== null && typeof (w as WorkflowDefinition).name === "string" && Array.isArray((w as WorkflowDefinition).steps);
}

function parseWorkflowFile(content: string): { workflows: WorkflowDefinition[]; error?: string } {
  try {
    const parsed = JSON.parse(content) as ImportedWorkflowFile;
    if (!Array.isArray(parsed.workflows)) {
      return { workflows: [], error: "workflows array expected" };
    }
    const validWorkflows = parsed.workflows.filter(isValidWorkflow);
    return { workflows: validWorkflows };
  } catch {
    return { workflows: [], error: "Invalid JSON" };
  }
}

describe("Real file import test", () => {
  const testFilePath = resolve(__dirname, "../tmp/test-workflows.json");

  it("should read and parse the test JSON file", () => {
    const content = readFileSync(testFilePath, "utf-8");
    expect(content).toBeDefined();
    expect(content.length).toBeGreaterThan(0);
  });

  it("should parse without errors", () => {
    const content = readFileSync(testFilePath, "utf-8");
    const result = parseWorkflowFile(content);

    expect(result.error).toBeUndefined();
    expect(result.workflows).toHaveLength(2);
  });

  it("should validate both workflows", () => {
    const content = readFileSync(testFilePath, "utf-8");
    const result = parseWorkflowFile(content);

    expect(result.workflows[0].name).toBe("测试-批量删除孤立图片");
    expect(result.workflows[0].steps).toHaveLength(2);
    expect(result.workflows[0].steps[0].command).toContain("orphans:folder");

    expect(result.workflows[1].name).toBe("测试-日记备份");
    expect(result.workflows[1].steps).toHaveLength(2);
    expect(result.workflows[1].schedule?.enabled).toBe(false);
  });

  it("should preserve batchMode configuration", () => {
    const content = readFileSync(testFilePath, "utf-8");
    const result = parseWorkflowFile(content);

    const deleteStep = result.workflows[0].steps[1];
    expect(deleteStep.batchMode).toBe(true);
    expect(deleteStep.baseCommand).toBe("obsidian delete");
  });

  it("should preserve usePrev configuration", () => {
    const content = readFileSync(testFilePath, "utf-8");
    const result = parseWorkflowFile(content);

    const backupStep = result.workflows[1].steps[1];
    expect(backupStep.usePrev).toBe(true);
  });

  it("should preserve schedule configuration", () => {
    const content = readFileSync(testFilePath, "utf-8");
    const result = parseWorkflowFile(content);

    const scheduledWf = result.workflows[1];
    expect(scheduledWf.schedule).toBeDefined();
    expect(scheduledWf.schedule?.type).toBe("daily");
    expect(scheduledWf.schedule?.time).toBe("23:00");
  });
});