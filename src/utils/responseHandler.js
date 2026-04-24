export const sendSuccess = (
  res,
  {
    statusCode = 200,
    message = 'Request completed successfully',
    data = {},
    meta,
  } = {}
) => {
  const payload = {
    success: true,
    message,
    data: data ?? {},
  };

  if (meta) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
};

export const sendPaginated = (
  res,
  {
    statusCode = 200,
    message = 'Request completed successfully',
    data = [],
    page = 1,
    limit = 10,
    total = 0,
  } = {}
) =>
  sendSuccess(res, {
    statusCode,
    message,
    data,
    meta: { page, limit, total },
  });

export const sendError = (
  res,
  {
    statusCode = 500,
    message = 'Internal server error',
    errors = [],
  } = {}
) => {
  const normalizedErrors = Array.isArray(errors)
    ? errors.filter(Boolean)
    : [errors].filter(Boolean);

  return res.status(statusCode).json({
    success: false,
    message,
    data: {},
    errors: normalizedErrors,
  });
};
