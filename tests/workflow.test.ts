import { describe, it, expect, vi } from "vitest";
import type { WorkflowDefinition, WorkflowSourceDefinition } from "../src/types";

type WorkflowSource = {
  path: string;
  enabled: boolean;
  format: string;
  lastLoadedAt?: number;
  lastError?: string | null;
  workflows?: WorkflowDefinition[];
};

// Simulated getAllWorkflows logic (matches src/plugin/index.ts)
function getAllWorkflows(plugin: { settings: { manualWorkflows: WorkflowDefinition[]; workflowSources: WorkflowSource[] } }): WorkflowDefinition[] {
  const manual = plugin.settings.manualWorkflows || [];
  const imported = plugin.settings.workflowSources
    .filter((s) => s.enabled && s.lastError == null)
    .flatMap((s) => s.workflows || []);
  return [...manual, ...imported];
}

// Validation logic from import.ts
function isValidWorkflow(w: unknown): w is WorkflowDefinition {
  return typeof w === "object" && w !== null && typeof (w as WorkflowDefinition).name === "string" && Array.isArray((w as WorkflowDefinition).steps);
}

describe("Workflow Source System", () => {
  describe("getAllWorkflows aggregation", () => {
    it("should return only manual workflows when no sources", () => {
      const plugin = {
        settings: {
          manualWorkflows: [{ name: "Manual WF", steps: [{ command: "test" }] }],
          workflowSources: [],
        },
      };

      const result = getAllWorkflows(plugin);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Manual WF");
    });

    it("should return only source workflows when no manual", () => {
      const plugin = {
        settings: {
          manualWorkflows: [],
          workflowSources: [{
            path: "source.json",
            enabled: true,
            format: "json",
            workflows: [{ name: "Source WF", steps: [{ command: "test" }] }],
          }],
        },
      };

      const result = getAllWorkflows(plugin);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Source WF");
    });

    it("should combine manual and source workflows", () => {
      const plugin = {
        settings: {
          manualWorkflows: [{ name: "Manual 1", steps: [{ command: "a" }] }],
          workflowSources: [{
            path: "source.json",
            enabled: true,
            format: "json",
            workflows: [{ name: "Source 1", steps: [{ command: "b" }] }],
          }],
        },
      };

      const result = getAllWorkflows(plugin);

      expect(result).toHaveLength(2);
    });

    it("should exclude disabled sources", () => {
      const plugin = {
        settings: {
          manualWorkflows: [],
          workflowSources: [{
            path: "disabled.json",
            enabled: false,
            format: "json",
            workflows: [{ name: "Should Not Appear", steps: [{ command: "test" }] }],
          }],
        },
      };

      const result = getAllWorkflows(plugin);

      expect(result).toHaveLength(0);
    });

    it("should exclude sources with errors", () => {
      const plugin = {
        settings: {
          manualWorkflows: [],
          workflowSources: [{
            path: "error.json",
            enabled: true,
            format: "json",
            lastError: "File not found",
            workflows: [],
          }],
        },
      };

      const result = getAllWorkflows(plugin);

      expect(result).toHaveLength(0);
    });
  });

  describe("WorkflowDefinition validation", () => {
    it("should validate a correct workflow", () => {
      const workflow = { name: "Test", steps: [{ command: "obsidian daily:read" }] };
      expect(isValidWorkflow(workflow)).toBe(true);
    });

    it("should reject workflow without name", () => {
      const workflow = { steps: [{ command: "test" }] };
      expect(isValidWorkflow(workflow)).toBe(false);
    });

    it("should reject workflow without steps", () => {
      const workflow = { name: "Test" };
      expect(isValidWorkflow(workflow)).toBe(false);
    });

    it("should reject null", () => {
      expect(isValidWorkflow(null)).toBe(false);
    });

    it("should reject non-object", () => {
      expect(isValidWorkflow("string")).toBe(false);
      expect(isValidWorkflow(123)).toBe(false);
    });
  });

  describe("Migration logic", () => {
    it("should handle old workflows format", () => {
      const oldData = {
        workflows: [
          { name: "Old WF", steps: [{ command: "test" }] },
        ],
      };

      const settings = {
        manualWorkflows: "workflows" in oldData && !("manualWorkflows" in oldData)
          ? (oldData as { workflows?: WorkflowDefinition[] }).workflows || []
          : [],
        workflowSources: [] as WorkflowSource[],
      };

      expect(settings.manualWorkflows).toHaveLength(1);
      expect(settings.manualWorkflows[0].name).toBe("Old WF");
    });
  });

  describe("WorkflowSourceDefinition interface", () => {
    it("should have correct shape", () => {
      const source: WorkflowSourceDefinition = {
        path: "workflows.json",
        enabled: true,
        format: "json",
        lastLoadedAt: Date.now(),
        lastError: null,
      };

      expect(source.path).toBe("workflows.json");
      expect(source.enabled).toBe(true);
      expect(source.format).toBe("json");
      expect(source.lastLoadedAt).toBeDefined();
      expect(source.lastError).toBeNull();
    });

    it("should allow error state", () => {
      const source: WorkflowSourceDefinition = {
        path: "broken.json",
        enabled: true,
        format: "json",
        lastError: "Invalid JSON syntax",
      };

      expect(source.lastError).toBe("Invalid JSON syntax");
    });
  });
});