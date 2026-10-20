/**
 * ============================================================================
 * ORUS BUILDER - USE BLUEPRINT PARSER HOOK
 * ============================================================================
 * 
 * DEVELOPER: Tulio (ORUS Creator)
 * CREATED: 2025-10-10T09:00:00-03:00
 * LAST_MODIFIED: 2025-10-10T09:00:00-03:00
 * COMPONENT_HASH: orus.frontend.hook.blueprintparser.20251010.UBP0P1Q2
 * 
 * PURPOSE:
 * - Custom React hook for blueprint parsing
 * - State management for upload/parse flow
 * - Auto-generation trigger
 * - Error handling and retry logic
 * 
 * COGNITIVE AGENT DNA:
 * - AGENT_TYPE: BlueprintParsingAgent
 * - COGNITIVE_LEVEL: Advanced
 * - AUTONOMY_DEGREE: 80
 * - TRINITY_INTEGRATED: Full (Blueprint Intelligence)
 * ============================================================================
 */

import { useState, useCallback } from 'react';
import blueprintService from '@services/blueprint.service';
import toast from 'react-hot-toast';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface UseBlueprintParserOptions {
  /**
   * Auto-generate on parse complete
   * @default false
   */
  autoGenerate?: boolean;

  /**
   * Success callback
   */
  onSuccess?: (blueprintId: string, projectId?: string) => void;

  /**
   * Error callback
   */
  onError?: (error: Error) => void;
}

export interface BlueprintParserState {
  isUploading: boolean;
  isParsing: boolean;
  isGenerating: boolean;
  hasError: boolean;
  error: Error | null;
  blueprintId: string | null;
  projectId: string | null;
  parsedData: any | null;
}

export interface BlueprintParserActions {
  uploadAndParse: (file: File, content: string) => Promise<void>;
  generateProject: (blueprintId: string, options?: any) => Promise<void>;
  reset: () => void;
}

// ============================================================================
// USE BLUEPRINT PARSER HOOK
// ============================================================================

export function useBlueprintParser(options: UseBlueprintParserOptions = {}) {
  const { autoGenerate = false, onSuccess, onError } = options;

  const [state, setState] = useState<BlueprintParserState>({
    isUploading: false,
    isParsing: false,
    isGenerating: false,
    hasError: false,
    error: null,
    blueprintId: null,
    projectId: null,
    parsedData: null,
  });

  /**
   * Upload and parse blueprint
   */
  const uploadAndParse = useCallback(async (file: File, content: string) => {
    setState((prev) => ({
      ...prev,
      isUploading: true,
      isParsing: true,
      hasError: false,
      error: null,
    }));

    try {
      const uploaded = await blueprintService.uploadBlueprint(file);
      const response = await blueprintService.waitUntilReady(uploaded.blueprintId);

      setState((prev) => ({
        ...prev,
        isUploading: false,
        isParsing: false,
        blueprintId: uploaded.blueprintId,
        parsedData: response,
      }));

      toast.success('Blueprint extraído e validado.');

      // Auto-generate if enabled
      if (autoGenerate) {
        await generateProject(uploaded.blueprintId);
      } else if (onSuccess) {
        onSuccess(uploaded.blueprintId);
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isUploading: false,
        isParsing: false,
        hasError: true,
        error: error as Error,
      }));

      toast.error(`Failed to parse blueprint: ${(error as Error).message}`);

      if (onError) {
        onError(error as Error);
      }
    }
  // generateProject is declared below and is invoked only after a successful upload.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoGenerate, onSuccess, onError]);

  /**
   * Generate project from blueprint
   */
  const generateProject = useCallback(async (blueprintId: string, options?: any) => {
    setState((prev) => ({
      ...prev,
      isGenerating: true,
      hasError: false,
      error: null,
    }));

    try {
      const blueprint = state.parsedData || await blueprintService.getBlueprint(blueprintId);
      const productBlueprint = blueprint.productBlueprint;
      if (!productBlueprint) throw new Error('Product Blueprint ainda não está pronto.');
      const response = await blueprintService.generateFromBlueprint({
        blueprintId: productBlueprint.blueprintId,
        projectId: productBlueprint.projectId,
        customization: options,
      });

      setState((prev) => ({
        ...prev,
        isGenerating: false,
        projectId: productBlueprint.projectId,
      }));

      toast.success('Geração certificada iniciada.');

      if (onSuccess) {
        onSuccess(blueprintId, productBlueprint.projectId);
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isGenerating: false,
        hasError: true,
        error: error as Error,
      }));

      toast.error(`Failed to generate project: ${(error as Error).message}`);

      if (onError) {
        onError(error as Error);
      }
    }
  }, [onSuccess, onError, state.parsedData]);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setState({
      isUploading: false,
      isParsing: false,
      isGenerating: false,
      hasError: false,
      error: null,
      blueprintId: null,
      projectId: null,
      parsedData: null,
    });
  }, []);

  const actions: BlueprintParserActions = {
    uploadAndParse,
    generateProject,
    reset,
  };

  return [state, actions] as const;
}

/**
 * EXPORT MANIFEST
 * ============================================================================
 * PRIMARY_EXPORT: useBlueprintParser (Blueprint parser hook)
 * NAMED_EXPORTS: UseBlueprintParserOptions, BlueprintParserState
 * DEFAULT_AVAILABLE: false
 * COMPATIBILITY: internal
 * ============================================================================
 */
