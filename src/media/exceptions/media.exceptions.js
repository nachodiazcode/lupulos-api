import { AppError } from '../../utils/errors.js';

export class MediaNotFoundException extends AppError {
  constructor(id) {
    super(`Media '${id}' not found`, 404);
    this.name = 'MediaNotFoundException';
    this.error = 'Not Found';
  }
}

export class MediaProcessingException extends AppError {
  constructor(message, details) {
    super(message || 'Media processing failed', 422);
    this.name = 'MediaProcessingException';
    this.error = 'Unprocessable Entity';
    this.details = details ?? null;
  }
}

export class UnsupportedMediaTypeException extends AppError {
  constructor(type) {
    super(`Media type '${type}' is not supported`, 415);
    this.name = 'UnsupportedMediaTypeException';
    this.error = 'Unsupported Media Type';
  }
}

export class FileTooLargeException extends AppError {
  constructor(mediaType, limitMb) {
    super(`${mediaType} exceeds the maximum allowed size of ${limitMb}MB`, 413);
    this.name = 'FileTooLargeException';
    this.error = 'Payload Too Large';
  }
}
