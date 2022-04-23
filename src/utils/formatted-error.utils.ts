import util from 'util';
import { Severity } from '../enums';

export class FormattedError extends Error {
  severity: Severity;

  constructor(...messageArgs: (string | number | string[] | any)[]) {
    super();
    this.name = this.constructor.name;
    this.severity = Severity.error;

    if (messageArgs.length > 0)
      this.message = util.format(...messageArgs);

    Error.captureStackTrace(this, this.constructor);
  }
}
