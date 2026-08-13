namespace Api.Services;

/// <summary>Thrown when a write violates a business/uniqueness rule (mapped to HTTP 409).</summary>
public class ConflictException(string message) : Exception(message);
