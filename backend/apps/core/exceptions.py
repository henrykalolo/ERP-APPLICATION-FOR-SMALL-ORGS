from rest_framework.exceptions import APIException
from rest_framework import status

class TenantRequiredException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Tenant context is required for this operation.'
    default_code = 'tenant_required'

class TenantInactiveException(APIException):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = 'This tenant account is inactive.'
    default_code = 'tenant_inactive'

class InsufficientPermissionsException(APIException):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = 'You do not have permission to perform this action.'
    default_code = 'insufficient_permissions'

class ValidationException(APIException):
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    default_detail = 'Validation failed.'
    default_code = 'validation_error'

class LockedPeriodException(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = 'Accounting period is locked. Cannot modify entries.'
    default_code = 'locked_period'

class InsufficientBalanceException(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = 'Insufficient balance for this operation.'
    default_code = 'insufficient_balance'