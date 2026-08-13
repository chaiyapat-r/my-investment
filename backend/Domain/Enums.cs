namespace Api.Domain;

// Stored as strings in the database (see AppDbContext) so raw data stays readable.

public enum Currency { THB, USD }

public enum AccountKind { Cash, FX, Equity, Crypto, Liability }

public enum Scope { Banking, Investment }

public enum Direction { In, Out }

public enum PlanStatus { Active, Completed, Abandoned }
