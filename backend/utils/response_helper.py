"""
Utility helper functions for common API responses
"""

from typing import Any, Optional, Dict
from fastapi.responses import JSONResponse


def success_response(
    data: Any = None, message: str = "Success", status_code: int = 200
) -> JSONResponse:
    """
    Create a standardized success response

    Args:
        data: Response data payload
        message: Success message
        status_code: HTTP status code

    Returns:
        JSONResponse with standardized format
    """
    return JSONResponse(
        status_code=status_code,
        content={"success": True, "message": message, "data": data},
    )


def error_response(
    message: str = "An error occurred",
    errors: Optional[Dict[str, Any]] = None,
    status_code: int = 400,
) -> JSONResponse:
    """
    Create a standardized error response

    Args:
        message: Error message
        errors: Optional detailed error information
        status_code: HTTP status code

    Returns:
        JSONResponse with standardized error format
    """
    content = {"success": False, "message": message}

    if errors:
        content["errors"] = errors

    return JSONResponse(status_code=status_code, content=content)


def paginated_response(
    items: list,
    total: int,
    page: int = 1,
    page_size: int = 10,
    message: str = "Success",
) -> JSONResponse:
    """
    Create a standardized paginated response

    Args:
        items: List of items for current page
        total: Total number of items
        page: Current page number
        page_size: Number of items per page
        message: Success message

    Returns:
        JSONResponse with pagination metadata
    """
    total_pages = (total + page_size - 1) // page_size

    return JSONResponse(
        status_code=200,
        content={
            "success": True,
            "message": message,
            "data": items,
            "pagination": {
                "total": total,
                "page": page,
                "page_size": page_size,
                "total_pages": total_pages,
                "has_next": page < total_pages,
                "has_prev": page > 1,
            },
        },
    )
