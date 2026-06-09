export function success(res, data = null, message = "Success", statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function paginated(res, data, pagination, message = "Success") {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
  });
}

export function fail(res, message = "Request failed", statusCode = 400, errors = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}
