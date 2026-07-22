import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class TraceMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const traceId = (req.headers['x-trace-id'] as string) || `trace_${crypto.randomUUID()}`;
    req.headers['x-trace-id'] = traceId;
    res.setHeader('X-Trace-Id', traceId);
    (req as any).traceId = traceId;
    next();
  }
}
