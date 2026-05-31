import type { Request, Response, NextFunction } from 'express';
import type { ZodTypeAny, z } from 'zod';

type Where = 'body' | 'query' | 'params';

export function validate<S extends ZodTypeAny>(schema: S, where: Where = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req[where]);
    if (!parsed.success) return next(parsed.error);
    // overwrite with parsed (with defaults applied)
    (req as any)[where] = parsed.data;
    next();
  };
}

export type Infer<S extends ZodTypeAny> = z.infer<S>;
