import { ErrorCode } from './errors-list';

const defaultErrorMessages: Partial<Record<ErrorCode, string>> = {
  [ErrorCode.UNAUTHORIZED]: 'Unauthorized',
  [ErrorCode.VALIDATION_ERROR]: 'Invalid Request',
  [ErrorCode.INSUFFICIENT_FUND]: 'Insuficient Point',
  [ErrorCode.ACCOUNT_NOT_FOUND]: 'Account Not Found',
  [ErrorCode.PERM_NOT_FOUND]: 'Group Permission not found',
  [ErrorCode.INVALID_FILE_TYPE]: 'Invalid File Type',
  [ErrorCode.FILE_TOO_LARGE]: 'File too large',
  [ErrorCode.WRONG_PASSWORD]: 'Wrong password',
  [ErrorCode.ACCOUNT_BANNED]: 'Account Banned',
  [ErrorCode.EMAIL_IS_EXIST]: 'Email is existed',
  [ErrorCode.WRONG_RE_PASSWORD]: 'Wrong re password',
};

export function resolveErrorMessage(code: ErrorCode) {
  return defaultErrorMessages[code] ?? ErrorCode[code];
}
