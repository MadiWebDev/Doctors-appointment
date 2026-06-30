import AuditLog from "../Models/auditLogModels.js";

export const auditLogger = (action, actionType, resourceType = "none") => {
  return async (req, res, next) => {
    const originalSend = res.send;

    res.send = function (data) {
      // Log after response is sent
      res.on('finish', async () => {
        try {
          const logData = {
            userId: req.user?._id || null,
            username: req.user?.username || 'anonymous',
            userRole: req.user?.role || 'guest',
            action,
            actionType,
            resourceType,
            resourceId: req.params.id || req.body._id || null,
            details: {
              body: req.body ? JSON.parse(JSON.stringify(req.body)) : {},
              params: req.params,
              query: req.query,
            },
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent'),
            method: req.method,
            endpoint: req.originalUrl,
            status: res.statusCode >= 200 && res.statusCode < 400 ? 'success' : 'failure',
            errorMessage: res.statusCode >= 400 ? data?.message || 'Request failed' : null,
          };

          // Remove sensitive data from details
          if (logData.details.body.password) {
            delete logData.details.body.password;
            delete logData.details.body.confirmPassword;
            delete logData.details.body.oldPassword;
            delete logData.details.body.newPassword;
          }

          await AuditLog.create(logData);
        } catch (error) {
          console.error('Audit logging error:', error);
          // Don't block the request if logging fails
        }
      });

      originalSend.call(this, data);
    };

    next();
  };
};

// Helper function to log custom actions
export const logAction = async (logData) => {
  try {
    await AuditLog.create(logData);
  } catch (error) {
    console.error('Custom audit logging error:', error);
  }
};

export default auditLogger;
