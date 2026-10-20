/*
 * ═══════════════════════════════════════════════════════════════
 * 🧬 COGNITIVE AGENT CODE DNA - CIG CERTIFICATION SERVICE
 * ═══════════════════════════════════════════════════════════════
 *
 * 👨‍💻 DEVELOPERS: Minerva Omega Master Supreme + Tulio (ORUS Creator)
 * ⏰ CREATED: 2026-10-06T00:00:00-03:00
 * 🏷️ COMPONENT_HASH: orus.builder.core.cig.certification.20261006.v1
 *
 * ═══════════════════════════════════════════════════════════════
 */

import type { EngineConfig, EngineResult } from '../types/engine-base.types';
import {
  cigProtocol,
  type CIGValidationRequest,
  type CIGValidationResult,
} from './cig-protocol';

export class CIGCertificationService {
  private static instance: CIGCertificationService;

  private constructor() {}

  public static getInstance(): CIGCertificationService {
    if (!CIGCertificationService.instance) {
      CIGCertificationService.instance = new CIGCertificationService();
    }
    return CIGCertificationService.instance;
  }

  public initialize(config: EngineConfig): Promise<unknown> {
    return cigProtocol.initialize(config);
  }

  public start(): Promise<unknown> {
    return cigProtocol.start();
  }

  public stop(): Promise<unknown> {
    return cigProtocol.stop();
  }

  public getMetrics(): unknown {
    return cigProtocol.getMetrics();
  }

  public certify(request: CIGValidationRequest): Promise<EngineResult<CIGValidationResult>> {
    return cigProtocol.validate(request);
  }

  public attemptStructuralAutoFix(code: string, fileName: string) {
    return cigProtocol.attemptStructuralAutoFix(code, fileName);
  }
}

export const cigCertificationService = CIGCertificationService.getInstance();

